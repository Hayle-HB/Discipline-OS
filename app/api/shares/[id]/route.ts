import {
  proxyShareRoute,
  revokeShareFallback,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proxied = await proxyShareRoute(`/api/shares/${id}`, request, {
    method: "DELETE",
  });
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return revokeShareFallback(request, id);
}
