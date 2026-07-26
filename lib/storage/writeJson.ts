import fs from 'fs';
import path from 'path';
import { Octokit } from 'octokit';

// In-memory cache to debounce redundant writes
const cache = new Map<string, NodeJS.Timeout>();

/**
 * Writes a JSON file to the /data directory.
 * In development, writes directly to the local filesystem.
 * In production (Vercel), commits the file to GitHub using the REST API.
 */
export async function writeJson<T>(relativePath: string, data: T): Promise<void> {
  const isProd = process.env.NODE_ENV === 'production';
  const filePath = path.join(process.cwd(), 'data', relativePath);
  const jsonString = JSON.stringify(data, null, 2);

  if (!isProd) {
    // Development: Write directly to filesystem
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    return;
  }

  // Production: Commit to GitHub via API
  // Debounce logic (wait 3 seconds before committing to avoid spamming the API)
  if (cache.has(relativePath)) {
    clearTimeout(cache.get(relativePath)!);
  }

  const timeout = setTimeout(async () => {
    try {
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        throw new Error('GITHUB_TOKEN is not set.');
      }
      const octokit = new Octokit({ auth: token });
      const owner = process.env.GITHUB_OWNER || 'Sp2736'; 
      const repo = process.env.GITHUB_REPO || 'mastery-os';
      const githubPath = `data/${relativePath}`;

      // 1. Get current file SHA for updating
      let sha: string | undefined = undefined;
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: githubPath,
        });
        if (!Array.isArray(fileData) && fileData.type === 'file') {
          sha = fileData.sha;
        }
      } catch (e: any) {
        if (e.status !== 404) {
          throw e;
        }
      }

      // 2. Commit the new contents
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: githubPath,
        message: `chore(data): update ${relativePath} — ${new Date().toISOString()}`,
        content: Buffer.from(jsonString).toString('base64'),
        sha,
      });
      cache.delete(relativePath);
    } catch (err) {
      console.error(`Failed to commit ${relativePath} to GitHub:`, err);
      // Fallback: write to /tmp in serverless environment
      try {
        const tmpPath = path.join('/tmp', `data_${relativePath.replace(/\//g, '_')}`);
        fs.writeFileSync(tmpPath, jsonString, 'utf-8');
      } catch (fallbackErr) {
        console.error('Fallback write to /tmp failed:', fallbackErr);
      }
    }
  }, 3000);

  cache.set(relativePath, timeout);
}

/**
 * Helper to write a user-specific JSON file securely.
 */
export async function writeUserJson<T>(userId: string, filename: string, data: T): Promise<void> {
  if (userId !== 'swayam' && userId !== 'jalisa') {
    throw new Error('Invalid user ID. Path traversal prevented.');
  }
  return writeJson<T>(`users/${userId}/${filename}`, data);
}
