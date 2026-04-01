import { z } from "zod";
import { apiGet } from "../client.js";

export const searchChannelsSchema = z.object({
  query: z.string().describe("Поисковый запрос"),
  category: z.string().optional().describe("Категория канала"),
  language: z.string().optional().describe("Язык: ru, en, etc."),
  country: z.string().optional().describe("Страна: ru, ua, by, etc."),
  limit: z.number().optional().describe("Максимум результатов (по умолчанию 20)"),
});

export async function handleSearchChannels(params: z.infer<typeof searchChannelsSchema>): Promise<string> {
  const queryParams: Record<string, string> = {
    q: params.query,
    limit: String(params.limit ?? 20),
  };
  if (params.category) queryParams.category = params.category;
  if (params.language) queryParams.language = params.language;
  if (params.country) queryParams.country = params.country;

  const data = await apiGet("/channels/search", queryParams);
  return JSON.stringify(data, null, 2);
}

export const getChannelSchema = z.object({
  channel_id: z.string().describe("ID или username канала (например @channel или t.me/channel)"),
});

export async function handleGetChannel(params: z.infer<typeof getChannelSchema>): Promise<string> {
  const data = await apiGet("/channels/get", {
    channelId: params.channel_id,
  });
  return JSON.stringify(data, null, 2);
}

export const getChannelStatsSchema = z.object({
  channel_id: z.string().describe("ID или username канала"),
});

export async function handleGetChannelStats(params: z.infer<typeof getChannelStatsSchema>): Promise<string> {
  const data = await apiGet("/channels/stat", {
    channelId: params.channel_id,
  });
  return JSON.stringify(data, null, 2);
}

export const getChannelMentionsSchema = z.object({
  channel_id: z.string().describe("ID или username канала"),
  limit: z.number().optional().describe("Максимум результатов (по умолчанию 50)"),
});

export async function handleGetChannelMentions(params: z.infer<typeof getChannelMentionsSchema>): Promise<string> {
  const data = await apiGet("/channels/mentions", {
    channelId: params.channel_id,
    limit: String(params.limit ?? 50),
  });
  return JSON.stringify(data, null, 2);
}

export const compareChannelsSchema = z.object({
  channel_ids: z.array(z.string()).describe("Массив ID/username каналов для сравнения"),
});

export async function handleCompareChannels(params: z.infer<typeof compareChannelsSchema>): Promise<string> {
  // TGStat compare requires fetching each channel and combining
  const results = await Promise.all(
    params.channel_ids.map(async (channelId) => {
      const data = await apiGet("/channels/get", { channelId });
      return data;
    })
  );
  return JSON.stringify({ channels: results }, null, 2);
}
