import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

process.env.TGSTAT_TOKEN = "test-tgstat-token-123";

function mockOk(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function mockError(status: number, body = "") {
  return {
    ok: false,
    status,
    statusText: "Error",
    text: () => Promise.resolve(body),
  };
}

// ─── search_channels ───

describe("search_channels", () => {
  beforeEach(() => mockFetch.mockReset());

  it("returns search results", async () => {
    const { handleSearchChannels } = await import("../tools/channels.js");
    const payload = { status: "ok", response: { items: [{ id: "123", title: "Tech News", participants_count: 50000 }], count: 1 } };
    mockFetch.mockResolvedValueOnce(mockOk(payload));

    const result = JSON.parse(await handleSearchChannels({ query: "tech" }));
    expect(result.response.items).toHaveLength(1);
    expect(result.response.items[0].title).toBe("Tech News");

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/channels/search");
    expect(url).toContain("q=tech");
  });

  it("passes language filter", async () => {
    const { handleSearchChannels } = await import("../tools/channels.js");
    mockFetch.mockResolvedValueOnce(mockOk({ status: "ok", response: { items: [], count: 0 } }));

    await handleSearchChannels({ query: "маркетинг", language: "ru" });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("language=ru");
  });
});

// ─── get_channel ───

describe("get_channel", () => {
  beforeEach(() => mockFetch.mockReset());

  it("fetches channel by ID", async () => {
    const { handleGetChannel } = await import("../tools/channels.js");
    const payload = { status: "ok", response: { id: "456", title: "My Channel", participants_count: 10000 } };
    mockFetch.mockResolvedValueOnce(mockOk(payload));

    const result = JSON.parse(await handleGetChannel({ channel_id: "@mychannel" }));
    expect(result.response.participants_count).toBe(10000);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("channelId=%40mychannel");
  });
});

// ─── get_channel_posts ───

describe("get_channel_posts", () => {
  beforeEach(() => mockFetch.mockReset());

  it("fetches posts with limit", async () => {
    const { handleGetChannelPosts } = await import("../tools/posts.js");
    const payload = { status: "ok", response: { items: [{ id: "1/100", views: 5000 }], count: 1 } };
    mockFetch.mockResolvedValueOnce(mockOk(payload));

    const result = JSON.parse(await handleGetChannelPosts({ channel_id: "@test", limit: 10 }));
    expect(result.response.items).toHaveLength(1);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("limit=10");
  });
});

// ─── get_post ───

describe("get_post", () => {
  beforeEach(() => mockFetch.mockReset());

  it("fetches post details", async () => {
    const { handleGetPost } = await import("../tools/posts.js");
    mockFetch.mockResolvedValueOnce(mockOk({ status: "ok", response: { id: "123/456", views: 10000, forwards: 50 } }));

    const result = JSON.parse(await handleGetPost({ post_id: "123/456" }));
    expect(result.response.views).toBe(10000);
    expect(result.response.forwards).toBe(50);
  });
});

// ─── search_posts ───

describe("search_posts", () => {
  beforeEach(() => mockFetch.mockReset());

  it("searches posts with date range", async () => {
    const { handleSearchPosts } = await import("../tools/posts.js");
    mockFetch.mockResolvedValueOnce(mockOk({ status: "ok", response: { items: [], count: 0 } }));

    await handleSearchPosts({
      query: "AI новости",
      date_from: "2026-01-01",
      date_to: "2026-01-31",
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/posts/search");
    expect(url).toContain("startDate=2026-01-01");
  });
});

// ─── compare_channels ───

describe("compare_channels", () => {
  beforeEach(() => mockFetch.mockReset());

  it("fetches multiple channels for comparison", async () => {
    const { handleCompareChannels } = await import("../tools/channels.js");
    mockFetch.mockResolvedValueOnce(mockOk({ status: "ok", response: { id: "1", participants_count: 1000 } }));
    mockFetch.mockResolvedValueOnce(mockOk({ status: "ok", response: { id: "2", participants_count: 2000 } }));

    const result = JSON.parse(await handleCompareChannels({ channel_ids: ["@ch1", "@ch2"] }));
    expect(result.channels).toHaveLength(2);
  });
});

// ─── Error handling ───

describe("error handling", () => {
  beforeEach(() => mockFetch.mockReset());

  it("throws on missing token", async () => {
    const saved = process.env.TGSTAT_TOKEN;
    delete process.env.TGSTAT_TOKEN;

    const { apiGet } = await import("../client.js");
    await expect(apiGet("/test")).rejects.toThrow("TGSTAT_TOKEN");

    process.env.TGSTAT_TOKEN = saved;
  });

  it("throws on HTTP 4xx errors", async () => {
    const { handleSearchChannels } = await import("../tools/channels.js");
    mockFetch.mockResolvedValueOnce(mockError(429, "Rate limit"));

    await expect(handleSearchChannels({ query: "test" })).rejects.toThrow("HTTP 429");
  });
});

// ─── Auth token ───

describe("auth token", () => {
  beforeEach(() => mockFetch.mockReset());

  it("sends token as query parameter", async () => {
    const { handleSearchChannels } = await import("../tools/channels.js");
    mockFetch.mockResolvedValueOnce(mockOk({ status: "ok", response: { items: [] } }));

    await handleSearchChannels({ query: "test" });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("token=test-tgstat-token-123");
  });
});
