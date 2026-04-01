const BASE_URL = "https://api.tgstat.ru";
const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

function getToken(): string {
  const token = process.env.TGSTAT_TOKEN;
  if (!token) {
    throw new Error("Переменная окружения TGSTAT_TOKEN не задана");
  }
  return token;
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      if (response.ok) return response;

      if (response.status >= 500 && attempt < retries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[tgstat-mcp] ${response.status} от ${url}, повтор через ${delay}мс (${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${response.statusText}. ${body}`);
    } catch (error) {
      clearTimeout(timer);
      if (attempt === retries) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error(`[tgstat-mcp] Таймаут ${url}, повтор (${attempt}/${retries})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Все попытки исчерпаны");
}

export async function apiGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("token", getToken());
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") url.searchParams.set(key, val);
  }
  const response = await fetchWithRetry(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export async function apiPost(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("token", getToken());
  const response = await fetchWithRetry(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response.json();
}
