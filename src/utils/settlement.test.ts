import { describe, expect, test } from "bun:test";
import type { PaymentMethod } from "@/constants/payment-methods";
import type { CartItem } from "@/stores/cart-store";
import { COP_RATE, COP_SURCHARGE_PER_UNIT } from "@/utils/currency";
import { getMethodSettlement } from "@/utils/settlement";

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

function method(overrides: Partial<PaymentMethod> = {}): PaymentMethod {
	return {
		id: "m",
		name: "Method",
		description: "",
		icon: "",
		type: "manual",
		...overrides,
	};
}

describe("getMethodSettlement", () => {
	test("returns zeros for an empty cart", () => {
		const s = getMethodSettlement(method({ currency: "USD" }), []);
		expect(s).toEqual({
			currency: "USD",
			baseTotal: 0,
			surcharge: 0,
			total: 0,
		});
	});

	test("defaults to USD when the method has no currency", () => {
		const s = getMethodSettlement(method({ currency: undefined }), [item()]);
		expect(s.currency).toBe("USD");
		expect(s.total).toBe(10);
	});

	test("base total multiplies price × accounts × months × quantity", () => {
		const s = getMethodSettlement(method({ currency: "USD" }), [
			item({ price: 5, accounts: 2, months: 3, quantity: 4 }),
		]);
		expect(s.baseTotal).toBe(5 * 2 * 3 * 4);
		expect(s.surcharge).toBe(0);
	});

	test("COP applies a per-unit surcharge on top of the converted base", () => {
		const items = [
			item({ price: 10, quantity: 2 }),
			item({ id: "svc-2", price: 5, quantity: 3 }),
		];
		const s = getMethodSettlement(method({ currency: "COP" }), items);
		const expectedBaseUsd = 10 * 2 + 5 * 3;
		const expectedSurcharge = (2 + 3) * COP_SURCHARGE_PER_UNIT;
		expect(s.baseTotal).toBe(expectedBaseUsd * COP_RATE);
		expect(s.surcharge).toBe(expectedSurcharge);
		expect(s.total).toBe(s.baseTotal + s.surcharge);
	});

	test("non-COP currencies never add a surcharge", () => {
		const s = getMethodSettlement(method({ currency: "VES" }), [item()], 36.7);
		expect(s.surcharge).toBe(0);
	});
});
