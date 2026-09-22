"use client";

import { useEffect, useMemo, useState } from "react";
import { cleanTitleFromFilename, formatCount, formatDate, getSocialImageUrl, getWatchHistory } from "@/lib/utils";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

type Video = {
  id: string;
  name: string;
  createdTime: string;
  thumbnailLink?: string;
  webViewLink?: string;
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
};

type SiteSettings = {
  church_name?: string;
  media_name?: string;
  logo_url?: string;
  hero_title?: string;
  hero_description?: string;
  footer_text?: string;
  social_links?: Record<string, string> | null;
};

export default function MediaGallery() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/videos")
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error);
        setVideos(body.videos ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // CMS site settings (church name, hero copy, footer, social links).
    // Falls back to built-in defaults when Supabase is not configured.
    fetch("/api/settings")
      .then((r) => r.json())
      .then((b) => {
        if (b?.settings) setSettings(b.settings);
      })
      .catch(() => {});

    // "Continue watching" is a per-device progressive enhancement.
    setHistory(getWatchHistory());

    // Deep-linkable category filter (footer "Media" links).
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setActiveCategory(cat);
  }, []);

  // Category chips are derived live from each video's real `category` value
  // in Supabase — never guessed from filenames, and never hardcoded, so the
  // filter bar always matches whatever categories actually exist right now.
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((video) => {
      if (video.meta?.published === false) return;
      const category = video.meta?.category?.trim();
      if (category) set.add(category);
    });
    return ["All", "Featured", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [videos]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((video) => {
      // CMS "published = false" hides the video from the public gallery.
      if (video.meta?.published === false) return false;
      const title = video.meta?.title || cleanTitleFromFilename(video.name);
      const category = video.meta?.category || "";
      const matchesQuery =
        !q || title.toLowerCase().includes(q) || category.toLowerCase().includes(q) || video.name.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" ||
        (activeCategory === "Featured" && video.meta?.featured) ||
        (activeCategory !== "Featured" && category.toLowerCase() === activeCategory.toLowerCase());
      return matchesQuery && matchesCategory;
    });
  }, [videos, query, activeCategory]);

  const publishedVideos = useMemo(() => videos.filter((v) => v.meta?.published !== false), [videos]);
  const featured = useMemo(() => publishedVideos.find((v) => v.meta?.featured) ?? publishedVideos[0], [publishedVideos]);

  // Horizontal rails: recent watch history + all featured videos (when there
  // are enough to make a rail worthwhile beyond the hero).
  const continueWatching = useMemo(() => {
    const byId = new Map(videos.map((v) => [v.id, v]));
    return history.map((id) => byId.get(id)).filter((v): v is Video => v !== undefined && v.meta?.published !== false);
  }, [history, videos]);

  const featuredRail = useMemo(() => publishedVideos.filter((v) => v.meta?.featured), [publishedVideos]);

  const renderRailCard = (video: Video) => {
    const title = video.meta?.title || cleanTitleFromFilename(video.name, video.meta?.category);
    const thumb = getSocialImageUrl(video.meta?.thumbnail_url || video.thumbnailLink);
    return (
      <a className="rail-card" key={video.id} href={`/watch/${video.id}`}>
        <div className="rail-thumb">
          {thumb ? <img src={thumb} alt="" loading="lazy" /> : <div className="thumbnail-fallback" />}
          <span className="play">▶</span>
        </div>
        <div className="rail-meta">
          <strong>{title}</strong>
          <span>{formatDate(video.createdTime)}</span>
        </div>
      </a>
    );
  };

  return (
    <>
      <SiteHeader />

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">{settings.church_name || "Foursquare Gospel Church"}</p>
            <h1>
              {settings.hero_title ? (
                settings.hero_title
              ) : (
                <>
                  Every gathering,
                  <br />
                  <em>preserved.</em>
                </>
              )}
            </h1>
            <p className="lede">
              {settings.hero_description ||
                "A living archive of every service, programme, and gathering — watch, download, and share the moments that moved us."}
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#library">Explore the library <span>↓</span></a>
              {featured && (
                <a className="button ghost" href={`/watch/${featured.id}`}>▶ Watch featured</a>
              )}
            </div>
          </div>
          {featured && (
            <a className="hero-feature" href={`/watch/${featured.id}`}>
              <div className="hero-feature-media">
                {getSocialImageUrl(featured.meta?.thumbnail_url || featured.thumbnailLink) ? (
                  <img src={getSocialImageUrl(featured.meta?.thumbnail_url || featured.thumbnailLink)} alt="" />
                ) : (
                  <div className="thumbnail-fallback" />
                )}
                <div className="hero-feature-overlay" />
                <span className="hero-play">▶</span>
                <div className="hero-feature-label">
                  <span className="kicker">Featured</span>
                  <strong>{featured.meta?.title || cleanTitleFromFilename(featured.name, featured.meta?.category)}</strong>
                  <small>{formatDate(featured.createdTime)}</small>
                </div>
              </div>
            </a>
          )}
        </section>

        {continueWatching.length > 0 && (
          <section className="rail-section" aria-label="Continue watching">
            <div className="rail-head">
              <p className="kicker">Pick up where you left off</p>
              <h2>Continue watching</h2>
            </div>
            <div className="rail-track">{continueWatching.map(renderRailCard)}</div>
          </section>
        )}

        {featuredRail.length >= 2 && (
          <section className="rail-section" aria-label="Featured videos">
            <div className="rail-head">
              <p className="kicker">Curated for you</p>
              <h2>Featured</h2>
            </div>
            <div className="rail-track">{featuredRail.map(renderRailCard)}</div>
          </section>
        )}

        <section className="library" id="library">
          <div className="library-head">
            <div>
              <p className="kicker">Media library</p>
              <h2>Every recording.</h2>
            </div>
            <label className="search">
              <span>⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recordings" aria-label="Search recordings" />
            </label>
          </div>

          <div className="filter-chips" role="tablist" aria-label="Filter videos">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                className={`chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                role="tab"
                aria-selected={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && (
            <div className="video-grid" aria-label="Loading videos">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div className="skeleton" key={item} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="state error">
              <strong>We could not load the media folder.</strong>
              <p>{error}</p>
              <p>Set the Google Drive values in <code>.env.local</code>, then restart the site.</p>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="state">
              <strong>{videos.length ? "No recordings match your search." : "The archive is ready for its first recording."}</strong>
              <p>{videos.length ? "Try another search term or filter." : "When a video is uploaded to the connected Drive folder, it will appear here automatically."}</p>
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="video-grid">
              {visible.map((video) => {
                const title = video.meta?.title || cleanTitleFromFilename(video.name, video.meta?.category);
                const thumbnail = getSocialImageUrl(video.meta?.thumbnail_url || video.thumbnailLink);
                const category = video.meta?.category;
                return (
                  <article className="video-card" key={video.id}>
                    <a className="video-thumb" href={`/watch/${video.id}`} aria-label={`Watch ${title}`}>
                      {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : <div className="thumbnail-fallback" />}
                      <div className="video-overlay" />
                      <span className="play">▶</span>
                      {category && <span className="video-badge">{category}</span>}
                    </a>
                    <div className="video-meta">
                      <h3><a className="video-title-btn" href={`/watch/${video.id}`}>{title}</a></h3>
                      <p>{formatDate(video.createdTime)}</p>
                      <div className="video-stats">
                        <span>👁 {formatCount(video.views ?? 0)}</span>
                        <span>♥ {formatCount(video.likes ?? 0)}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="about" id="about">
          <p className="kicker">Made for the moments</p>
          <h2>One place for every gathering.</h2>
          <p>New uploads are discovered from the church media folder and presented here for a simple, uninterrupted viewing experience — across every service, programme, and event.</p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}