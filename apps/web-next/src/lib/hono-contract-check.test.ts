import { describe, expect, it } from "vitest";
import { honoContract } from "./hono-contract-check";
describe("Hono contract", () => { it("includes core reads and posts", () => expect(honoContract).toEqual(["healthz", "categories", "threads", "posts", "count"])); });
