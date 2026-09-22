"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import VideoPlayer from "@/components/video-player";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { addToWatchHistory, cleanTitleFromFilename, formatCount, formatDate, getDeviceKey } from "@/lib/utils";

type Video = {
  id: string;
  name: string;
  createdTime: string;
  thumbnailLink?: string;
  webViewLink?: string;
  width?: number;
  height?: number;
  meta?: {
    title?: string;
    description_markdown?: string;
    category?: string;
    thumbnail_url?: string;
    playback_url?: string;
    featured?: boolean;
    published?: boolean;
    display_order?: number;
    allow_download?: boolean;
  } | null;
  views?: number;
  likes?: number;
  shares?: number;
};

type Comment = { id: string; display_name: string; body: string; created_at: string; parent_id?: string | null };

const AVATAR_COLORS = ["#d4a94e", "#6b8f71", "#8f6b9a", "#c96b6b", "#5f8fb0", "#b08f5f"];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const week = Math.floor(day / 7);
  if (week < 4) return `${week}w`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mo`;
  return `${Math.floor(day / 365)}y`;
}

export default function VideoWatch({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [visibleComments, setVisibleComments] = useState(5);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [shares, setShares] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [commentNotice, setCommentNotice] = useState("");
  const [toast, setToast] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const viewRegistered = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const loadVideo = useCallback(async () => {
    try {
      const res = await fetch("/api/videos");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      const all: Video[] = body.videos ?? [];
      const found = all.find((v) => v.id === videoId);
      if (!found) throw new Error("Video not found.");
      setVideo(found);
      setLikes(found.likes ?? 0);
      setViews(found.views ?? 0);
      setShares(found.shares ?? 0);
      setRelated(all.filter((v) => v.id !== videoId && v.meta?.published !== false).slice(0, 6));
      addToWatchHistory(videoId);

      fetch(`/api/videos/${videoId}/like`, { headers: { "x-liker-key": getDeviceKey() } })
        .then((r) => r.json())
        .then((b) => {
          if (typeof b.liked === "boolean") setLiked(b.liked);
          if (typeof b.likes === "number") setLikes(b.likes);
        })
        .catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load video.");
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      if (res.ok) setComments(body.comments ?? []);
    } catch {
      // ignore
    }
  }, [videoId]);

  useEffect(() => {
    loadVideo();
    loadComments();
  }, [loadVideo, loadComments]);

  const registerView = useCallback(() => {
    if (viewRegistered.current) return;
    viewRegistered.current = true;
    fetch(`/api/videos/${videoId}/view`, {
      method: "POST",
      headers: { "x-viewer-key": getDeviceKey() },
    })
      .then((r) => r.json())
      .then((body) => {
        if (typeof body.views === "number") setViews(body.views);
      })
      .catch(() => {});
  }, [videoId]);

  const handleLike = async () => {
    const method = liked ? "DELETE" : "POST";
    const res = await fetch(`/api/videos/${videoId}/like`, {
      method,
      headers: { "x-liker-key": getDeviceKey() },
    });
    const body = await res.json();
    if (res.ok) {
      setLikes(body.likes ?? likes);
      setLiked(body.liked ?? !liked);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentNotice("");
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name, body: comment }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setComments((prev) => [body.comment, ...prev]);
      setName("");
      setComment("");
      setCommentNotice("Comment posted!");
    } catch (err) {
      setCommentNotice(err instanceof Error ? err.message : "Could not submit comment.");
    }
  };
  const handleReply = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: replyName, body: replyBody, parent_id: parentId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setComments((prev) => [...prev, body.comment]);
      setReplyName("");
      setReplyBody("");
      setReplyingTo(null);
    } catch (err) {
      setCommentNotice(err instanceof Error ? err.message : "Could not submit reply.");
    }
  };

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }, []);

  // Record a share action (best-effort; a person can share more than once).
  const recordShare = useCallback(async () => {
    if (!video) return;
    try {
      const res = await fetch(`/api/videos/${video.id}/share`, { method: "POST" });
      const body = await res.json();
      if (typeof body.shares === "number") setShares(body.shares);
    } catch {
      // ignore — share tracking is best-effort and must not block sharing
    }
  }, [video]);

  const handleShare = useCallback(async () => {
    if (!video) return;
    const shareUrl = `${window.location.origin}/watch/${video.id}`;
    const videoTitle = video.meta?.title || cleanTitleFromFilename(video.name);
    const videoDescription = (
      video.meta?.description_markdown ||
      `Watch "${videoTitle}" from the Foursquare Gospel Church Nigeria media archive.`
    ).slice(0, 280);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: videoTitle, text: videoDescription, url: shareUrl });
        await recordShare();
        return;
      } catch (err) {
        const name = (err as { name?: string } | null)?.name;
        if (name === "AbortError") return;
      }
    }
    setShareOpen(true);
  }, [video, recordShare]);

  const handleCopyLink = useCallback(async () => {
    if (!video) return;
    const shareUrl = `${window.location.origin}/watch/${video.id}`;
    const copied = await copyToClipboard(shareUrl);
    if (copied) await recordShare();
    showToast(copied ? "Link copied" : "Could not copy the link.");
    setShareOpen(false);
  }, [video, copyToClipboard, showToast, recordShare]);

  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shareOpen]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  if (loading) {
    return (
      <>
      <SiteHeader />
      <main className="watch-page">
        <div className="watch-skeleton">
          <div className="skeleton skeleton-player" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      </main>
      <SiteFooter />
      </>
    );
  }

  if (error || !video) {
    return (
      <>
      <SiteHeader />
      <main className="watch-page">
        <div className="state error">
          <strong>We could not load this video.</strong>
          <p>{error || "The video may have been removed."}</p>
          <a className="button primary" href="/">Back to gallery</a>
        </div>
      </main>
      <SiteFooter />
      </>
    );
  }

  const title = video.meta?.title || cleanTitleFromFilename(video.name);
  const thumbnail = video.meta?.thumbnail_url || video.thumbnailLink;
  const embedUrl = video.meta?.playback_url || `/api/drive-stream/${video.id}`;
  const downloadUrl = `/api/drive-stream/${video.id}?download=1`;
  const allowDownload = video.meta?.allow_download ?? true;

  const shareUrl = `${window.location.origin}/watch/${video.id}`;
  const shareTitle = title;
  const shareUrlEncoded = encodeURIComponent(shareUrl);
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} — ${shareUrl}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`;
  const twitterHref = `https://twitter.com/intent/tweet?url=${shareUrlEncoded}&text=${encodeURIComponent(shareTitle)}`;

  // Automatically determine if the video is vertical (portrait aspect ratio)
  const isPortrait = video.height && video.width ? video.height > video.width : false;
  return (
    <>
    <SiteHeader />
    <main className="watch-page">
      <div className="watch-container">
        <div className={`watch-player-wrapper ${isPortrait ? "portrait" : ""}`}>
          <VideoPlayer
            src={embedUrl}
            title={title}
            poster={thumbnail}
            aspectWidth={video.width}
            aspectHeight={video.height}
            onEngaged={registerView}
          />
        </div>

        <div className="watch-info">
          <div className="watch-title-row">
            <div className="watch-title-block">
              {video.meta?.category && <span className="watch-category">{video.meta.category}</span>}
              <h1>{title}</h1>
              <p className="watch-meta">{formatDate(video.createdTime)}</p>
            </div>
          </div>

          <div className="watch-actions">
            <button className={`like-btn ${liked ? "liked" : ""}`} onClick={handleLike} aria-label="Like video">
              <span className="like-heart" aria-hidden>{liked ? "♥" : "♡"}</span>
              <span>Like</span>
            </button>
            <button className="share-btn" onClick={handleShare} aria-label="Share video">
              <span className="share-icon" aria-hidden>↗</span>
              <span>Share</span>
            </button>
            {allowDownload && (
              <a className="download-btn" href={downloadUrl} target="_blank" rel="noreferrer">
                <span aria-hidden>↓</span>
                <span>Download</span>
              </a>
            )}
          </div>

          <div className="watch-stats">
            <span>👁 {formatCount(views)} views</span>
            <span>♥ {formatCount(likes)} likes</span>
            <span>💬 {comments.length} comments</span>
            <span>↗ {formatCount(shares)} shares</span>
          </div>

          {video.meta?.description_markdown && (
            <div className="watch-description">
              <h2>About this video</h2>
              <p>{video.meta.description_markdown}</p>
            </div>
          )}

          <div className="comments-section">
            <button
              type="button"
              className="comments-toggle"
              onClick={() => setShowComments((v) => !v)}
              aria-expanded={showComments}
            >
              <h2>Comments ({comments.length})</h2>
              <span className={`comments-chevron ${showComments ? "open" : ""}`} aria-hidden>⌄</span>
            </button>
            {showComments && (
              <>
                <form className="comment-form" onSubmit={handleComment}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts…"
                    required
                    minLength={2}
                    maxLength={2000}
                  />
                  <button className="button primary" type="submit">Post comment</button>
                </form>
                {commentNotice && <p className="comment-notice">{commentNotice}</p>}
                <div className="comments-list">
                  {comments.length === 0 && <p className="no-comments">No comments yet. Be the first to share your thoughts.</p>}
                  {comments.filter((c) => !c.parent_id).slice().reverse().slice(0, visibleComments).map((c) => {
                    const replies = comments.filter((r) => r.parent_id === c.id);
                    return (
                      <div className="comment-thread" key={c.id}>
                        <div className="comment">
                          <div className="comment-avatar" style={{ background: avatarColor(c.display_name) }}>
                            {c.display_name.trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="comment-body">
                            <div className="comment-head">
                              <strong>{c.display_name}</strong>
                              <span>{timeAgo(c.created_at)}</span>
                            </div>
                            <p>{c.body}</p>
                            <button
                              type="button"
                              className="comment-reply-btn"
                              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                            >
                              Reply
                            </button>
                            {replyingTo === c.id && (
                              <form className="reply-form" onSubmit={(e) => handleReply(c.id, e)}>
                                <input
                                  value={replyName}
                                  onChange={(e) => setReplyName(e.target.value)}
                                  placeholder="Your name"
                                  required
                                  minLength={2}
                                  maxLength={80}
                                />
                                <textarea
                                  value={replyBody}
                                  onChange={(e) => setReplyBody(e.target.value)}
                                  placeholder={`Reply to ${c.display_name}…`}
                                  required
                                  minLength={2}
                                  maxLength={2000}
                                />
                                <div className="reply-form-actions">
                                  <button type="button" className="button ghost" onClick={() => setReplyingTo(null)}>Cancel</button>
                                  <button className="button primary" type="submit">Post reply</button>
                                </div>
                              </form>
                            )}
                          </div>
                        </div>
                        {replies.length > 0 && (
                          <div className="comment-replies">
                            {replies.map((r) => (
                              <div className="comment comment-reply" key={r.id}>
                                <div className="comment-avatar comment-avatar-sm" style={{ background: avatarColor(r.display_name) }}>
                                  {r.display_name.trim().charAt(0).toUpperCase()}
                                </div>
                                <div className="comment-body">
                                  <div className="comment-head">
                                    <strong>{r.display_name}</strong>
                                    <span>{timeAgo(r.created_at)}</span>
                                  </div>
                                  <p>{r.body}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {comments.filter((c) => !c.parent_id).length > visibleComments && (
                  <button
                    type="button"
                    className="comments-load-more"
                    onClick={() => setVisibleComments((v) => v + 5)}
                  >
                    Show more comments
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-section">
            <h2>More like this</h2>
            <div className="related-grid">
              {related.map((v) => {
                const relTitle = v.meta?.title || cleanTitleFromFilename(v.name);
                const relThumb = v.meta?.thumbnail_url || v.thumbnailLink;
                return (
                  <a className="related-card" key={v.id} href={`/watch/${v.id}`}>
                    <div className="related-thumb">
                      {relThumb ? <img src={relThumb} alt="" loading="lazy" /> : <div className="thumbnail-fallback" />}
                      <span className="play">▶</span>
                    </div>
                    <div className="related-meta">
                      <strong>{relTitle}</strong>
                      <span>{formatDate(v.createdTime)}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast" role="status">
          <span aria-hidden>✓</span> {toast}
        </div>
      )}

      {shareOpen && (
        <div className="share-overlay" onClick={() => setShareOpen(false)}>
          <div className="share-sheet" role="dialog" aria-modal="true" aria-label="Share video" onClick={(e) => e.stopPropagation()}>
            <div className="share-sheet-head">
              <strong>Share</strong>
              <button className="share-close" onClick={() => setShareOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="share-options">
              <button className="share-option" onClick={handleCopyLink}>
                <span className="share-opt-icon" aria-hidden>🔗</span>
                <span>Copy link</span>
              </button>
              <a className="share-option" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => { recordShare(); setShareOpen(false); }}>
                <span className="share-opt-icon" aria-hidden>💬</span>
                <span>WhatsApp</span>
              </a>
              <a className="share-option" href={facebookHref} target="_blank" rel="noopener noreferrer" onClick={() => { recordShare(); setShareOpen(false); }}>
                <span className="share-opt-icon" aria-hidden>📘</span>
                <span>Facebook</span>
              </a>
              <a className="share-option" href={twitterHref} target="_blank" rel="noopener noreferrer" onClick={() => { recordShare(); setShareOpen(false); }}>
                <span className="share-opt-icon" aria-hidden>𝕏</span>
                <span>X / Twitter</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
    <SiteFooter />
    </>
  );
}