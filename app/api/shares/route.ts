import {
  createShareFallback,
  listSharesFallback,
  proxyShareRoute,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function GET(request: Request) {
  const proxied = await proxyShareRoute("/api/shares", request, { method: "GET" });
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return listSharesFallback(request);
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const proxied = await proxyShareRoute("/api/shares", request, {
    method: "POST",
    body: bodyText,
  });
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return createShareFallback(request, bodyText);
}
