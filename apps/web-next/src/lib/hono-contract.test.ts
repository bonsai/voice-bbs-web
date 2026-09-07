import { describe, expect, it } from "vitest";
import { api } from "./api";
describe("Hono FE boundary", () => {
  it("exposes the complete shared endpoint set", () => {
    expect(Object.keys(api)).toEqual(expect.arrayContaining(["healthz", "categories", "threads", "createThread", "posts", "createPost", "deletePost", "count"]));
  });
});
