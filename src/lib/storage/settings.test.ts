// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  addRepo,
  getRepos,
  getToken,
  removeRepo,
  removeToken,
  setToken,
} from "./settings";

beforeEach(() => {
  localStorage.clear();
});

describe("getToken / setToken / removeToken", () => {
  it("未設定の場合は null を返す", () => {
    expect(getToken()).toBeNull();
  });

  it("トークンを保存・取得できる", () => {
    setToken("my-token");
    expect(getToken()).toBe("my-token");
  });

  it("トークンを上書きできる", () => {
    setToken("old-token");
    setToken("new-token");
    expect(getToken()).toBe("new-token");
  });

  it("トークンを削除できる", () => {
    setToken("my-token");
    removeToken();
    expect(getToken()).toBeNull();
  });
});

describe("getRepos / addRepo / removeRepo", () => {
  it("未設定の場合は空配列を返す", () => {
    expect(getRepos()).toEqual([]);
  });

  it("リポジトリを追加・取得できる", () => {
    addRepo("owner/repo");
    expect(getRepos()).toEqual(["owner/repo"]);
  });

  it("同じリポジトリを重複追加しない", () => {
    addRepo("owner/repo");
    addRepo("owner/repo");
    expect(getRepos()).toHaveLength(1);
  });

  it("複数のリポジトリを追加できる", () => {
    addRepo("owner/repo1");
    addRepo("owner/repo2");
    expect(getRepos()).toEqual(["owner/repo1", "owner/repo2"]);
  });

  it("リポジトリを削除できる", () => {
    addRepo("owner/repo1");
    addRepo("owner/repo2");
    removeRepo("owner/repo1");
    expect(getRepos()).toEqual(["owner/repo2"]);
  });

  it("存在しないリポジトリの削除は何もしない", () => {
    addRepo("owner/repo");
    removeRepo("owner/other");
    expect(getRepos()).toEqual(["owner/repo"]);
  });

  it("localStorage が壊れている場合は空配列を返す", () => {
    localStorage.setItem("giv:repos", "invalid-json");
    expect(getRepos()).toEqual([]);
  });
});
