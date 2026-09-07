import { describe, expect, it } from "vitest";
import { api } from "./api";
describe("shared Hono API contract", () => {
  it("has read/write endpoints for the FE", () => {
    expect(Object.keys(api)).toEqual(expect.arrayContaining(["healthz", "categories", "threads", "createThread", "posts", "createPost", "deletePost", "count"]));
  });
});
