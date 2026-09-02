import type { NextConfig } from "next";

// Security headers, sent on every response. HSTS is the one that actually
// enforces "encryption in transit" at the browser level — once a browser has
// seen it once, it refuses to even attempt a plain-HTTP request to this host
// for the given max-age, closing the SSL-stripping window that a bare
// "we have an SSL cert" claim doesn't. The rest are standard hardening with
// no functional downside for this app.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
