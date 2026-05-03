// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSettings } from "./useSettings";

beforeEach(() => {
  localStorage.clear();
});

describe("useSettings", () => {
  it("初期状態は token=null・repos=[]", () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.token).toBeNull();
    expect(result.current.repos).toEqual([]);
  });

  it("localStorage に token がある場合は初期値として読み込む", () => {
    localStorage.setItem("giv:token", "existing-token");
    const { result } = renderHook(() => useSettings());
    expect(result.current.token).toBe("existing-token");
  });

  it("localStorage に repos がある場合は初期値として読み込む", () => {
    localStorage.setItem("giv:repos", JSON.stringify(["owner/repo"]));
    const { result } = renderHook(() => useSettings());
    expect(result.current.repos).toEqual(["owner/repo"]);
  });

  it("saveToken でトークンを保存できる", () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.saveToken("new-token");
    });
    expect(result.current.token).toBe("new-token");
    expect(localStorage.getItem("giv:token")).toBe("new-token");
  });

  it("deleteToken でトークンを削除できる", () => {
    localStorage.setItem("giv:token", "my-token");
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.deleteToken();
    });
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem("giv:token")).toBeNull();
  });

  it("addRepository でリポジトリを追加できる", () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.addRepository("owner/repo");
    });
    expect(result.current.repos).toEqual(["owner/repo"]);
    expect(localStorage.getItem("giv:repos")).toBe(
      JSON.stringify(["owner/repo"]),
    );
  });

  it("removeRepository でリポジトリを削除できる", () => {
    localStorage.setItem(
      "giv:repos",
      JSON.stringify(["owner/repo1", "owner/repo2"]),
    );
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.removeRepository("owner/repo1");
    });
    expect(result.current.repos).toEqual(["owner/repo2"]);
  });
});
