import {
  proxyShareRoute,
  revokeShareFallback,
  shouldUseShareFallback,
  updateShareFallback,
} from "@/lib/api/share-fallback";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bodyText = await request.text();
  const proxied = await proxyShareRoute(`/api/shares/${id}`, request, {
    method: "PATCH",
    body: bodyText,
  });
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return updateShareFallback(request, id, bodyText);
}

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
