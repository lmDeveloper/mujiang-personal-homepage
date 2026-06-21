export type AiNewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  date: string;
  language: "zh" | "en";
  tags: string[];
};
