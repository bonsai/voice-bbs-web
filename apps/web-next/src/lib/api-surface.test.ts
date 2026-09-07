import { describe, expect, it } from "vitest";
import { api } from "./api";
describe("Hono API surface", () => { it("contains core endpoints", () => expect(Object.keys(api)).toEqual(expect.arrayContaining(["healthz", "categories", "threads", "posts", "createPost", "count"]))); });
