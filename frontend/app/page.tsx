"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const LIVE_COLLEGES = [{ abbr: "LC", name: "Luther College" }];
const COMING_SOON_COLLEGES = [
  { abbr: "BU", name: "Barry University" },
  { abbr: "GC", name: "Grinnell College" },
  { abbr: "UMR", name: "University of Minnesota Rochester" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [waitEmail, setWaitEmail] = useState("");
  const [waitDone, setWaitDone] = useState(false);
  const [waitLoading, setWaitLoading] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!waitEmail.includes("@") || !waitEmail.includes(".edu")) return;
    setWaitLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      await fetch(`${apiUrl}/auth/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitEmail }),
      });
    } catch {
      /* silent */
    }
    setWaitDone(true);
    setWaitLoading(false);
  }

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#0A1220",
        background: "#FFFFFF",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        img, svg { display: block; max-width: 100%; }

        .lp-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          height: 42px; padding: 0 18px;
          border-radius: 10px;
          font-size: 14px; font-weight: 600; letter-spacing: -0.005em;
          transition: transform .15s ease, background .2s ease, box-shadow .2s ease, border-color .2s ease, color .15s ease;
          white-space: nowrap; cursor: pointer; border: none; font-family: inherit;
        }
        .lp-btn:active { transform: translateY(1px); }
        .lp-btn-ghost { color: #2B3340; background: none; }
        .lp-btn-ghost:hover { color: #00599B; }
        .lp-btn-outline {
          border: 1.5px solid #00599B; color: #00599B; background: #FFFFFF;
        }
        .lp-btn-outline:hover { background: #F1F6FB; }
        .lp-btn-primary {
          background: linear-gradient(180deg, #1972B5 0%, #00599B 100%);
          color: #FFFFFF;
          box-shadow: 0 1px 0 rgba(255,255,255,0.20) inset, 0 6px 16px -8px rgba(0,89,155,0.55);
        }
        .lp-btn-primary:hover { box-shadow: 0 1px 0 rgba(255,255,255,0.20) inset, 0 12px 24px -10px rgba(0,89,155,0.7); }
        .lp-btn-white { background: #FFFFFF; color: #00599B; box-shadow: 0 6px 16px -8px rgba(0,0,0,0.18); }
        .lp-btn-white:hover { background: #F2F6FB; }
        .lp-btn-lg { height: 50px; padding: 0 24px; font-size: 15px; border-radius: 12px; }

        .lp-arrow { transition: transform .2s ease; }
        .lp-btn:hover .lp-arrow { transform: translateX(3px); }

        @keyframes lp-pulse {
          0% { box-shadow: 0 0 0 0 rgba(29,158,117,.45); }
          70% { box-shadow: 0 0 0 10px rgba(29,158,117,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
        @keyframes lp-floaty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes lp-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .lp-pulse {
          width: 8px; height: 8px; border-radius: 999px; background: #1D9E75;
          box-shadow: 0 0 0 0 rgba(29,158,117,.5);
          animation: lp-pulse 2s infinite;
          display: inline-block;
        }
        .lp-float-l { animation: lp-floaty 6s ease-in-out infinite; animation-delay: -2s; }
        .lp-float-r { animation: lp-floaty 6s ease-in-out infinite; animation-delay: -4s; }
        .lp-typing span {
          width: 6px; height: 6px; border-radius: 999px; background: #00599B;
          animation: lp-bounce 1.2s infinite; display: inline-block;
        }
        .lp-typing span:nth-child(2) { animation-delay: .15s; }
        .lp-typing span:nth-child(3) { animation-delay: .3s; }

        .lp-problem-card:hover, .lp-outcome-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px -10px rgba(10,18,32,0.10), 0 2px 6px rgba(10,18,32,0.04); border-color: transparent; }
        .lp-college-card:hover { transform: translateY(-2px); box-shadow: 0 1px 2px rgba(10,18,32,0.04); }

        /* ── Tablet ── */
        @media (max-width: 860px) {
          .lp-sol-grid { grid-template-columns: 1fr !important; gap: 36px !important; padding: 40px 0 !important; }
          .lp-trust-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .lp-sol-flip-copy { order: 1 !important; }
          .lp-sol-flip-art { order: 2 !important; }
          .lp-problem-grid { grid-template-columns: 1fr !important; }
          .lp-outcomes-grid { grid-template-columns: 1fr !important; }
          .lp-colleges-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-foot-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-section { padding: 72px 0 !important; }
          .lp-waitlist-box { padding: 40px 32px !important; }
        }

        /* ── Desktop only: more breathing room below CTA buttons ── */
        @media (min-width: 601px) {
          .lp-hero-meta { margin-top: 48px !important; }
        }

        /* ── Phone ── */
        @media (max-width: 600px) {
          .lp-float-card { display: none !important; }
          .lp-hero-art { height: 260px !important; margin-top: 36px !important; }
          .lp-hero-art svg { min-width: 720px !important; }
          .lp-hero-inner { padding: 52px 20px 0 !important; }
          .lp-hero-cta { flex-direction: column !important; width: 100% !important; }
          .lp-hero-cta a { width: 100% !important; justify-content: center !important; }
          .lp-sol-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 28px 0 !important; }
          .lp-sol-art { aspect-ratio: 1.15 / 1 !important; }
          .lp-sol-flip-copy { order: 1 !important; }
          .lp-sol-flip-art { order: 2 !important; }
          .lp-problem-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .lp-outcomes-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .lp-colleges-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .lp-trust-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .lp-foot-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
          .lp-nav-ghost { display: none !important; }
          .lp-waitlist-form { flex-direction: column !important; }
          .lp-waitlist-form input { width: 100% !important; }
          .lp-waitlist-form button { width: 100% !important; }
          .lp-waitlist-box { padding: 28px 20px !important; border-radius: 16px !important; }
          .lp-final-art { height: 180px !important; margin-top: 36px !important; }
          .lp-final-art svg { min-width: 720px !important; }
          .lp-section { padding: 56px 0 !important; }
          .lp-section-head { margin-bottom: 40px !important; }
          .lp-container { padding: 0 20px !important; }
          .lp-chat-art { aspect-ratio: unset !important; height: 340px !important; }
          .lp-chat-bubble-them { max-width: 88% !important; font-size: 13px !important; }
          .lp-chat-bubble-me { max-width: 88% !important; font-size: 13px !important; }
          .lp-orbit-chip { font-size: 11px !important; padding: 8px 10px !important; }
        }

        /* ── Small phone ── */
        @media (max-width: 380px) {
          .lp-container { padding: 0 16px !important; }
          .lp-waitlist-box { padding: 24px 16px !important; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "saturate(180%) blur(14px)",
          WebkitBackdropFilter: "saturate(180%) blur(14px)",
          borderBottom: `1px solid ${scrolled ? "#E6E9EE" : "transparent"}`,
          transition: "border-color .2s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 76,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 5,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "-0.025em",
              color: "#0A1220",
            }}
          >
            DormSy
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background: "#00599B",
                transform: "translateY(-2px)",
                display: "inline-block",
              }}
            />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" className="lp-btn lp-btn-ghost lp-nav-ghost">
              Log in
            </Link>
            <Link href="/sign-up" className="lp-btn lp-btn-primary">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 1. Hero ── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F4F8FC 60%, #E8F0F8 100%)",
        }}
      >
        <div
          className="lp-hero-inner"
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "96px 28px 0",
            maxWidth: 920,
            margin: "0 auto",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#FFFFFF",
              border: "1px solid #E6E9EE",
              borderRadius: 999,
              padding: "6px 14px 6px 6px",
              fontSize: 13,
              fontWeight: 500,
              color: "#2B3340",
              boxShadow: "0 1px 2px rgba(10,18,32,0.04)",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                background: "#E6F4EE",
                color: "#1D9E75",
                fontWeight: 600,
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              New
            </span>
            Now live at Luther College
          </span>

          <h1
            style={{
              fontSize: "clamp(40px, 6.4vw, 76px)",
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              fontWeight: 700,
              margin: "0 0 22px",
              color: "#0A1220",
            }}
          >
            A marketplace just for your campus.
          </h1>

          <p
            style={{
              fontSize: "clamp(17px, 1.6vw, 19px)",
              color: "#5A6473",
              maxWidth: 620,
              margin: "0 auto 36px",
              lineHeight: 1.55,
            }}
          >
            DormSy is the verified, .edu-only marketplace where students buy and
            sell with people they actually share a quad with — no strangers, no
            shipping, no fees.
          </p>

          <div
            className="lp-hero-cta"
            style={{
              display: "inline-flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link href="/sign-up" className="lp-btn lp-btn-primary lp-btn-lg">
              Sign up with your college email
              <svg
                className="lp-arrow"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            <Link href="/login" className="lp-btn lp-btn-outline lp-btn-lg">
              I already have an account
            </Link>
          </div>

          <div
            className="lp-hero-meta"
            style={{
              marginTop: 28,
              marginLeft: "auto",
              marginRight: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#5A6473",
              fontSize: 14,
            }}
          >
            <span className="lp-pulse" />
            Currently live at{" "}
            <strong
              style={{ color: "#0A1220", fontWeight: 600, marginLeft: 2 }}
            >
              Luther College
            </strong>
          </div>
        </div>

        {/* Hero art */}
        <div
          className="lp-hero-art"
          style={{
            position: "relative",
            marginTop: 56,
            width: "100%",
            height: "clamp(360px, 46vw, 560px)",
          }}
        >
          {/* Floating cards */}
          <div
            className="lp-float-card lp-float-l"
            style={{
              position: "absolute",
              background: "#FFFFFF",
              borderRadius: 14,
              boxShadow:
                "0 30px 60px -25px rgba(10,18,32,0.20), 0 10px 24px -12px rgba(10,18,32,0.08)",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              zIndex: 3,
              left: "6%",
              top: "18%",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#E6F4EE",
                color: "#1D9E75",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 1.5l5.5 2.5v3.5c0 3.5-2.4 6.5-5.5 7-3.1-.5-5.5-3.5-5.5-7V4z" />
                <path d="M5.5 8l1.7 1.7L10.5 6.5" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                @stasdi01 · Verified
              </div>
              <div style={{ fontSize: 12, color: "#5A6473", marginTop: 2 }}>
                luther.edu student
              </div>
            </div>
          </div>

          <div
            className="lp-float-card lp-float-r"
            style={{
              position: "absolute",
              background: "#FFFFFF",
              borderRadius: 14,
              boxShadow:
                "0 30px 60px -25px rgba(10,18,32,0.20), 0 10px 24px -12px rgba(10,18,32,0.08)",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              zIndex: 3,
              right: "6%",
              top: "30%",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#E5EEF6",
                color: "#00599B",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12c0 4.5-4 8-9 8a10.5 10.5 0 01-3.5-.6L4 21l1.3-3.7A8 8 0 013 12c0-4.5 4-8 9-8s9 3.5 9 8z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                New message from @stasdi01
              </div>
              <div style={{ fontSize: 12, color: "#5A6473", marginTop: 2 }}>
                &ldquo;Still have the mini-fridge?&rdquo;
              </div>
            </div>
          </div>

          {/* Campus SVG illustration */}
          <svg
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              minWidth: 1200,
              height: "100%",
            }}
            viewBox="0 0 1440 560"
            preserveAspectRatio="xMidYEnd meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="lp-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F4F8FC" />
                <stop offset="100%" stopColor="#E5EEF6" />
              </linearGradient>
            </defs>
            <rect width="1440" height="560" fill="url(#lp-sky)" />
            <g opacity="0.55" fill="#9DB7D1">
              <polygon points="80,420 110,360 140,420" />
              <polygon points="160,425 195,355 230,425" />
              <polygon points="1240,420 1275,360 1310,420" />
              <polygon points="1320,415 1360,345 1400,415" />
            </g>
            <g fill="#B8CADD">
              <polygon points="220,440 220,330 320,290 420,330 420,440" />
              <polygon points="1020,440 1020,330 1120,295 1220,335 1220,440" />
            </g>
            <g fill="#A6BDD2">
              <rect x="245" y="350" width="20" height="22" />
              <rect x="285" y="350" width="20" height="22" />
              <rect x="325" y="350" width="20" height="22" />
              <rect x="365" y="350" width="20" height="22" />
              <rect x="245" y="385" width="20" height="22" />
              <rect x="285" y="385" width="20" height="22" />
              <rect x="1045" y="355" width="22" height="24" />
              <rect x="1085" y="355" width="22" height="24" />
              <rect x="1125" y="355" width="22" height="24" />
              <rect x="1165" y="355" width="22" height="24" />
            </g>
            <path
              d="M0,460 L180,420 L360,440 L580,400 L820,430 L1080,400 L1280,430 L1440,420 L1440,560 L0,560 Z"
              fill="#5A7FA8"
            />
            <g>
              <polygon
                points="540,460 540,310 720,260 900,310 900,460"
                fill="#1972B5"
              />
              <polygon
                points="540,310 720,260 720,290 540,340"
                fill="#0A4377"
              />
              <polygon
                points="720,260 900,310 900,340 720,290"
                fill="#004B83"
              />
              <rect x="690" y="170" width="60" height="120" fill="#1972B5" />
              <polygon points="690,170 720,130 750,170" fill="#0A4377" />
              <circle cx="720" cy="220" r="14" fill="#FFFFFF" />
              <circle
                cx="720"
                cy="220"
                r="14"
                fill="none"
                stroke="#00599B"
                strokeWidth="2"
              />
              <line
                x1="720"
                y1="220"
                x2="720"
                y2="212"
                stroke="#00599B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="720"
                y1="220"
                x2="726"
                y2="220"
                stroke="#00599B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <g fill="#7CB1DC">
                <rect x="565" y="350" width="22" height="30" />
                <rect x="600" y="350" width="22" height="30" />
                <rect x="635" y="350" width="22" height="30" />
                <rect x="670" y="350" width="22" height="30" />
                <rect x="747" y="350" width="22" height="30" />
                <rect x="782" y="350" width="22" height="30" />
                <rect x="817" y="350" width="22" height="30" />
                <rect x="852" y="350" width="22" height="30" />
                <rect x="565" y="395" width="22" height="30" />
                <rect x="600" y="395" width="22" height="30" />
                <rect x="635" y="395" width="22" height="30" />
                <rect x="670" y="395" width="22" height="30" />
                <rect x="747" y="395" width="22" height="30" />
                <rect x="782" y="395" width="22" height="30" />
                <rect x="817" y="395" width="22" height="30" />
                <rect x="852" y="395" width="22" height="30" />
              </g>
              <rect
                x="700"
                y="410"
                width="40"
                height="50"
                rx="4"
                fill="#0A2342"
              />
              <polygon
                points="540,460 900,460 920,476 520,476"
                fill="#0A4377"
              />
            </g>
            <g>
              <polygon
                points="380,460 380,360 470,330 540,355 540,460"
                fill="#2E7DBE"
              />
              <polygon
                points="380,360 470,330 470,360 380,388"
                fill="#1A4F89"
              />
              <g fill="#9DC8E9">
                <rect x="395" y="380" width="16" height="20" />
                <rect x="420" y="380" width="16" height="20" />
                <rect x="450" y="378" width="16" height="20" />
                <rect x="485" y="378" width="16" height="20" />
                <rect x="515" y="378" width="16" height="20" />
                <rect x="395" y="412" width="16" height="20" />
                <rect x="420" y="412" width="16" height="20" />
                <rect x="450" y="412" width="16" height="20" />
              </g>
            </g>
            <g>
              <polygon
                points="900,460 900,360 970,335 1060,360 1060,460"
                fill="#2E7DBE"
              />
              <polygon
                points="900,360 970,335 970,358 900,385"
                fill="#1A4F89"
              />
              <g fill="#9DC8E9">
                <rect x="912" y="380" width="16" height="20" />
                <rect x="940" y="380" width="16" height="20" />
                <rect x="970" y="380" width="16" height="20" />
                <rect x="1000" y="380" width="16" height="20" />
                <rect x="1030" y="380" width="16" height="20" />
              </g>
            </g>
            <g fill="#0A4377">
              <polygon points="100,520 140,420 180,520" />
              <polygon points="200,525 245,415 290,525" />
              <polygon points="1170,525 1215,415 1260,525" />
              <polygon points="1280,520 1325,425 1370,520" />
            </g>
            <g fill="#1A4F89">
              <polygon points="80,530 115,440 150,530" />
              <polygon points="170,532 210,445 250,532" />
              <polygon points="1190,532 1230,445 1270,532" />
              <polygon points="1300,530 1340,440 1380,530" />
            </g>
            <path
              d="M0,520 L240,470 L500,500 L780,475 L1060,500 L1300,475 L1440,500 L1440,560 L0,560 Z"
              fill="#0A2342"
            />
            <path
              d="M620,560 L720,460 L820,560 Z"
              fill="#3A5A85"
              opacity="0.5"
            />
          </svg>
        </div>
      </section>

      {/* ── 2. Problem ── */}
      <section
        className="lp-section"
        style={{ padding: "120px 0", background: "#FFFFFF" }}
      >
        <div
          className="lp-container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto 72px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                color: "#00599B",
                marginBottom: 12,
                letterSpacing: "-0.005em",
              }}
            >
              The problem
            </span>
            <h2
              style={{
                fontSize: "clamp(34px, 4.5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                fontWeight: 700,
                margin: "0 0 16px",
                color: "#0A1220",
              }}
            >
              Buying &amp; selling on campus is broken
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "#5A6473",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              Group chats, sketchy DMs, and fee-hungry apps that connect you
              with strangers two states away.
            </p>
          </div>
          <div
            className="lp-problem-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {[
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 9.5a3 3 0 116 0c0 1.5-1.5 1.8-3 3.5" />
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                  </svg>
                ),
                title: "You don't know who you're meeting",
                desc: "Marketplace, Craigslist, and random Discord servers leave you guessing whether the buyer's even a student — let alone safe.",
              },
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9h18l-1.5 11a2 2 0 01-2 1.5H6.5a2 2 0 01-2-1.5z" />
                    <path d="M8 9V6a4 4 0 018 0v3" />
                    <path d="M12 13v4" />
                  </svg>
                ),
                title: "Fees eat into every sale",
                desc: "Listing fees, transaction cuts, premium tiers — by the time you net out, that $50 textbook is worth $38.",
              },
              {
                icon: (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                ),
                title: "Shipping kills the simple stuff",
                desc: "You shouldn't need a packing label and a tracking number to hand off a desk lamp to someone two dorms over.",
              },
            ].map((p) => (
              <article
                key={p.title}
                className="lp-problem-card"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E9EE",
                  borderRadius: 20,
                  padding: 32,
                  transition:
                    "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background:
                      "linear-gradient(180deg, #E5EEF6 0%, #D9E5F0 100%)",
                    color: "#00599B",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 22,
                  }}
                >
                  {p.icon}
                </div>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                    margin: "0 0 10px",
                    color: "#0A1220",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    color: "#5A6473",
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  {p.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. How it works (alternating) ── */}
      <section
        className="lp-section"
        style={{ padding: "96px 0", background: "#F9FAFB" }}
      >
        <div
          className="lp-container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto 72px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                color: "#00599B",
                marginBottom: 12,
              }}
            >
              How DormSy works
            </span>
            <h2
              style={{
                fontSize: "clamp(34px, 4.5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                fontWeight: 700,
                margin: "0 0 16px",
                color: "#0A1220",
              }}
            >
              A campus marketplace, done right
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "#5A6473",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              From sign-up to handoff in three steps — built around the way
              college actually works.
            </p>
          </div>

          {/* Step 1: Verify */}
          <div
            className="lp-sol-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 88,
              alignItems: "center",
              padding: "80px 0",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  color: "#00599B",
                  marginBottom: 14,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Verify
              </span>
              <h2
                style={{
                  fontSize: "clamp(30px, 3.6vw, 42px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  fontWeight: 700,
                  margin: "0 0 20px",
                  color: "#0A1220",
                }}
              >
                Only real students. Every time.
              </h2>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  margin: "0 0 16px",
                  lineHeight: 1.65,
                  maxWidth: 460,
                }}
              >
                Sign up with your .edu email and DormSy ties your account to
                your school. Every person you message, every listing you see —
                verified by the same email your registrar sends grades to.
              </p>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  margin: 0,
                  lineHeight: 1.65,
                  maxWidth: 460,
                }}
              >
                No bots. No tourists. No &ldquo;hey this is my cousin&apos;s
                account.&rdquo;
              </p>
            </div>
            <div
              style={{
                aspectRatio: "1.08 / 1",
                background: "linear-gradient(180deg, #F1F6FB 0%, #E5EEF6 100%)",
                borderRadius: 24,
                border: "1px solid #EFF2F6",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(10,18,32,0.04)",
              }}
            >
              {/* Ring */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "78%",
                  aspectRatio: "1",
                  border: "1.5px dashed rgba(0,89,155,0.25)",
                  borderRadius: 999,
                }}
              />
              {/* Center */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "38%",
                  aspectRatio: "1",
                  borderRadius: 999,
                  background:
                    "radial-gradient(circle at 30% 30%, #1972B5, #00599B 70%)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 30px 50px -25px rgba(0,89,155,0.6)",
                }}
              >
                <div
                  style={{
                    width: "70%",
                    aspectRatio: "1",
                    borderRadius: 999,
                    background: "#FFFFFF",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "44%",
                      aspectRatio: "1",
                      borderRadius: 999,
                      background: "#1D9E75",
                      color: "#FFFFFF",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 8px 18px -6px rgba(29,158,117,0.5)",
                    }}
                  >
                    <svg
                      width="60%"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 8.5L6.5 11.5L12.5 5" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Orbit chips */}
              {[
                {
                  label: ".edu email",
                  pos: { top: "12%", left: "8%" },
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 4l6 4 6-4" />
                      <rect x="2" y="3" width="12" height="10" rx="1.5" />
                    </svg>
                  ),
                },
                {
                  label: "One per student",
                  pos: { top: "16%", right: "8%" },
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="8" cy="6" r="3" />
                      <path d="M2 14c0-3 3-5 6-5s6 2 6 5" />
                    </svg>
                  ),
                },
                {
                  label: "Your school only",
                  pos: { bottom: "14%", left: "10%" },
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 11l5-5 5 5" />
                      <path d="M3 14h10" />
                    </svg>
                  ),
                },
                {
                  label: "Trust badge",
                  pos: { bottom: "16%", right: "8%" },
                  icon: (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M8 1.5l5.5 2.5v3.5c0 3.5-2.4 6.5-5.5 7-3.1-.5-5.5-3.5-5.5-7V4z" />
                    </svg>
                  ),
                },
              ].map((o) => (
                <div
                  key={o.label}
                  className="lp-orbit-chip"
                  style={{
                    position: "absolute",
                    background: "#FFFFFF",
                    borderRadius: 14,
                    padding: "12px 14px",
                    boxShadow:
                      "0 8px 24px -10px rgba(10,18,32,0.10), 0 2px 6px rgba(10,18,32,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    ...o.pos,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#E5EEF6",
                      color: "#00599B",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {o.icon}
                  </div>
                  {o.label}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Browse & List (flip) */}
          <div
            className="lp-sol-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 88,
              alignItems: "center",
              padding: "80px 0",
            }}
          >
            <div
              className="lp-sol-flip-art lp-sol-art"
              style={{
                aspectRatio: "1.08 / 1",
                background: "linear-gradient(180deg, #F1F6FB 0%, #E5EEF6 100%)",
                borderRadius: 24,
                border: "1px solid #EFF2F6",
                position: "relative",
                overflow: "hidden",
                order: 1,
              }}
            >
              {/* Listing card mockup */}
              <div
                style={{
                  position: "absolute",
                  left: "14%",
                  right: "14%",
                  top: "10%",
                  bottom: "10%",
                  background: "#FFFFFF",
                  borderRadius: 16,
                  boxShadow: "0 8px 24px -10px rgba(10,18,32,0.10)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    flex: "1.4",
                    background:
                      "linear-gradient(135deg, #DCE4ED 0%, #C9D4DF 100%)",
                    position: "relative",
                    borderBottom: "1px solid #EFF2F6",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      background: "#FFFFFF",
                      color: "#2B3340",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      boxShadow: "0 1px 2px rgba(10,18,32,0.04)",
                    }}
                  >
                    Textbooks
                  </span>
                  <div
                    style={{
                      position: "absolute",
                      left: "22%",
                      right: "22%",
                      top: "18%",
                      bottom: "18%",
                      background: "#FFFFFF",
                      borderRadius: 6,
                      boxShadow: "0 12px 22px -10px rgba(10,18,32,0.25)",
                      backgroundImage:
                        "linear-gradient(180deg, #00599B 0 22%, #FFFFFF 22% 100%)",
                    }}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      Calculus, 8th ed.
                    </span>
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#00599B",
                      }}
                    >
                      $24
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#5A6473",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#E6F4EE",
                        color: "#1D9E75",
                        padding: "3px 8px",
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 8l3 3 7-7" />
                      </svg>
                      Verified
                    </span>
                    @stasdi01 · 12 min ago
                  </div>
                </div>
              </div>
              {/* Badge float */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12%",
                  right: "6%",
                  background: "#FFFFFF",
                  padding: "10px 12px",
                  borderRadius: 12,
                  boxShadow:
                    "0 30px 60px -25px rgba(10,18,32,0.20), 0 10px 24px -12px rgba(10,18,32,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: "#E6F4EE",
                    color: "#1D9E75",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 14s5-3.5 5-8a5 5 0 10-10 0c0 4.5 5 8 5 8z" />
                    <circle cx="8" cy="6" r="1.8" />
                  </svg>
                </span>
                Pickup near Olin Hall
              </div>
            </div>
            <div className="lp-sol-flip-copy" style={{ order: 2 }}>
              <span
                style={{
                  display: "inline-block",
                  color: "#00599B",
                  marginBottom: 14,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Browse &amp; list
              </span>
              <h2
                style={{
                  fontSize: "clamp(30px, 3.6vw, 42px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  fontWeight: 700,
                  margin: "0 0 20px",
                  color: "#0A1220",
                }}
              >
                Snap, price, post. In under two minutes.
              </h2>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  margin: "0 0 16px",
                  lineHeight: 1.65,
                  maxWidth: 460,
                }}
              >
                Selling is a couple of taps: a photo, a price, a category.
                Buying is faster — search just the listings inside your school,
                filter by what you actually want, save what you&apos;re eyeing
                for later.
              </p>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  margin: 0,
                  lineHeight: 1.65,
                  maxWidth: 460,
                }}
              >
                Everything stays inside your campus, where deals can actually
                happen.
              </p>
            </div>
          </div>

          {/* Step 3: Meet */}
          <div
            className="lp-sol-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 88,
              alignItems: "center",
              padding: "80px 0",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  color: "#00599B",
                  marginBottom: 14,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Meet
              </span>
              <h2
                style={{
                  fontSize: "clamp(30px, 3.6vw, 42px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  fontWeight: 700,
                  margin: "0 0 20px",
                  color: "#0A1220",
                }}
              >
                Chat anonymously. Meet on the quad.
              </h2>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  margin: "0 0 16px",
                  lineHeight: 1.65,
                  maxWidth: 460,
                }}
              >
                Message buyers and sellers in-app under your handle — no phone
                numbers needed until you&apos;re ready. When you are, agree on a
                campus spot, hand off in person, and you&apos;re done.
              </p>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  margin: 0,
                  lineHeight: 1.65,
                  maxWidth: 460,
                }}
              >
                No shipping labels. No tracking numbers. No marketplace fees.
              </p>
            </div>
            <div
              className="lp-chat-art"
              style={{
                aspectRatio: "1.08 / 1",
                background: "linear-gradient(180deg, #F1F6FB 0%, #E5EEF6 100%)",
                borderRadius: 24,
                border: "1px solid #EFF2F6",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Chat mockup */}
              <div
                style={{
                  position: "absolute",
                  left: "8%",
                  right: "8%",
                  top: "8%",
                  bottom: "8%",
                  background: "#FFFFFF",
                  borderRadius: 18,
                  boxShadow: "0 8px 24px -10px rgba(10,18,32,0.10)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid #EFF2F6",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: "#E5EEF6",
                      color: "#00599B",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    S
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      @stasdi01
                    </div>
                    <div style={{ fontSize: 11, color: "#5A6473" }}>
                      Re: Mini-fridge Galanz
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "#8893A2",
                      marginBottom: 4,
                    }}
                  >
                    Today
                  </div>
                  <div
                    className="lp-chat-bubble-them"
                    style={{
                      alignSelf: "flex-start",
                      background: "#E5EEF6",
                      color: "#0A1220",
                      padding: "10px 14px",
                      borderRadius: 14,
                      borderBottomLeftRadius: 4,
                      fontSize: 13,
                      lineHeight: 1.4,
                      maxWidth: "80%",
                    }}
                  >
                    Hey! Is the mini-fridge still available?
                  </div>
                  <div
                    className="lp-chat-bubble-me"
                    style={{
                      alignSelf: "flex-end",
                      background: "#00599B",
                      color: "#FFFFFF",
                      padding: "10px 14px",
                      borderRadius: 14,
                      borderBottomRightRadius: 4,
                      fontSize: 13,
                      lineHeight: 1.4,
                      maxWidth: "80%",
                    }}
                  >
                    Yep — pickup near Olin around 4?
                  </div>
                  <div
                    className="lp-chat-bubble-them"
                    style={{
                      alignSelf: "flex-start",
                      background: "#E5EEF6",
                      color: "#0A1220",
                      padding: "10px 14px",
                      borderRadius: 14,
                      borderBottomLeftRadius: 4,
                      fontSize: 13,
                      lineHeight: 1.4,
                      maxWidth: "80%",
                    }}
                  >
                    Perfect. Cash okay?
                  </div>
                  <div
                    className="lp-typing"
                    style={{
                      alignSelf: "flex-start",
                      display: "inline-flex",
                      gap: 3,
                      padding: "10px 14px",
                      background: "#E5EEF6",
                      borderRadius: 14,
                      borderBottomLeftRadius: 4,
                    }}
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Trust ── */}
      <section
        className="lp-section"
        style={{ padding: "120px 0", background: "#FFFFFF" }}
      >
        <div
          className="lp-container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}
        >
          <div
            className="lp-trust-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 88,
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#00599B",
                  marginBottom: 12,
                }}
              >
                Built for trust
              </span>
              <h2
                style={{
                  fontSize: "clamp(30px, 3.6vw, 42px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.08,
                  fontWeight: 700,
                  margin: "0 0 22px",
                  color: "#0A1220",
                }}
              >
                Your account stays yours.
              </h2>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  lineHeight: 1.65,
                  margin: "0 0 16px",
                  maxWidth: 480,
                }}
              >
                DormSy never shares your email or phone number with other
                students. Your real name only shows if you choose to share it.
                Every transaction stays between two verified people on the same
                campus.
              </p>
              <p
                style={{
                  color: "#5A6473",
                  fontSize: 16,
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: 480,
                }}
              >
                We don&apos;t sell your data. We don&apos;t run ads against your
                messages. The only thing we want is for your campus to have a
                marketplace that actually works for it.
              </p>
            </div>
            <div
              style={{
                aspectRatio: "1.05 / 1",
                background: "linear-gradient(180deg, #F1F6FB 0%, #E5EEF6 100%)",
                borderRadius: 24,
                border: "1px solid #EFF2F6",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "72%",
                  aspectRatio: "1",
                  border: "1.5px dashed rgba(0,89,155,0.20)",
                  borderRadius: 999,
                }}
              />
              <svg
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "50%",
                }}
                viewBox="0 0 200 220"
                fill="none"
              >
                <defs>
                  <linearGradient
                    id="lp-shieldGrad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#1972B5" />
                    <stop offset="100%" stopColor="#00599B" />
                  </linearGradient>
                </defs>
                <path
                  d="M100 10 L180 40 V110 C180 160 145 195 100 210 C55 195 20 160 20 110 V40 Z"
                  fill="url(#lp-shieldGrad)"
                  stroke="#0A4377"
                  strokeWidth="2"
                />
                <path
                  d="M100 10 L180 40 V110 C180 160 145 195 100 210 V10 Z"
                  fill="rgba(255,255,255,0.06)"
                />
                <rect
                  x="50"
                  y="80"
                  width="100"
                  height="46"
                  rx="10"
                  fill="#FFFFFF"
                />
                <text
                  x="100"
                  y="106"
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                  fontSize="20"
                  fill="#0A1220"
                  letterSpacing="-0.025em"
                >
                  DormSy
                </text>
                <circle cx="96" cy="103" r="2" fill="#00599B" />
                <rect
                  x="60"
                  y="138"
                  width="80"
                  height="22"
                  rx="6"
                  fill="#FFFFFF"
                />
                <g transform="translate(70,144)">
                  <rect
                    x="0"
                    y="0"
                    width="10"
                    height="10"
                    rx="1.5"
                    fill="none"
                    stroke="#00599B"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M2.5 5 L5 7.5 L8 3"
                    stroke="#1D9E75"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <text
                  x="100"
                  y="155"
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="11"
                  fontWeight="600"
                  fill="#5A6473"
                  letterSpacing="0.4em"
                >
                  ••••••••
                </text>
              </svg>
              {/* Satellites */}
              {[
                {
                  cls: "s1",
                  pos: {
                    top: "6%",
                    left: "50%",
                    transform: "translateX(-50%)",
                  },
                  bg: "linear-gradient(180deg, #1972B5, #00599B)",
                  color: "#FFFFFF",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="6" width="18" height="14" rx="2" />
                      <path d="M3 8l9 6 9-6" />
                    </svg>
                  ),
                },
                {
                  cls: "s2",
                  pos: { top: "32%", left: "6%" },
                  bg: "#FFFFFF",
                  color: "#00599B",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00599B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 018 0v3" />
                    </svg>
                  ),
                },
                {
                  cls: "s3",
                  pos: { top: "32%", right: "6%" },
                  bg: "linear-gradient(180deg, #2EB28A, #1D9E75)",
                  color: "#FFFFFF",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V6l8-4z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  cls: "s4",
                  pos: { bottom: "12%", left: "14%" },
                  bg: "#FFFFFF",
                  color: "#00599B",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00599B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2" />
                    </svg>
                  ),
                },
                {
                  cls: "s5",
                  pos: { bottom: "6%", right: "26%" },
                  bg: "linear-gradient(180deg, #1972B5, #00599B)",
                  color: "#FFFFFF",
                  icon: (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 7l9-4 9 4-9 4-9-4z" />
                      <path d="M3 12l9 4 9-4" />
                      <path d="M3 17l9 4 9-4" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <div
                  key={s.cls}
                  style={{
                    position: "absolute",
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: s.bg,
                    boxShadow:
                      "0 8px 24px -10px rgba(10,18,32,0.10), 0 2px 6px rgba(10,18,32,0.04)",
                    display: "grid",
                    placeItems: "center",
                    color: s.color,
                    ...s.pos,
                  }}
                >
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Outcomes ── */}
      <section
        className="lp-section"
        style={{ padding: "120px 0", background: "#F9FAFB" }}
      >
        <div
          className="lp-container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto 72px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                color: "#00599B",
                marginBottom: 12,
              }}
            >
              The bottom line
            </span>
            <h2
              style={{
                fontSize: "clamp(34px, 4.5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                fontWeight: 700,
                margin: "0 0 16px",
                color: "#0A1220",
              }}
            >
              Why students switch to DormSy
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "#5A6473",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              Real marketplaces are about who you&apos;re trading with. We make
              sure that&apos;s someone you&apos;d already trust.
            </p>
          </div>
          <div
            className="lp-outcomes-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {[
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V6l8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                ),
                title: "Trade with people you trust",
                desc: "Every buyer and seller is a verified student at your school. The verified badge is the floor, not the ceiling.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 14c.5 1 1.7 1.5 3 1.5s2.5-.7 2.5-2c0-1.3-1.2-1.7-3-2-1.8-.3-3-1-3-2.2 0-1.3 1.2-2 2.5-2s2.5.5 3 1.5" />
                    <path d="M12 6.5V8M12 16v1.5" />
                  </svg>
                ),
                title: "Keep every dollar you earn",
                desc: "No listing fees, no transaction cuts, no premium tier. What you price it at is what hits your account.",
              },
              {
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s-7-4.5-7-10a7 7 0 0114 0c0 5.5-7 10-7 10z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                ),
                title: "Hand off across the quad",
                desc: "Skip shipping. Meet up at the library, the union, or your dorm — and walk away done in five minutes.",
              },
            ].map((o) => (
              <article
                key={o.title}
                className="lp-outcome-card"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E9EE",
                  borderRadius: 20,
                  padding: "36px 32px",
                  textAlign: "center",
                  transition:
                    "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background:
                      "linear-gradient(180deg, #1972B5 0%, #00599B 100%)",
                    color: "#FFFFFF",
                    display: "inline-grid",
                    placeItems: "center",
                    marginBottom: 22,
                    boxShadow: "0 12px 24px -10px rgba(0,89,155,0.55)",
                  }}
                >
                  {o.icon}
                </div>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                    margin: "0 0 10px",
                    color: "#0A1220",
                  }}
                >
                  {o.title}
                </h3>
                <p
                  style={{
                    color: "#5A6473",
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  {o.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Availability ── */}
      <section className="lp-section" style={{ padding: "96px 0" }}>
        <div
          className="lp-container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 720,
              margin: "0 auto 72px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                color: "#00599B",
                marginBottom: 12,
              }}
            >
              Availability
            </span>
            <h2
              style={{
                fontSize: "clamp(34px, 4.5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                fontWeight: 700,
                margin: "0 0 16px",
                color: "#0A1220",
              }}
            >
              Where DormSy is live
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "#5A6473",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              We&apos;re rolling out school by school. Don&apos;t see yours?
              Join the waitlist below.
            </p>
          </div>
          <div
            className="lp-colleges-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              maxWidth: 920,
              margin: "0 auto",
            }}
          >
            {LIVE_COLLEGES.map((c) => (
              <div
                key={c.name}
                className="lp-college-card"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #1D9E75",
                  borderRadius: 14,
                  padding: 22,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition:
                    "border-color .2s ease, transform .2s ease, box-shadow .2s ease",
                  boxShadow: "0 0 0 3px rgba(29,158,117,0.08)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: "#E6F4EE",
                    border: "1px solid transparent",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1D9E75",
                    flexShrink: 0,
                  }}
                >
                  {c.abbr}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#1D9E75",
                      marginTop: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: "#1D9E75",
                        display: "inline-block",
                      }}
                    />
                    Live now
                  </div>
                </div>
              </div>
            ))}
            {COMING_SOON_COLLEGES.map((c) => (
              <div
                key={c.name}
                className="lp-college-card"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E6E9EE",
                  borderRadius: 14,
                  padding: 22,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition:
                    "border-color .2s ease, transform .2s ease, box-shadow .2s ease",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: "#F9FAFB",
                    border: "1px solid #EFF2F6",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#8893A2",
                    flexShrink: 0,
                  }}
                >
                  {c.abbr}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#8893A2", marginTop: 3 }}>
                    Coming soon
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: 32,
              color: "#5A6473",
              fontSize: 14,
            }}
          >
            Want DormSy at your school?{" "}
            <a
              href="#waitlist"
              style={{ color: "#00599B", fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("waitlist")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Request your campus →
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. Waitlist ── */}
      <section
        id="waitlist"
        className="lp-section"
        style={{ padding: "96px 0", background: "#F9FAFB" }}
      >
        <div
          className="lp-container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}
        >
          <div
            className="lp-waitlist-box"
            style={{
              maxWidth: 720,
              margin: "0 auto",
              textAlign: "center",
              background: "#FFFFFF",
              border: "1px solid #E6E9EE",
              borderRadius: 20,
              padding: "64px 48px",
              boxShadow: "0 1px 2px rgba(10,18,32,0.04)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 13,
                fontWeight: 600,
                color: "#00599B",
                marginBottom: 8,
              }}
            >
              Waitlist
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                fontWeight: 700,
                margin: "8px 0 0",
                color: "#0A1220",
              }}
            >
              Not at your college yet.
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "#5A6473",
                maxWidth: 480,
                margin: "12px auto 0",
                lineHeight: 1.55,
              }}
            >
              We&apos;re growing fast. Drop your .edu email and we&apos;ll let
              you know the day DormSy launches at your school.
            </p>
            {!waitDone ? (
              <form
                className="lp-waitlist-form"
                onSubmit={handleWaitlist}
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 32,
                  maxWidth: 480,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <input
                  type="email"
                  placeholder="you@yourschool.edu"
                  value={waitEmail}
                  onChange={(e) => setWaitEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    height: 50,
                    padding: "0 18px",
                    borderRadius: 12,
                    border: "1px solid #E6E9EE",
                    background: "#FFFFFF",
                    fontFamily: "inherit",
                    fontSize: 15,
                    color: "#0A1220",
                    outline: "none",
                    transition: "border-color .15s, box-shadow .15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#00599B";
                    e.target.style.boxShadow = "0 0 0 4px rgba(0,89,155,0.10)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E6E9EE";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="submit"
                  className="lp-btn lp-btn-primary lp-btn-lg"
                  disabled={waitLoading}
                >
                  {waitLoading ? "Joining…" : "Join waitlist"}
                </button>
              </form>
            ) : (
              <div
                style={{
                  marginTop: 18,
                  color: "#1D9E75",
                  fontWeight: 600,
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M5 8l2 2 4-4" />
                </svg>
                You&apos;re on the list — we&apos;ll be in touch.
              </div>
            )}
            <div style={{ marginTop: 14, color: "#5A6473", fontSize: 13 }}>
              We&apos;ll only email you about your school&apos;s launch.
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Final CTA ── */}
      <section
        style={{
          position: "relative",
          padding: "120px 0 0",
          textAlign: "center",
          background: "linear-gradient(180deg, #0F2C56 0%, #0A2342 100%)",
          color: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 28px",
          }}
        >
          <h2
            style={{
              color: "#FFFFFF",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              fontWeight: 700,
              margin: "0 0 18px",
            }}
          >
            Your campus marketplace is here.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: 18,
              margin: "0 0 36px",
              maxWidth: 540,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            30 seconds, one .edu email, and you&apos;re in.
          </p>
          <Link href="/sign-up" className="lp-btn lp-btn-white lp-btn-lg">
            Get started
            <svg
              className="lp-arrow"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
        <div
          className="lp-final-art"
          style={{
            marginTop: 56,
            width: "100%",
            height: "clamp(220px, 28vw, 340px)",
            position: "relative",
          }}
        >
          <svg
            style={{
              position: "absolute",
              bottom: -1,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              minWidth: 1200,
              height: "100%",
            }}
            viewBox="0 0 1440 340"
            preserveAspectRatio="xMidYEnd meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="lp-fhill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A4F89" />
                <stop offset="100%" stopColor="#0A2342" />
              </linearGradient>
            </defs>
            <path
              d="M0,200 L200,160 L400,180 L600,140 L800,170 L1000,140 L1200,165 L1440,155 L1440,340 L0,340 Z"
              fill="url(#lp-fhill)"
            />
            <g fill="#0A4377">
              <polygon points="120,220 160,130 200,220" />
              <polygon points="240,225 285,125 330,225" />
              <polygon points="1110,225 1155,125 1200,225" />
              <polygon points="1240,220 1285,130 1330,220" />
            </g>
            <g fill="#1A4F89">
              <polygon points="100,230 140,145 180,230" />
              <polygon points="220,232 265,148 310,232" />
              <polygon points="1130,232 1175,148 1220,232" />
              <polygon points="1260,230 1305,145 1350,230" />
            </g>
            <path
              d="M0,270 L300,240 L600,260 L900,238 L1200,255 L1440,245 L1440,340 L0,340 Z"
              fill="#0A2342"
            />
          </svg>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#0A2342",
          color: "rgba(255,255,255,0.78)",
          padding: "56px 0 36px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div
            className="lp-foot-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
              gap: 40,
            }}
          >
            <div>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 5,
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: "-0.025em",
                  color: "#FFFFFF",
                }}
              >
                DormSy
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: "#00599B",
                    transform: "translateY(-2px)",
                    display: "inline-block",
                  }}
                />
              </Link>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 14,
                  fontSize: 14,
                  maxWidth: 320,
                  lineHeight: 1.6,
                }}
              >
                A campus-only marketplace for verified students. Buy, sell, and
                meet on your own quad.
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  margin: "0 0 16px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Product
              </h4>
              {[
                ["How it works", "#"],
                ["Availability", "#"],
                ["Waitlist", "/waitlist"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    padding: "6px 0",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#FFFFFF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
                  }
                >
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h4
                style={{
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  margin: "0 0 16px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Company
              </h4>
              {[
                ["Contact", "/support"],
                ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    padding: "6px 0",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#FFFFFF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
                  }
                >
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h4
                style={{
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  margin: "0 0 16px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Support
              </h4>
              {[
                ["Help", "/support"],
                ["Feedback", "/feedback"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    padding: "6px 0",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#FFFFFF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
                  }
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div
            style={{
              marginTop: 56,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span>
              © {new Date().getFullYear()} DormSy. Made for college students, by
              college students.
            </span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
