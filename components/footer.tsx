import Link from "next/link";
import styles from "@/components/site-chrome.module.css";
import { FOOTER_BRAND_LOGOS } from "@/config/footer-brand-logos";

const FOOTER_COPYRIGHT =
  "© 2026 Inclusive Development International and The University of Chicago Data Science Institute.";

const ACKNOWLEDGEMENT_COPY =
  "This resource was developed by Inclusive Development International and the University of Chicago Data Science Institute, with support from The 11th Hour Project, Bread for the World and Heinrich Böll Stiftung Southeast Asia Regional Office.";

const QUICK_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/about#contact" },
  { label: "Admin Login", href: "/cms" },
];

/** Site footer: acknowledgements, quick links, partner logos (`/public/logos`). */
export const Footer: React.FC = () => (
  <footer className={styles.footer}>
    <div className={styles.footerMain}>
      <div className={styles.footerMainInner}>
        <div className={styles.footerGrid}>
          <section
            aria-labelledby="footer-ack-heading"
            className={styles.footerAck}
          >
            <div className={styles.footerAckTitleWrap}>
              <h2 className={styles.footerAckTitle} id="footer-ack-heading">
                Acknowledgements
              </h2>
            </div>
            <p className={styles.footerAckText}>{ACKNOWLEDGEMENT_COPY}</p>
          </section>

          <nav aria-label="Quick links" className={styles.footerQuick}>
            <h2 className={styles.footerQuickTitle}>Quick links</h2>
            <ul className={styles.footerQuickList}>
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className={styles.footerQuickLink} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.footerBrand}>
            <div className={styles.footerLogosRow}>
              {FOOTER_BRAND_LOGOS.map((logo) =>
                logo.href ? (
                  <a
                    className={styles.footerLogoLink}
                    href={logo.href}
                    key={logo.src}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <img
                      alt={logo.alt}
                      className={styles.footerLogoImg}
                      src={logo.src}
                    />
                  </a>
                ) : (
                  <img
                    alt={logo.alt}
                    className={styles.footerLogoImg}
                    key={logo.src}
                    src={logo.src}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className={styles.footerCopyrightStrip}>
      <div className={styles.footerCopyrightInner}>{FOOTER_COPYRIGHT}</div>
    </div>
  </footer>
);
