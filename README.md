# @theyahia/tgstat-mcp

MCP-сервер для TGStat API — аналитика Telegram-каналов, поиск, посты, статистика, упоминания, сравнение. 8 инструментов.

[![npm](https://img.shields.io/npm/v/@theyahia/tgstat-mcp)](https://www.npmjs.com/package/@theyahia/tgstat-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "tgstat": {
      "command": "npx",
      "args": ["-y", "@theyahia/tgstat-mcp"],
      "env": {
        "TGSTAT_TOKEN": "ваш_токен"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add tgstat -e TGSTAT_TOKEN=ваш_токен -- npx -y @theyahia/tgstat-mcp
```

## Авторизация

`TGSTAT_TOKEN` — API-ключ TGStat.

## Инструменты (8)

| Инструмент | Описание |
|------------|----------|
| `search_channels` | Поиск каналов по запросу, категории, языку, стране |
| `get_channel` | Информация о канале: подписчики, средние просмотры, ERR |
| `get_channel_posts` | Последние посты канала |
| `get_post` | Детали поста: просмотры, репосты, реакции |
| `get_channel_stats` | Статистика канала: рост, динамика просмотров |
| `search_posts` | Поиск постов по ключевым словам |
| `get_channel_mentions` | Упоминания канала |
| `compare_channels` | Сравнение каналов по метрикам |

## Примеры запросов

```
Найди Telegram-каналы про маркетинг на русском
Какая статистика у @durov? Подписчики, просмотры, ERR?
Покажи последние 10 постов канала @vc_ru
Сравни каналы @rbc_news и @kommersant
Найди посты про AI за последний месяц
Кто упоминает канал @thebell_io?
```

## Лицензия

MIT
