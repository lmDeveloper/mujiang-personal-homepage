<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import heroVisualUrl from "./assets/mujiang-avatar.png";
import type { AiNewsItem } from "./types";

type NewsGroup = {
  date: string;
  label: string;
  items: AiNewsItem[];
};

const news = ref<AiNewsItem[]>([]);
const isLoadingNews = ref(true);
const newsError = ref("");

const links = [
  { label: "GitHub", url: "" },
  { label: "Blog", url: "" },
  { label: "Email", url: "" },
].filter((link) => link.url);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const groupedNews = computed<NewsGroup[]>(() => {
  const groups = new Map<string, AiNewsItem[]>();

  for (const item of news.value) {
    const items = groups.get(item.date) ?? [];
    items.push(item);
    groups.set(item.date, items);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      label: formatDate(date),
      items: items.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      ),
    }));
});

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/ai-news.json`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    news.value = await response.json();
  } catch (error) {
    newsError.value = error instanceof Error ? error.message : "Unknown error";
  } finally {
    isLoadingNews.value = false;
  }
});
</script>

<template>
  <main class="shell">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow">Developer Card / AI Workflow Lab</p>
        <h1 id="hero-title">木匠</h1>
        <p class="title-line">软件开发者 · 大数据专家 · AI 方向研究人员</p>
        <p class="title-line en">
          Software developer, big data expert, and AI research practitioner.
        </p>
        <p class="intro">
          拥抱 AI，使用 AI 重塑业务工作流，提升生产力和工作效率。
        </p>
        <p class="intro en">
          I use AI to reshape business workflows and turn complex systems into
          faster, sharper, more productive work.
        </p>

        <div class="keyword-row" aria-label="keywords">
          <span>Vue</span>
          <span>AI</span>
          <span>网页资讯</span>
          <span>Big Data</span>
        </div>

        <div class="action-row">
          <a class="primary-action" href="#ai-news">查看 AI 热点</a>
          <a class="ghost-action" href="#about">About</a>
          <a
            v-for="link in links"
            :key="link.label"
            class="ghost-action"
            :href="link.url"
            target="_blank"
            rel="noreferrer"
          >
            {{ link.label }}
          </a>
        </div>
      </div>

      <div class="hero-visual" aria-label="木匠 AI 数字工坊主视觉">
        <img :src="heroVisualUrl" alt="木匠的 AI 数据工坊主视觉" />
        <div class="signal-card">
          <span class="signal-dot"></span>
          <span>AI signals curated daily</span>
        </div>
      </div>
    </section>

    <section id="ai-news" class="section news-section" aria-labelledby="news-title">
      <div class="section-heading">
        <p class="eyebrow">Daily AI Radar</p>
        <h2 id="news-title">AI 热点新闻</h2>
        <p>
          自动聚合中英 AI 资讯，按日期归档展示。新闻来自公开 RSS，不依赖浏览器实时搜索。
        </p>
      </div>

      <div v-if="isLoadingNews" class="state-panel">正在加载今日 AI 信号...</div>
      <div v-else-if="newsError" class="state-panel">
        新闻暂时不可用：{{ newsError }}
      </div>
      <div v-else-if="!groupedNews.length" class="state-panel">
        暂无新闻数据，GitHub Actions 首次运行后会自动填充。
      </div>
      <div v-else class="news-timeline">
        <article v-for="group in groupedNews" :key="group.date" class="day-group">
          <div class="day-label">
            <time :datetime="group.date">{{ group.label }}</time>
            <span>{{ group.items.length }} items</span>
          </div>

          <div class="news-grid">
            <a
              v-for="item in group.items"
              :key="item.id"
              class="news-card"
              :href="item.url"
              target="_blank"
              rel="noreferrer"
            >
              <div class="news-meta">
                <span>{{ item.source }}</span>
                <span>{{ formatTime(item.publishedAt) }}</span>
                <span>{{ item.language.toUpperCase() }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
              <div class="tag-row">
                <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
              </div>
            </a>
          </div>
        </article>
      </div>
    </section>

    <section id="about" class="section about-section" aria-labelledby="about-title">
      <div class="section-heading">
        <p class="eyebrow">About</p>
        <h2 id="about-title">把技术变成可运行的业务生产力</h2>
      </div>
      <div class="about-grid">
        <p>
          木匠关注软件工程、大数据系统与 AI 应用落地。相比追逐概念，更在意模型、
          数据、流程和人的协作关系如何真正提升业务速度。
        </p>
        <p>
          Mujiang works where software engineering, big data systems, and AI
          meet practical workflows. The focus is simple: make complex work
          clearer, faster, and easier to repeat.
        </p>
      </div>
    </section>
  </main>
</template>
