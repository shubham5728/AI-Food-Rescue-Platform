/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  /**
   * Lets a production build live somewhere other than `.next`, so it can be
   * built and served while `next dev` is running against the same checkout.
   * Set the same value for both `next build` and `next start`.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
