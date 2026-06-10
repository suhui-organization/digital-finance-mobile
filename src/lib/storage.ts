import { ReviewForm } from "./types";

/**
 * Draft storage with schemaVersion for future migrations (DESIGN_DOC 11.3).
 * Stores main form + both branch snapshots so switching branches doesn't lose data.
 */

const STORAGE_KEY = "finance_review_draft";
const SCHEMA_VERSION = 2;

interface DraftV2 {
  schemaVersion: number;
  /** Main form + individual branch data */
  form: Partial<ReviewForm>;
}

export function saveDraft(data: Partial<ReviewForm>): void {
  try {
    const draft: DraftV2 = {
      schemaVersion: SCHEMA_VERSION,
      form: data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // quota exceeded, ignore
  }
}

export function loadDraft(): Partial<ReviewForm> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // V2 draft with schemaVersion
    if (parsed && typeof parsed.schemaVersion === "number" && parsed.schemaVersion >= 2) {
      return (parsed as DraftV2).form;
    }

    // V1 legacy draft (no schemaVersion) — degrade gracefully
    if (parsed && typeof parsed === "object") {
      return parsed as Partial<ReviewForm>;
    }

    return null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}