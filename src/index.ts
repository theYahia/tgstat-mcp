#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { searchChannelsSchema, handleSearchChannels, getChannelSchema, handleGetChannel, getChannelStatsSchema, handleGetChannelStats, getChannelMentionsSchema, handleGetChannelMentions, compareChannelsSchema, handleCompareChannels } from "./tools/channels.js";
import { getChannelPostsSchema, handleGetChannelPosts, getPostSchema, handleGetPost, searchPostsSchema, handleSearchPosts } from "./tools/posts.js";

const server = new McpServer({
  name: "tgstat-mcp",
  version: "1.0.0",
});

server.tool(
  "search_channels",
  "Поиск Telegram-каналов по запросу с фильтрацией по категории, языку, стране.",
  searchChannelsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleSearchChannels(params) }],
  }),
);

server.tool(
  "get_channel",
  "Информация о Telegram-канале: подписчики, средние просмотры, ERR.",
  getChannelSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetChannel(params) }],
  }),
);

server.tool(
  "get_channel_posts",
  "Последние посты Telegram-канала с метриками просмотров.",
  getChannelPostsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetChannelPosts(params) }],
  }),
);

server.tool(
  "get_post",
  "Детальная информация о посте: просмотры, репосты, реакции.",
  getPostSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetPost(params) }],
  }),
);

server.tool(
  "get_channel_stats",
  "Статистика канала: рост подписчиков, динамика просмотров.",
  getChannelStatsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetChannelStats(params) }],
  }),
);

server.tool(
  "search_posts",
  "Поиск постов по ключевым словам с фильтрацией по каналам и датам.",
  searchPostsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleSearchPosts(params) }],
  }),
);

server.tool(
  "get_channel_mentions",
  "Упоминания канала в других каналах и чатах.",
  getChannelMentionsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleGetChannelMentions(params) }],
  }),
);

server.tool(
  "compare_channels",
  "Сравнение нескольких Telegram-каналов по подписчикам, просмотрам, ERR.",
  compareChannelsSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleCompareChannels(params) }],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[tgstat-mcp] Сервер запущен. 8 инструментов. Требуется TGSTAT_TOKEN.");
}

main().catch((error) => {
  console.error("[tgstat-mcp] Ошибка запуска:", error);
  process.exit(1);
});
