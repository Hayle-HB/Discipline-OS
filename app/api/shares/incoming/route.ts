import {
  listIncomingSharesFallback,
  proxyShareRoute,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function GET(request: Request) {
  const proxied = await proxyShareRoute("/api/shares/incoming", request, {
    method: "GET",
  });
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return listIncomingSharesFallback(request);
}
