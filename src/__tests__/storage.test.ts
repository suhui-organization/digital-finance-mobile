import { saveDraft, loadDraft, clearDraft } from "../lib/storage";
import { ReviewForm } from "../lib/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

describe("saveDraft", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("应保存草稿到 localStorage", () => {
    saveDraft({ customerName: "张三", age: 35 });
    const raw = localStorageMock.getItem("finance_review_draft");
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.form.customerName).toBe("张三");
    expect(parsed.form.age).toBe(35);
  });

  it("应保存空对象草稿", () => {
    saveDraft({});
    const raw = localStorageMock.getItem("finance_review_draft");
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.form).toEqual({});
  });
});

describe("loadDraft", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("无存储时应返回null", () => {
    expect(loadDraft()).toBeNull();
  });

  it("应加载保存的草稿", () => {
    saveDraft({ customerName: "李四", loanAmount: 300000 });
    const draft = loadDraft();
    expect(draft).not.toBeNull();
    expect(draft!.customerName).toBe("李四");
    expect(draft!.loanAmount).toBe(300000);
  });
});

describe("clearDraft", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("应清除已保存的草稿", () => {
    saveDraft({ customerName: "王五" });
    expect(loadDraft()).not.toBeNull();

    clearDraft();
    expect(loadDraft()).toBeNull();
  });
});
