const TOKEN_KEY = "giv:token";
const REPOS_KEY = "giv:repos";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getRepos(): string[] {
  const raw = localStorage.getItem(REPOS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function addRepo(repo: string): void {
  const repos = getRepos();
  if (!repos.includes(repo)) {
    repos.push(repo);
    localStorage.setItem(REPOS_KEY, JSON.stringify(repos));
  }
}

export function removeRepo(repo: string): void {
  const repos = getRepos().filter((r) => r !== repo);
  localStorage.setItem(REPOS_KEY, JSON.stringify(repos));
}
