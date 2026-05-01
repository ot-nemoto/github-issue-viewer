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
