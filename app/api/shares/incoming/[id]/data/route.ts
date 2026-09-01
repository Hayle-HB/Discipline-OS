import {
  getIncomingShareDataFallback,
  proxyShareRoute,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proxied = await proxyShareRoute(
    `/api/shares/incoming/${id}/data`,
    request,
    { method: "GET" }
  );
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return getIncomingShareDataFallback(request, id);
}
