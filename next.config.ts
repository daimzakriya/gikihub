import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers applied to every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Stop MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send referrer on same origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Enforce HTTPS for 2 years
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Block XSS in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Permissions policy — disable unnecessary browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} 'unsafe-inline'`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://*.supabase.co https://*.tile.openstreetmap.org",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Compress responses
  compress: true,

  // Strict mode for React
  reactStrictMode: true,

  // Output standalone for Docker if needed later
  // output: "standalone",
};

export default nextConfig;
