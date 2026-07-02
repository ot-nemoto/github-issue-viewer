// Closes/Fixes/Resolves #123 または owner/repo#123 形式を抽出
const RELATED_ISSUE_RE =
  /\b(?:closes?|fixes?|resolves?)\b\s+(?:[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)?#(\d+)/gi;

export function parseRelatedIssues(body: string | null): number[] {
  if (!body) return [];
  const numbers = new Set<number>();
  for (const match of body.matchAll(RELATED_ISSUE_RE)) {
    numbers.add(Number(match[1]));
  }
  return [...numbers];
}

// https://github.com/owner/repo (.git 付き、/issues 等のパス付きを含む) から owner/repo を抽出
const GITHUB_URL_RE =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/.*)?\/?$/i;

export function extractOwnerRepo(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(GITHUB_URL_RE);
  if (!match) return trimmed;
  const [, owner, name] = match;
  return `${owner}/${name}`;
}
