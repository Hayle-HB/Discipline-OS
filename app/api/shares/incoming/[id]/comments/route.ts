import {
  listShareCommentsFallback,
  postShareCommentFallback,
  proxyShareRoute,
  shouldUseShareFallback,
} from "@/lib/api/share-fallback";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proxied = await proxyShareRoute(
    `/api/shares/incoming/${id}/comments`,
    request,
    { method: "GET" }
  );
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return listShareCommentsFallback(request, id);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bodyText = await request.text();
  const proxied = await proxyShareRoute(
    `/api/shares/incoming/${id}/comments`,
    request,
    { method: "POST", body: bodyText }
  );
  if (!(await shouldUseShareFallback(proxied))) return proxied!;
  return postShareCommentFallback(request, id, bodyText);
}
