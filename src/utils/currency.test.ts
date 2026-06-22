import { describe, expect, test } from "bun:test";
import { COP_RATE, convertPrice, VES_ROUND_UP_TO } from "@/utils/currency";

describe("convertPrice", () => {
	test("returns the price unchanged for USD", () => {
		expect(convertPrice(12.34, "USD")).toBe(12.34);
	});

	test("converts USD to COP at the fixed rate", () => {
		expect(convertPrice(5, "COP")).toBe(5 * COP_RATE);
	});

	test("converts USD to VES using the dynamic rate, rounding up to the multiple", () => {
		// 10 * 36.7 = 367 → ceil to next multiple of 50 = 400
		expect(convertPrice(10, "VES", 36.7)).toBe(400);
	});

	test("VES result is always a multiple of VES_ROUND_UP_TO", () => {
		const result = convertPrice(7.3, "VES", 41.2);
		expect(result % VES_ROUND_UP_TO).toBe(0);
	});

	test("never undercharges: rounds VES up, not to nearest", () => {
		// 1 * 51 = 51 → must round UP to 100, not down to 50
		expect(convertPrice(1, "VES", 51)).toBe(100);
	});

	test("falls back to the USD price for VES with no exchange rate", () => {
		expect(convertPrice(10, "VES")).toBe(10);
		expect(convertPrice(10, "VES", 0)).toBe(10);
	});

	test("handles a zero price across currencies", () => {
		expect(convertPrice(0, "USD")).toBe(0);
		expect(convertPrice(0, "COP")).toBe(0);
		expect(convertPrice(0, "VES", 36.7)).toBe(0);
	});
});
