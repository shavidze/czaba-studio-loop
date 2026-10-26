import { APP_NAME, NEWSLETTER_STATS, SOCIAL_LINKS } from '~/lib/constants';

export function ArtistBioSection() {
  return (
    <section className="artist-bio-section" id="about">
      <div className="container">
        <div className="artist-bio-grid">
          {/* Artist Photo */}
          <div className="artist-photo-wrapper">
            <div className="artist-photo">
              <img
                src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600"
                alt="Artist in studio"
              />
            </div>
            <div className="artist-photo-border"></div>
            <div className="artist-photo-glow"></div>
          </div>

          {/* Artist Content */}
          <div className="artist-content">
            <div className="artist-badge">
              <span className="artist-badge-dot"></span>
              <span>About the Artist</span>
            </div>
            <h2 className="artist-title">
              Hey, I'm <span className="text-glow">{APP_NAME}</span>
            </h2>
            <div className="artist-description">
              <p>
                I've been producing music for over 10 years, crafting sounds that blur the line
                between cinematic atmospheres and heavy bass frequencies. My mission is simple:
                create sounds that inspire other artists.
              </p>
              <p>
                Every sample pack, preset, and track you find here is crafted with the same
                dedication I put into my own releases. When you download my sounds, you're getting
                pieces of my creative journey—ready to become part of yours.
              </p>
              <p className="artist-cta">Let's make something incredible together.</p>
            </div>

            {/* Stats */}
            <div className="artist-stats">
              <div className="artist-stat">
                <p className="artist-stat-number">{NEWSLETTER_STATS.downloads}</p>
                <p className="artist-stat-label">Downloads</p>
              </div>
              <div className="artist-stat">
                <p className="artist-stat-number">{NEWSLETTER_STATS.products}</p>
                <p className="artist-stat-label">Products</p>
              </div>
              <div className="artist-stat">
                <p className="artist-stat-number">{NEWSLETTER_STATS.happyProducers}</p>
                <p className="artist-stat-label">Happy Producers</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="artist-social">
              <span className="artist-social-label">Follow me:</span>
              <a
                href={SOCIAL_LINKS.instagram}
                className="artist-social-link cursor-pointer"
                aria-label="Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                className="artist-social-link cursor-pointer"
                aria-label="YouTube"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                className="artist-social-link cursor-pointer"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
