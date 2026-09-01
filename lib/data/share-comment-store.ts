import type { ShareComment } from "@/lib/data/types";

const commentsByThread = new Map<string, ShareComment[]>();

export function makeCommentThreadKey(userAId: string, userBId: string) {
  return [userAId, userBId].sort().join(":");
}

export function listCommentsForThread(threadKey: string): ShareComment[] {
  return [...(commentsByThread.get(threadKey) ?? [])];
}

export function addCommentToThread(
  threadKey: string,
  comment: ShareComment
): ShareComment {
  const current = commentsByThread.get(threadKey) ?? [];
  commentsByThread.set(threadKey, [...current, comment]);
  return comment;
}
