"use client";

import { useEffect, useState, JSX } from "react";

type SiteSettings = {
  church_name?: string;
  logo_url?: string;
  footer_text?: string;
};

type SocialLink = {
  label: string;
  color: string;
  url: string;
  svg: JSX.Element;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "GitHub",
    color: "#ffffff",
    url: "https://github.com/Bluezo-tech",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    color: "#E1306C",
    url: "https://www.instagram.com/bluezotech?igsi=MXdkcmY0bmliZmpwdQ==",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.282.11-.705.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 3.151-.045h.002zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm7.5.8a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"/>
      </svg>
    ),
  },
  {
    label: "X",
    color: "#ffffff",
    url: "https://x.com/bluezo_tech",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.933l-3.87-5.074L2.75 15.25H.3l5.73-6.56L0 .75h5.063l3.495 4.633L12.6.75Zm-.86 13.28h1.36L4.323 2.145H2.865z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    color: "#25F4EE",
    url: "https://www.tiktok.com/@bluezotech1",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    color: "#0A66C2",
    url: "https://www.linkedin.com/in/ugochukwu-chukwuekem-3b441b3a7",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.21c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.21V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.304 0-1.882.72-2.2 1.212v-.033h-.017v-.945H4.943c.032.67 0 7.225 0 7.225h2.401z"/>
      </svg>
    ),
  },
];

const TIKTOK_PROFILE_URL = "https://www.tiktok.com/@bluezotech1";
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/ugochukwu-chukwuekem-3b441b3a7";
const DEFAULT_LOGO_URL = "https://foursquare.org.ng/site/cms/uploads/31687402_footer-logo%20(1).png";

export default function SiteFooter() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((b) => {
        if (b?.settings) setSettings(b.settings);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Media links reflect whatever categories actually exist in Supabase
    // right now — never a hardcoded guess, so this list never drifts from
    // reality as new programmes get added.
    fetch("/api/videos")
      .then((r) => r.json())
      .then((b) => {
        const set = new Set<string>();
        (b.videos ?? []).forEach((video: { meta?: { category?: string; published?: boolean } | null }) => {
          if (video.meta?.published === false) return;
          const category = video.meta?.category?.trim();
          if (category) set.add(category);
        });
        setCategories(Array.from(set).sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (document.getElementById("tiktok-embed-script")) return;
    const script = document.createElement("script");
    script.id = "tiktok-embed-script";
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const logoUrl = settings.logo_url || DEFAULT_LOGO_URL;

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="/" className="footer-church-mark">
            <img src={logoUrl} alt="" className="footer-church-logo" />
          </a>
          <p>
            <strong>
              Foursquare Gospel Church
              <br />
              in Nigeria Headquarters:
            </strong>
            <br />
            No.7 Ashafa Street,
            <br />
            Whitesand Ishiri,
            <br />
            Lagos State, Nigeria.
            <br />
            09070652091,
            <br />
            (SMS &amp; Whatsapp Only)
          </p>

          <p className="footer-blurb">
            {settings.footer_text ||
              "The software studio behind this platform. Follow the build."}
          </p>

          <p className="footer-social-row">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-badge"
                aria-label={s.label}
                title={s.label}
                style={{ color: s.color, borderColor: s.color }}
              >
                {s.svg}
              </a>
            ))}
          </p>
        </div>

        <div className="footer-col">
          <p className="footer-title">Media</p>
          <a href="/#library">All Media</a>
          {categories.map((cat) => (
            <a key={cat} href={`/?category=${encodeURIComponent(cat)}#library`}>{cat}</a>
          ))}
        </div>

        <div className="footer-col">
          <p className="footer-title">Connect</p>
          <a href="mailto:bluezotech@gmail.com">bluezotech@gmail.com</a>
        </div>

        {/* Professional Developer Studio Card Column */}
        <div className="footer-col studio-creator-col">
          <p className="footer-title">Built by</p>
          <a
            href={LINKEDIN_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-studio-card"
          >
            <div className="studio-card-header">
              <img
                src="https://i.postimg.cc/7Yr7YJMh/Whats-App-Image-2026-08-24-at-17-37-54.jpg"
                alt="Ugochukwu"
                className="studio-card-avatar"
              />
              <div>
                <span className="studio-card-name">Bluezo Tech</span>
                <span className="studio-card-role">Full-Stack & AI Dev</span>
              </div>
            </div>
            <p className="studio-card-desc">
              Building high-performance web applications, e-commerce systems, and intelligent solutions.
            </p>
            <span className="studio-card-action">View LinkedIn Profile &rarr;</span>
          </a>

          {/* Optional: Compact TikTok Embed Below */}
          <div className="footer-tiktok-wrapper" style={{ marginTop: "1rem" }}>
            <blockquote
              className="tiktok-embed"
              cite={TIKTOK_PROFILE_URL}
              data-unique-id="bluezotech1"
              data-embed-type="creator"
              style={{ maxWidth: "780px", minWidth: "240px" }}
            >
              <section>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${TIKTOK_PROFILE_URL}?refer=creator_embed`}
                >
                  @bluezotech1
                </a>
              </section>
            </blockquote>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} All rights reserved.</span>
        <a
          href={LINKEDIN_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="built-by-badge"
        >
          <img
            src="https://i.postimg.cc/7Yr7YJMh/Whats-App-Image-2026-08-24-at-17-37-54.jpg"
            alt="Ugochukwu"
            className="built-by-avatar"
            style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
          />
          <span>
            Built by <strong>Bluezo Tech</strong>
          </span>
        </a>
      </div>

      <style jsx>{`
        .footer-studio-card {
          display: block;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }
        .footer-studio-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        .studio-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .studio-card-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #25f4ee;
        }
        .studio-card-name {
          display: block;
          font-weight: 700;
          color: #fff;
          font-size: 0.95rem;
        }
        .studio-card-role {
          display: block;
          font-size: 0.75rem;
          color: #888;
        }
        .studio-card-desc {
          font-size: 0.8rem;
          color: #aaa;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .studio-card-action {
          font-size: 0.75rem;
          font-weight: 600;
          color: #25f4ee;
        }
      `}</style>
    </footer>
  );
}