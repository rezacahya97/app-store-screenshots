"use client";
import { useEffect, useRef, useState } from "react";
import { STORAGE_KEY } from "./constants";
import { DEFAULT_PROJECT } from "./defaults";
import type { ProjectState } from "./types";

function load(): ProjectState {
  if (typeof window === "undefined") return DEFAULT_PROJECT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECT;
    const parsed = JSON.parse(raw) as ProjectState;
    // Merge any new device decks added since last save
    return {
      ...DEFAULT_PROJECT,
      ...parsed,
      slidesByDevice: { ...DEFAULT_PROJECT.slidesByDevice, ...parsed.slidesByDevice },
    };
  } catch {
    return DEFAULT_PROJECT;
  }
}

function save(state: ProjectState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Autosave failed", e);
  }
}

export function useProject() {
  const [state, setState] = useState<ProjectState>(DEFAULT_PROJECT);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate once from localStorage
  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  // Debounced autosave
  useEffect(() => {
    if (!hydrated) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save(state);
      setSavedAt(Date.now());
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, hydrated]);

  function reset() {
    setState(DEFAULT_PROJECT);
  }

  return { state, setState, hydrated, savedAt, reset };
}
