/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Uploaded files are served dynamically from storage/uploads (see
    // src/app/uploads/[...path]/route.ts), not from the static public/
    // folder, so Next's built-in image optimizer can't read them from
    // disk. Skipping optimization avoids that mismatch and the extra
    // "sharp" dependency it requires in production.
    unoptimized: true,
  },
};

export default nextConfig;
