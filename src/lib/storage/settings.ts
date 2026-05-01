const TOKEN_KEY = "giv:token";
const REPOS_KEY = "giv:repos";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ストレージ制限環境では無視
  }
}

export function removeToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ストレージ制限環境では無視
  }
}

export function getRepos(): string[] {
  try {
    const raw = localStorage.getItem(REPOS_KEY);
    if (!raw) return [];
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
  try {
    const repos = getRepos();
    if (!repos.includes(repo)) {
      repos.push(repo);
      localStorage.setItem(REPOS_KEY, JSON.stringify(repos));
    }
  } catch {
    // ストレージ制限環境では無視
  }
}

export function removeRepo(repo: string): void {
  try {
    const repos = getRepos().filter((r) => r !== repo);
    localStorage.setItem(REPOS_KEY, JSON.stringify(repos));
  } catch {
    // ストレージ制限環境では無視
  }
}
