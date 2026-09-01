import {
  getSharePreviewFallback,
  proxyShareRoute,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const proxied = await proxyShareRoute(
    `/api/shares/access/${encodeURIComponent(token)}`,
    request,
    { method: "GET" }
  );
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return getSharePreviewFallback(request, token);
}
