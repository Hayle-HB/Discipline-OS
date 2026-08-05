/**
 * Data source configuration.
 *
 * Demo mode (default): reads from data/demo.json
 * API mode: set DISCIPLINE_OS_DATA_SOURCE=api and provide DISCIPLINE_OS_API_KEY
 */
export const DATA_CONFIG = {
  /** "json" = local demo file | "api" = external API with key */
  source: (process.env.DISCIPLINE_OS_DATA_SOURCE ?? "json") as "json" | "api",

  /** Server-only API key for external Discipline OS data API */
  apiKey: process.env.DISCIPLINE_OS_API_KEY ?? "",

  /** Base URL for external data API (when source is "api") */
  apiUrl: process.env.DISCIPLINE_OS_API_URL ?? "",

  /** Header name sent with API key requests */
  apiKeyHeader: "X-API-Key",
} as const;

export function isApiDataSource(): boolean {
  return DATA_CONFIG.source === "api" && DATA_CONFIG.apiKey.length > 0;
}

export function assertApiConfig(): void {
  if (!DATA_CONFIG.apiKey) {
    throw new Error(
      "DISCIPLINE_OS_API_KEY is required when DISCIPLINE_OS_DATA_SOURCE=api"
    );
  }
  if (!DATA_CONFIG.apiUrl) {
    throw new Error(
      "DISCIPLINE_OS_API_URL is required when DISCIPLINE_OS_DATA_SOURCE=api"
    );
  }
}
