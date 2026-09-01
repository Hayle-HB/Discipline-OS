import {
  proxyShareRoute,
  respondReciprocalShareFallback,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bodyText = await request.text();
  const proxied = await proxyShareRoute(
    `/api/shares/incoming/${id}/reciprocal`,
    request,
    { method: "POST", body: bodyText }
  );
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return respondReciprocalShareFallback(request, id, bodyText);
}
