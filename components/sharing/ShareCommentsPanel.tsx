"use client";

import { Loader2, MessageCircle, Reply, Send, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDashboardUser } from "@/components/dashboard/DashboardLayoutClient";
import { Button } from "@/components/ui/button";
import { createShareComment, listShareComments } from "@/lib/api/shares";
import { ApiError } from "@/lib/api/types";
import type { ShareComment } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface ShareCommentsPanelProps {
  shareId: string;
  partnerName: string;
}

interface CommentNode extends ShareComment {
  replies: CommentNode[];
}

function buildCommentTree(comments: ShareComment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, replies: [] });
  }

  const roots: CommentNode[] = [];
  for (const comment of comments) {
    const node = nodes.get(comment.id)!;
    if (comment.parentId && nodes.has(comment.parentId)) {
      nodes.get(comment.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function formatCommentTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ShareCommentsPanel({
  shareId,
  partnerName,
}: ShareCommentsPanelProps) {
  const user = useDashboardUser();
  const [comments, setComments] = useState<ShareComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ShareComment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadComments = useCallback(async () => {
    try {
      setComments(await listShareComments(shareId));
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load comments."
      );
    } finally {
      setIsLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [comments, isLoading]);

  async function submitMessage() {
    const body = draft.trim();
    if (!body || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createShareComment(shareId, {
        body,
        ...(replyTo ? { parentId: replyTo.id } : {}),
      });
      setComments((current) => [...current, created]);
      setDraft("");
      setReplyTo(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not post comment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await submitMessage();
  }

  function renderComment(node: CommentNode, depth = 0) {
    const isOwn = node.authorId === user.id;

    return (
      <li
        key={node.id}
        className={cn(
          "flex flex-col",
          isOwn ? "items-end" : "items-start",
          depth > 0 && (isOwn ? "mr-4 sm:mr-8" : "ml-4 sm:ml-8")
        )}
      >
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[75%] sm:px-3.5 sm:py-2.5",
            isOwn
              ? "rounded-br-md bg-foreground text-background"
              : "rounded-bl-md bg-secondary/70 text-foreground"
          )}
        >
          {!isOwn && depth === 0 && (
            <p className="mb-0.5 text-[11px] font-semibold text-foreground/80">
              {node.authorName}
            </p>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{node.body}</p>
          <time
            className={cn(
              "mt-1 block text-[10px] tabular-nums",
              isOwn ? "text-background/60" : "text-muted-foreground"
            )}
            dateTime={node.createdAt}
          >
            {formatCommentTime(node.createdAt)}
          </time>
        </div>

        <button
          type="button"
          onClick={() => setReplyTo(node)}
          className="mt-1 inline-flex items-center gap-1 px-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Reply className="size-3" aria-hidden="true" />
          Reply
        </button>

        {node.replies.length > 0 && (
          <ul className="mt-2 flex w-full flex-col gap-2.5">
            {node.replies.map((reply) => renderComment(reply, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border/60 px-4 py-2.5 sm:px-5">
        <p className="text-xs text-muted-foreground">
          Chat with {partnerName} about their progress — both of you can comment and reply.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4"
      >
        {isLoading ? (
          <div className="flex h-full min-h-[200px] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading messages…
          </div>
        ) : tree.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-4 text-center">
            <MessageCircle className="size-7 text-muted-foreground/50" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-foreground">No messages yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Say hi to {partnerName} — your conversation appears here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 pb-1">{tree.map((node) => renderComment(node))}</ul>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border/60 bg-card/60 px-3 py-3 sm:px-4"
      >
        {replyTo && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-xs">
            <span className="min-w-0 truncate text-muted-foreground">
              Replying to{" "}
              <strong className="font-medium text-foreground">{replyTo.authorName}</strong>
            </span>
            <button
              type="button"
              aria-label="Cancel reply"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setReplyTo(null)}
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mb-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitMessage();
              }
            }}
            placeholder={`Message ${partnerName}…`}
            rows={1}
            maxLength={2000}
            disabled={isSubmitting}
            className="max-h-24 min-h-[2.5rem] flex-1 resize-none rounded-2xl border border-border/60 bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/15"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSubmitting || !draft.trim()}
            className="size-10 shrink-0 rounded-full"
            aria-label={replyTo ? "Send reply" : "Send message"}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
