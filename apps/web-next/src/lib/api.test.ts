import { describe, expect, it } from "vitest";
import { api } from "./api";

describe("Next Hono API client", () => {
  it("exposes the shared API surface", () => {
    expect(typeof api.healthz).toBe("function");
    expect(typeof api.categories).toBe("function");
    expect(typeof api.threads).toBe("function");
    expect(typeof api.posts).toBe("function");
    expect(typeof api.createPost).toBe("function");
    expect(typeof api.deletePost).toBe("function");
    expect(typeof api.count).toBe("function");
  });
});
