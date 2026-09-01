import {
  getIncomingShareFallback,
  proxyShareRoute,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proxied = await proxyShareRoute(
    `/api/shares/incoming/${id}`,
    request,
    { method: "GET" }
  );
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return getIncomingShareFallback(request, id);
}
