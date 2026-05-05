// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GitHubIssue, GitHubPullRequest, GitHubUser } from "../github/types";
import { useGitHubData } from "./useGitHubData";

// --- fixtures ---

const mockUser: GitHubUser = {
  login: "testuser",
  id: 1,
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  html_url: "https://github.com/testuser",
};

const makeIssue = (n: number, updatedAt: string): GitHubIssue => ({
  id: n,
  number: n,
  title: `Issue ${n}`,
  state: "open",
  body: null,
  html_url: `https://github.com/owner/repo/issues/${n}`,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: updatedAt,
  closed_at: null,
  labels: [],
  assignees: [],
  milestone: null,
  user: mockUser,
});

const makePR = (n: number, updatedAt: string): GitHubPullRequest => ({
  id: n + 100,
  number: n,
  title: `PR ${n}`,
  state: "open",
  draft: false,
  body: null,
  html_url: `https://github.com/owner/repo/pull/${n}`,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: updatedAt,
  closed_at: null,
  merged_at: null,
  labels: [],
  assignees: [],
  milestone: null,
  user: mockUser,
});

function mockFetch(...pages: unknown[]) {
  let call = 0;
  vi.mocked(fetch).mockImplementation(() => {
    const data = pages[call++] ?? [];
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(data),
      headers: { get: () => null },
    } as unknown as Response);
  });
}

// --- tests ---

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGitHubData — リポジトリ未設定", () => {
  it("リポジトリが未設定の場合は success + data=[] + hasRepos=false", async () => {
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    const state = result.current.state;
    if (state.status === "success") {
      expect(state.data).toEqual([]);
      expect(state.hasRepos).toBe(false);
    }
  });
});

describe("useGitHubData — データ取得", () => {
  beforeEach(() => {
    localStorage.setItem("giv:repos", JSON.stringify(["owner/repo"]));
  });

  it("Issue と PR を取得して success になる", async () => {
    mockFetch(
      [makeIssue(1, "2024-01-02T00:00:00Z")],
      [makePR(2, "2024-01-01T00:00:00Z")],
    );
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    const state = result.current.state;
    if (state.status === "success") {
      expect(state.hasRepos).toBe(true);
      expect(state.data).toHaveLength(2);
    }
  });

  it("PR フィールドを持つ Issue は除外される", async () => {
    const issueWithPR = {
      ...makeIssue(1, "2024-01-01T00:00:00Z"),
      pull_request: { url: "", html_url: "" },
    };
    mockFetch([issueWithPR], []);
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    const state = result.current.state;
    if (state.status === "success") {
      expect(state.data).toHaveLength(0);
    }
  });

  it("アイテムに repo フィールドが付与される", async () => {
    mockFetch([makeIssue(1, "2024-01-01T00:00:00Z")], []);
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    const state = result.current.state;
    if (state.status === "success") {
      expect(state.data[0].repo).toBe("owner/repo");
    }
  });

  it("updated_at の降順で並び替えられる", async () => {
    const issue1 = makeIssue(1, "2024-01-01T00:00:00Z");
    const issue2 = makeIssue(2, "2024-01-03T00:00:00Z");
    const issue3 = makeIssue(3, "2024-01-02T00:00:00Z");
    mockFetch([issue1, issue2, issue3], []);
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    const state = result.current.state;
    if (state.status === "success") {
      expect(state.data.map((i) => i.number)).toEqual([2, 3, 1]);
    }
  });

  it("API エラー時は error 状態になる", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: () => Promise.resolve({ message: "Bad credentials" }),
      headers: { get: () => null },
    } as unknown as Response);
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    const state = result.current.state;
    if (state.status === "error") {
      expect(state.message).toBe("Bad credentials");
    }
  });

  it("不正なリポジトリ形式はエラーになる", async () => {
    localStorage.setItem("giv:repos", JSON.stringify(["invalid-repo"]));
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    const state = result.current.state;
    if (state.status === "error") {
      expect(state.message).toContain("invalid-repo");
    }
  });
});

describe("useGitHubData — キャッシュ", () => {
  beforeEach(() => {
    localStorage.setItem("giv:repos", JSON.stringify(["owner/repo"]));
  });

  it("キャッシュがある場合は fetch を呼ばない", async () => {
    const cached = [
      {
        ...makeIssue(1, "2024-01-01T00:00:00Z"),
        kind: "issue",
        repo: "owner/repo",
      },
    ];
    localStorage.setItem(
      "giv:cache:owner/repo",
      JSON.stringify({ data: cached, timestamp: Date.now() }),
    );
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refresh() でキャッシュを無視して再取得する", async () => {
    const cached = [
      {
        ...makeIssue(1, "2024-01-01T00:00:00Z"),
        kind: "issue",
        repo: "owner/repo",
      },
    ];
    localStorage.setItem(
      "giv:cache:owner/repo",
      JSON.stringify({ data: cached, timestamp: Date.now() }),
    );
    mockFetch([makeIssue(2, "2024-01-02T00:00:00Z")], []);
    const { result } = renderHook(() => useGitHubData());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => {
      result.current.refresh();
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(fetch).toHaveBeenCalled();
  });
});
