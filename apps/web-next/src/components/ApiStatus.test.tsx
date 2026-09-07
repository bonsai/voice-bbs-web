import { describe, expect, it } from "vitest";
import { api } from "@/lib/api";
describe("Next Hono integration", () => {
  it("keeps health check available", () => expect(typeof api.healthz).toBe("function"));
});
