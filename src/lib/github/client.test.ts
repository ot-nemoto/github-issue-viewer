import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GitHubApiError,
  getIssues,
  getPullRequests,
  getRepository,
  validateToken,
} from "./client";
import type {
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepository,
  GitHubUser,
} from "./types";

// --- helpers ---

function mockResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: () => Promise.resolve(data),
    headers: { get: (key: string) => headers[key.toLowerCase()] ?? null },
  });
}

// --- fixtures ---

const mockUser: GitHubUser = {
  login: "testuser",
  id: 1,
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  html_url: "https://github.com/testuser",
};

const mockRepo: GitHubRepository = {
  id: 123,
  name: "test-repo",
  full_name: "testuser/test-repo",
  private: false,
  html_url: "https://github.com/testuser/test-repo",
  description: "A test repository",
};

const mockIssue: GitHubIssue = {
  id: 1,
  number: 1,
  title: "Test Issue",
  state: "open",
  body: "Issue body",
  html_url: "https://github.com/testuser/test-repo/issues/1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  closed_at: null,
  labels: [],
  assignees: [],
  milestone: null,
  user: mockUser,
};

const mockPR: GitHubPullRequest = {
  id: 2,
  number: 2,
  title: "Test PR",
  state: "open",
  draft: false,
  body: "PR body",
  html_url: "https://github.com/testuser/test-repo/pull/2",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  closed_at: null,
  merged_at: null,
  labels: [],
  assignees: [],
  milestone: null,
  user: mockUser,
};

// --- tests ---

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("validateToken", () => {
  it("有効なトークンでユーザー情報を返す", async () => {
    vi.mocked(fetch).mockReturnValueOnce(mockResponse(mockUser) as never);
    const result = await validateToken("valid-token");
    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer valid-token",
        }),
      }),
    );
  });

  it("401 で GitHubApiError(status=401) を throw する", async () => {
    vi.mocked(fetch).mockReturnValue(
      mockResponse({ message: "Bad credentials" }, 401) as never,
    );
    const error = await validateToken("bad-token").catch((e) => e);
    expect(error).toBeInstanceOf(GitHubApiError);
    expect(error.status).toBe(401);
    expect(error.message).toBe("Bad credentials");
  });

  it("403 で GitHubApiError(status=403) を throw する", async () => {
    vi.mocked(fetch).mockReturnValue(
      mockResponse({ message: "Forbidden" }, 403) as never,
    );
    const error = await validateToken("token").catch((e) => e);
    expect(error).toBeInstanceOf(GitHubApiError);
    expect(error.status).toBe(403);
  });

  it("レスポンスボディが JSON でない場合は statusText をメッセージにする", async () => {
    vi.mocked(fetch).mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("not json")),
        headers: { get: () => null },
      }) as never,
    );
    const error = await validateToken("token").catch((e) => e);
    expect(error).toBeInstanceOf(GitHubApiError);
    expect(error.status).toBe(500);
    expect(error.message).toBe("Internal Server Error");
  });
});

describe("getRepository", () => {
  it("リポジトリ情報を返す", async () => {
    vi.mocked(fetch).mockReturnValueOnce(mockResponse(mockRepo) as never);
    const result = await getRepository("testuser", "test-repo", "token");
    expect(result).toEqual(mockRepo);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/testuser/test-repo",
      expect.anything(),
    );
  });

  it("404 で GitHubApiError(status=404) を throw する", async () => {
    vi.mocked(fetch).mockReturnValue(
      mockResponse({ message: "Not Found" }, 404) as never,
    );
    const error = await getRepository("x", "y", "token").catch((e) => e);
    expect(error).toBeInstanceOf(GitHubApiError);
    expect(error.status).toBe(404);
  });
});

describe("getIssues", () => {
  it("Issue 一覧を返す", async () => {
    vi.mocked(fetch).mockReturnValueOnce(mockResponse([mockIssue]) as never);
    const result = await getIssues("testuser", "test-repo", "token");
    expect(result).toEqual([mockIssue]);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/testuser/test-repo/issues?state=all&per_page=100",
      expect.anything(),
    );
  });

  it("複数ページのデータを全件取得する", async () => {
    const page1 = [{ ...mockIssue, id: 1, number: 1 }];
    const page2 = [{ ...mockIssue, id: 2, number: 2 }];
    vi.mocked(fetch)
      .mockReturnValueOnce(
        mockResponse(page1, 200, {
          link: '<https://api.github.com/repos/testuser/test-repo/issues?state=all&per_page=100&page=2>; rel="next"',
        }) as never,
      )
      .mockReturnValueOnce(mockResponse(page2) as never);

    const result = await getIssues("testuser", "test-repo", "token");
    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(1);
    expect(result[1].number).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("429 で GitHubApiError(status=429) を throw する", async () => {
    vi.mocked(fetch).mockReturnValue(
      mockResponse({ message: "rate limit exceeded" }, 429) as never,
    );
    const error = await getIssues("testuser", "test-repo", "token").catch(
      (e) => e,
    );
    expect(error).toBeInstanceOf(GitHubApiError);
    expect(error.status).toBe(429);
  });
});

describe("getPullRequests", () => {
  it("PR 一覧を返す", async () => {
    vi.mocked(fetch).mockReturnValueOnce(mockResponse([mockPR]) as never);
    const result = await getPullRequests("testuser", "test-repo", "token");
    expect(result).toEqual([mockPR]);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/testuser/test-repo/pulls?state=all&per_page=100",
      expect.anything(),
    );
  });

  it("複数ページのデータを全件取得する", async () => {
    const page1 = [{ ...mockPR, id: 1, number: 1 }];
    const page2 = [{ ...mockPR, id: 2, number: 2 }];
    vi.mocked(fetch)
      .mockReturnValueOnce(
        mockResponse(page1, 200, {
          link: '<https://api.github.com/repos/testuser/test-repo/pulls?state=all&per_page=100&page=2>; rel="next"',
        }) as never,
      )
      .mockReturnValueOnce(mockResponse(page2) as never);

    const result = await getPullRequests("testuser", "test-repo", "token");
    expect(result).toHaveLength(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("401 で GitHubApiError(status=401) を throw する", async () => {
    vi.mocked(fetch).mockReturnValue(
      mockResponse({ message: "Bad credentials" }, 401) as never,
    );
    const error = await getPullRequests("testuser", "test-repo", "token").catch(
      (e) => e,
    );
    expect(error).toBeInstanceOf(GitHubApiError);
    expect(error.status).toBe(401);
  });
});
