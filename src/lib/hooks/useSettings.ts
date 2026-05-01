"use client";

import {
  addRepo,
  getRepos,
  getToken,
  removeRepo,
  removeToken,
  setToken,
} from "@/lib/storage/settings";
import { useCallback, useEffect, useState } from "react";

export function useSettings() {
  const [token, setTokenState] = useState<string | null>(null);
  const [repos, setReposState] = useState<string[]>([]);

  useEffect(() => {
    setTokenState(getToken());
    setReposState(getRepos());
  }, []);

  const saveToken = useCallback((t: string) => {
    setToken(t);
    setTokenState(t);
  }, []);

  const deleteToken = useCallback(() => {
    removeToken();
    setTokenState(null);
  }, []);

  const addRepository = useCallback((repo: string) => {
    addRepo(repo);
    setReposState(getRepos());
  }, []);

  const removeRepository = useCallback((repo: string) => {
    removeRepo(repo);
    setReposState(getRepos());
  }, []);

  return {
    token,
    repos,
    saveToken,
    deleteToken,
    addRepository,
    removeRepository,
  };
}
