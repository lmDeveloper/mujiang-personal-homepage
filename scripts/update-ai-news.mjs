import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const outputPath = path.resolve("public/data/ai-news.json");
const maxDays = Number.parseInt(process.env.AI_NEWS_RETENTION_DAYS ?? "30", 10);
const maxItemsPerRun = Number.parseInt(process.env.AI_NEWS_MAX_ITEMS ?? "36", 10);

const sources = [
  {
    url: "https://news.google.com/rss/search?q=AI%20OR%20artificial%20intelligence%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
    language: "en",
    fallbackSource: "Google News",
  },
  {
    url: "https://news.google.com/rss/search?q=%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD%20OR%20AI%20when%3A2d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
    language: "zh",
    fallbackSource: "Google 新闻",
  },
  {
    url: "https://openai.com/news/rss.xml",
    language: "en",
    fallbackSource: "OpenAI",
  },
];

const decodeEntities = (value = "") =>
  value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();

const stripHtml = (value = "") =>
  decodeEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
};

const getSummary = (itemXml) => {
  const raw =
    getTag(itemXml, "description") ||
    getTag(itemXml, "content:encoded") ||
    getTag(itemXml, "summary");
  const summary = stripHtml(raw);
  return summary.length > 220 ? `${summary.slice(0, 217)}...` : summary;
};

const getSource = (itemXml, fallbackSource) => {
  const source = getTag(itemXml, "source");
  if (source) return stripHtml(source);

  const creator = getTag(itemXml, "dc:creator");
  if (creator) return stripHtml(creator);

  return fallbackSource;
};

const normalizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("utm_source");
    parsed.searchParams.delete("utm_medium");
    parsed.searchParams.delete("utm_campaign");
    return parsed.toString();
  } catch {
    return url;
  }
};

const getTags = (title, language) => {
  const lower = title.toLowerCase();
  const tags = new Set(["AI"]);

  if (lower.includes("agent") || title.includes("智能体")) tags.add("Agent");
  if (lower.includes("model") || title.includes("模型")) tags.add(language === "zh" ? "模型" : "Model");
  if (lower.includes("workflow") || title.includes("工作流")) tags.add(language === "zh" ? "工作流" : "Workflow");
  if (lower.includes("data") || title.includes("数据")) tags.add(language === "zh" ? "数据" : "Data");

  return Array.from(tags).slice(0, 4);
};

const toItem = (itemXml, sourceConfig) => {
  const title = stripHtml(getTag(itemXml, "title"));
  const url = normalizeUrl(stripHtml(getTag(itemXml, "link")));
  const publishedRaw =
    getTag(itemXml, "pubDate") ||
    getTag(itemXml, "published") ||
    getTag(itemXml, "updated");
  const publishedAt = Number.isNaN(new Date(publishedRaw).getTime())
    ? new Date().toISOString()
    : new Date(publishedRaw).toISOString();
  const date = publishedAt.slice(0, 10);
  const id = createHash("sha1").update(`${title}${url}`).digest("hex").slice(0, 16);

  if (!title || !url) return null;

  return {
    id,
    title,
    summary: getSummary(itemXml) || "No summary provided by the source feed.",
    source: getSource(itemXml, sourceConfig.fallbackSource),
    url,
    publishedAt,
    date,
    language: sourceConfig.language,
    tags: getTags(title, sourceConfig.language),
  };
};

const fetchSource = async (sourceConfig) => {
  const response = await fetch(sourceConfig.url, {
    headers: {
      "user-agent": "MujiangPersonalHomepage/1.0 (+https://github.com/)",
      accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`${sourceConfig.fallbackSource} returned ${response.status}`);
  }

  const xml = await response.text();
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  const entryMatches = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  return [...itemMatches, ...entryMatches]
    .map((itemXml) => toItem(itemXml, sourceConfig))
    .filter(Boolean);
};

const readExisting = async () => {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    return [];
  }
};

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - maxDays);

const existing = await readExisting();
const fetched = [];
const errors = [];

for (const source of sources) {
  try {
    fetched.push(...(await fetchSource(source)));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
}

const byId = new Map();
for (const item of [...fetched, ...existing]) {
  if (new Date(item.publishedAt) < cutoff) continue;
  if (!byId.has(item.id)) byId.set(item.id, item);
}

const nextItems = Array.from(byId.values())
  .sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
  .slice(0, maxItemsPerRun);

if (nextItems.length === 0 && existing.length > 0) {
  console.warn("No fresh items fetched; keeping existing data.");
  process.exit(0);
}

await writeFile(`${outputPath}.tmp`, `${JSON.stringify(nextItems, null, 2)}\n`);
await rename(`${outputPath}.tmp`, outputPath);

if (errors.length) {
  console.warn(`Completed with source errors: ${errors.join("; ")}`);
}

console.log(`Wrote ${nextItems.length} AI news items to ${outputPath}.`);
