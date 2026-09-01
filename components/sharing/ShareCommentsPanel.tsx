"use client";

import { Loader2, MessageCircle, Reply, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

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

  function renderComment(node: CommentNode, depth = 0) {
    const isOwn = node.authorId === user.id;

    return (
      <li key={node.id} className={cn(depth > 0 && "ml-4 border-l border-border/50 pl-3 sm:ml-6 sm:pl-4")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2.5 sm:px-4",
            isOwn
              ? "bg-foreground text-background"
              : "bg-secondary/60 text-foreground"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{isOwn ? "You" : node.authorName}</p>
            <time
              className={cn(
                "text-[10px] tabular-nums",
                isOwn ? "text-background/70" : "text-muted-foreground"
              )}
              dateTime={node.createdAt}
            >
              {formatCommentTime(node.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{node.body}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setReplyTo(node);
            setDraft("");
          }}
          className="mt-1 inline-flex items-center gap-1 px-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Reply className="size-3" aria-hidden="true" />
          Reply
        </button>

        {node.replies.length > 0 && (
          <ul className="mt-2 space-y-3">
            {node.replies.map((reply) => renderComment(reply, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <div className="flex min-h-[320px] flex-col">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Chat with {partnerName} about their progress — both of you can comment and reply.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading comments…
        </div>
      ) : tree.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/30 px-6 py-10 text-center">
          <MessageCircle className="size-8 text-muted-foreground/60" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-foreground">Start the conversation</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Leave encouragement, ask how a habit is going, or celebrate a streak.
          </p>
        </div>
      ) : (
        <ul className="space-y-4 pb-4">{tree.map((node) => renderComment(node))}</ul>
      )}

      <form onSubmit={handleSubmit} className="mt-auto space-y-2 border-t border-border/60 pt-4">
        {replyTo && (
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            <span>
              Replying to <strong className="font-medium text-foreground">{replyTo.authorName}</strong>
            </span>
            <button
              type="button"
              className="font-medium text-foreground hover:underline"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </button>
          </div>
        )}

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Write a message to ${partnerName}…`}
          rows={3}
          maxLength={2000}
          disabled={isSubmitting}
          className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting || !draft.trim()} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              {replyTo ? "Send reply" : "Send comment"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
