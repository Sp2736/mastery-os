import type { NextConfig } from "next";

const isExport = process.env.STATIC_EXPORT === 'true';
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

// Compute basePath for GitHub Pages subpath deployment if applicable
// (e.g. /mastery-os for https://username.github.io/mastery-os)
const repoName = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
  : '';
const isUserPage = repoName.endsWith('.github.io');

const basePath = process.env.BASE_PATH !== undefined
  ? process.env.BASE_PATH
  : (isGithubActions && !isUserPage && repoName ? repoName : '');

const nextConfig: NextConfig = {
  ...(isExport ? { output: 'export' as const } : {}),
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
