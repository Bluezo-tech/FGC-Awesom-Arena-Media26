"use client";

import { useEffect, useState } from "react";

type SiteSettings = {
  church_name?: string;
  logo_url?: string;
};

// Official Foursquare Gospel Church Nigeria logo — the image already contains
// the church name/wordmark, so no separate text label is rendered alongside it.
// Editable via /admin (settings.logo_url); this is only the fallback.
const DEFAULT_LOGO_URL = "https://foursquare.org.ng/site/cms/uploads/31687402_footer-logo%20(1).png";

export default function SiteHeader() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((b) => {
        if (b?.settings) setSettings(b.settings);
      })
      .catch(() => {});
  }, []);

  // Close the mobile menu on route/hash navigation so it doesn't stay open
  // after the person taps a link.
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [mobileOpen]);

  const logoUrl = settings.logo_url || DEFAULT_LOGO_URL;

  return (
    <header className="site-header">
      <a href="/" className="wordmark">
        <img className="header-logo" src={logoUrl} alt={settings.church_name || "Foursquare Gospel Church"} />
      </a>
      <nav>
        <a href="/#library">Library</a>
        <a href="/#about">About</a>
      </nav>
      <a className="header-link" href="/#library">Browse media <span>↗</span></a>
      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      {mobileOpen && (
        <div className="mobile-nav-panel" role="dialog" aria-label="Site navigation">
          <a href="/" onClick={() => setMobileOpen(false)}>Home</a>
          <a href="/#library" onClick={() => setMobileOpen(false)}>Library</a>
          <a href="/#about" onClick={() => setMobileOpen(false)}>About</a>
        </div>
      )}
    </header>
  );
}