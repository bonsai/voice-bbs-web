import { describe, expect, it } from "vitest";
import { SHARED_API } from "./shared-api";
describe("shared API", () => { it("uses /api", () => expect(SHARED_API).toBe("/api")); });
