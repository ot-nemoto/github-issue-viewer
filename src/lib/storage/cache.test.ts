// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAllCache,
  clearCache,
  DEFAULT_TTL,
  getCache,
  setCache,
} from "./cache";

beforeEach(() => {
  localStorage.clear();
});

describe("setCache / getCache", () => {
  it("データを保存・取得できる", () => {
    setCache("owner/repo", { items: [1, 2, 3] });
    expect(getCache("owner/repo")).toEqual({ items: [1, 2, 3] });
  });

  it("存在しないキーは null を返す", () => {
    expect(getCache("owner/repo")).toBeNull();
  });

  it("TTL 期限切れのキャッシュは null を返す", () => {
    const expired = {
      data: { items: [] },
      timestamp: Date.now() - DEFAULT_TTL - 1,
    };
    localStorage.setItem("giv:cache:owner/repo", JSON.stringify(expired));
    expect(getCache("owner/repo")).toBeNull();
  });

  it("TTL 内のキャッシュはデータを返す", () => {
    const fresh = {
      data: { items: [1] },
      timestamp: Date.now() - DEFAULT_TTL + 10_000,
    };
    localStorage.setItem("giv:cache:owner/repo", JSON.stringify(fresh));
    expect(getCache("owner/repo")).toEqual({ items: [1] });
  });

  it("カスタム TTL を指定できる", () => {
    const entry = { data: "test", timestamp: Date.now() - 1_000 };
    localStorage.setItem("giv:cache:key", JSON.stringify(entry));
    expect(getCache("key", 500)).toBeNull(); // 500ms → 期限切れ
    expect(getCache("key", 2_000)).toBe("test"); // 2000ms → 有効
  });

  it("壊れた JSON は null を返す", () => {
    localStorage.setItem("giv:cache:owner/repo", "invalid-json");
    expect(getCache("owner/repo")).toBeNull();
  });
});

describe("clearCache", () => {
  it("指定したキーのキャッシュを削除できる", () => {
    setCache("owner/repo", { items: [] });
    clearCache("owner/repo");
    expect(getCache("owner/repo")).toBeNull();
  });

  it("他のキャッシュには影響しない", () => {
    setCache("owner/repo1", { items: [1] });
    setCache("owner/repo2", { items: [2] });
    clearCache("owner/repo1");
    expect(getCache("owner/repo2")).toEqual({ items: [2] });
  });
});

describe("clearAllCache", () => {
  it("すべてのキャッシュを削除できる", () => {
    setCache("owner/repo1", { items: [] });
    setCache("owner/repo2", { items: [] });
    clearAllCache();
    expect(getCache("owner/repo1")).toBeNull();
    expect(getCache("owner/repo2")).toBeNull();
  });

  it("キャッシュ以外の localStorage エントリは削除しない", () => {
    setCache("owner/repo", { items: [] });
    localStorage.setItem("giv:token", "my-token");
    clearAllCache();
    expect(getCache("owner/repo")).toBeNull();
    expect(localStorage.getItem("giv:token")).toBe("my-token");
  });
});
