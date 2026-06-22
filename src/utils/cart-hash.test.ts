import { describe, expect, test } from "bun:test";
import type { CartItem } from "@/stores/cart-store";
import { generateCartHash } from "@/utils/cart-hash";

function item(overrides: Partial<CartItem> = {}): CartItem {
	return {
		id: "svc-1",
		title: "Service",
		price: 10,
		quantity: 1,
		accounts: 1,
		months: 1,
		...overrides,
	};
}

describe("generateCartHash", () => {
	test("is deterministic for the same cart", async () => {
		const a = await generateCartHash([item()]);
		const b = await generateCartHash([item()]);
		expect(a).toBe(b);
	});

	test("is independent of item order", async () => {
		const items = [item({ id: "a" }), item({ id: "b" }), item({ id: "c" })];
		const reversed = [...items].reverse();
		expect(await generateCartHash(items)).toBe(
			await generateCartHash(reversed),
		);
	});

	test("differs when quantity changes on a long-id cart (prefix collision)", async () => {
		// Carts that share their first ~24 chars but differ afterwards used to
		// collide under the old btoa-truncate-to-32 implementation.
		const longId = "streaming-service-premium-account";
		const cartA = [item({ id: longId, quantity: 1 })];
		const cartB = [item({ id: longId, quantity: 2 })];
		expect(await generateCartHash(cartA)).not.toBe(
			await generateCartHash(cartB),
		);
	});

	test("differs when accounts or months change", async () => {
		const base = await generateCartHash([item()]);
		expect(await generateCartHash([item({ accounts: 2 })])).not.toBe(base);
		expect(await generateCartHash([item({ months: 3 })])).not.toBe(base);
	});

	test("produces a stable-length hex digest", async () => {
		const hash = await generateCartHash([item()]);
		expect(hash).toMatch(/^[0-9a-f]{64}$/);
	});
});
