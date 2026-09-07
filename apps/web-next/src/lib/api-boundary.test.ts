import { describe, expect, it } from "vitest";
import { API_BOUNDARY } from "./api-boundary";
describe("API boundary", () => { it("is Hono /api", () => expect(API_BOUNDARY).toBe("/api")); });
