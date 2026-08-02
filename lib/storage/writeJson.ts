import fs from 'fs';
import path from 'path';
import { Octokit } from 'octokit';

// Module-level singleton: reused across calls within the same warm Vercel instance.
// Lazy-initialised so it is only created when a production write actually happens.
let _octokit: Octokit | null = null;
function getOctokit(): Octokit {
  if (!_octokit) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN is not set.');
    _octokit = new Octokit({ auth: token });
  }
  return _octokit;
}

export interface BatchWriteItem<T = any> {
  relativePath: string;
  data: T;
}

/**
 * Writes multiple JSON files to the /data directory.
 * In development, writes directly to the local filesystem.
 * In production (Vercel), commits all files to GitHub in a SINGLE atomic commit.
 */
export async function writeBatchJson(
  files: BatchWriteItem[],
  commitMessage?: string
): Promise<void> {
  if (files.length === 0) return;

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development: Write directly to filesystem
    for (const file of files) {
      const filePath = path.join(process.cwd(), 'data', file.relativePath);
      const jsonString = JSON.stringify(file.data, null, 2);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, jsonString, 'utf-8');
    }
    return;
  }

  // Production: Single atomic GitHub commit containing all updated files
  const octokit = getOctokit();
  const owner = process.env.GITHUB_OWNER || 'Sp2736';
  const repo = process.env.GITHUB_REPO || 'mastery-os';
  const branch = process.env.GITHUB_BRANCH || 'main';

  // 1. Get current commit on branch
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const latestCommitSha = refData.object.sha;

  // 2. Get tree of current commit
  const { data: commitData } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });
  const baseTreeSha = commitData.tree.sha;

  // 3. Create tree payload
  const tree = files.map((file) => ({
    path: `data/${file.relativePath.replace(/\\/g, '/')}`,
    mode: '100644' as const,
    type: 'blob' as const,
    content: JSON.stringify(file.data, null, 2),
  }));

  // 4. Create new Git Tree
  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree,
  });

  // 5. Create new single Commit
  const message =
    commitMessage ||
    `chore(data): batch update [${files.map((f) => f.relativePath).join(', ')}] — ${new Date().toISOString()}`;

  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  // 6. Update branch ref to the new commit
  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha,
  });
}

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
  const octokit = getOctokit();
  const owner = process.env.GITHUB_OWNER || 'Sp2736';
  const repo = process.env.GITHUB_REPO || 'mastery-os';
  const githubPath = `data/${relativePath}`;

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

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: githubPath,
    message: `chore(data): update ${relativePath} — ${new Date().toISOString()}`,
    content: Buffer.from(jsonString).toString('base64'),
    sha,
  });
}

/**
 * Helper to write a user-specific JSON file securely.
 */
export async function writeUserJson<T>(userId: string, filename: string, data: T): Promise<void> {
  if (userId !== 'swayam') {
    throw new Error('Invalid user ID. Path traversal prevented.');
  }
  return writeJson<T>(`users/${userId}/${filename}`, data);
}

/**
 * Helper to write multiple user-specific JSON files in a single atomic commit.
 */
export async function writeMultipleUserJson(
  userId: string,
  files: Array<{ filename: string; data: any }>,
  commitMessage?: string
): Promise<void> {
  if (userId !== 'swayam') {
    throw new Error('Invalid user ID. Path traversal prevented.');
  }
  return writeBatchJson(
    files.map((f) => ({ relativePath: `users/${userId}/${f.filename}`, data: f.data })),
    commitMessage || `chore(user): batch update ${userId} [${files.map((f) => f.filename).join(', ')}] — ${new Date().toISOString()}`
  );
}

