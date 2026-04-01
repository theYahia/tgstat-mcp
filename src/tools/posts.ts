import { z } from "zod";
import { apiGet } from "../client.js";

export const getChannelPostsSchema = z.object({
  channel_id: z.string().describe("ID или username канала"),
  limit: z.number().optional().describe("Количество постов (по умолчанию 20)"),
  offset: z.number().optional().describe("Смещение для пагинации"),
});

export async function handleGetChannelPosts(params: z.infer<typeof getChannelPostsSchema>): Promise<string> {
  const queryParams: Record<string, string> = {
    channelId: params.channel_id,
    limit: String(params.limit ?? 20),
  };
  if (params.offset !== undefined) queryParams.offset = String(params.offset);

  const data = await apiGet("/channels/posts", queryParams);
  return JSON.stringify(data, null, 2);
}

export const getPostSchema = z.object({
  post_id: z.string().describe("ID поста (формат channelId/messageId)"),
});

export async function handleGetPost(params: z.infer<typeof getPostSchema>): Promise<string> {
  const data = await apiGet("/posts/get", {
    postId: params.post_id,
  });
  return JSON.stringify(data, null, 2);
}

export const searchPostsSchema = z.object({
  query: z.string().describe("Поисковый запрос по постам"),
  channels: z.array(z.string()).optional().describe("Ограничить поиск каналами"),
  date_from: z.string().optional().describe("Дата начала YYYY-MM-DD"),
  date_to: z.string().optional().describe("Дата окончания YYYY-MM-DD"),
  limit: z.number().optional().describe("Максимум результатов (по умолчанию 20)"),
});

export async function handleSearchPosts(params: z.infer<typeof searchPostsSchema>): Promise<string> {
  const queryParams: Record<string, string> = {
    q: params.query,
    limit: String(params.limit ?? 20),
  };
  if (params.channels) queryParams.peerType = params.channels.join(",");
  if (params.date_from) queryParams.startDate = params.date_from;
  if (params.date_to) queryParams.endDate = params.date_to;

  const data = await apiGet("/posts/search", queryParams);
  return JSON.stringify(data, null, 2);
}
