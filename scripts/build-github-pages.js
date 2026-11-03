#!/usr/bin/env node

/**
 * Static export builder for GitHub Pages.
 *
 * 1. Temporarily moves `app/api` to `.api-backup` so Next.js static export
 *    doesn't fail on dynamic server-only POST/PATCH Route Handlers.
 * 2. Runs `npx next build` with STATIC_EXPORT=true and NEXT_PUBLIC_DEMO_MODE=true.
 * 3. Creates `.nojekyll` in `out/` so GitHub Pages serves `_next` assets.
 * 4. Restores `app/api` from `.api-backup`.
 * 5. Outputs pure static HTML in `out/` ready for GitHub Pages.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'app', 'api');
const backupDir = path.join(rootDir, '.api-backup');
const outDir = path.join(rootDir, 'out');

let moved = false;

try {
  if (fs.existsSync(apiDir)) {
    console.log('📦 Stashing app/api for static export...');
    fs.renameSync(apiDir, backupDir);
    moved = true;
  }

  console.log('🚀 Building static export for GitHub Pages...');
  const nextCmd = process.platform === 'win32' ? 'npx.cmd next build' : 'npx next build';
  execSync(nextCmd, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      STATIC_EXPORT: 'true',
      NEXT_PUBLIC_DEMO_MODE: 'true',
    },
  });

  // Ensure .nojekyll exists in out/
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    console.log('📄 Created out/.nojekyll');
  }

  console.log('✅ Static export completed successfully in /out');
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exitCode = 1;
} finally {
  if (moved && fs.existsSync(backupDir)) {
    console.log('🔄 Restoring app/api...');
    fs.renameSync(backupDir, apiDir);
  }
}
