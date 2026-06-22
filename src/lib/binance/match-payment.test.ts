import { describe, expect, test } from "bun:test";
import {
	type BinancePayTransaction,
	findMatchingTransactions,
} from "@/lib/binance/match-payment";

function tx(
	overrides: Partial<BinancePayTransaction> = {},
): BinancePayTransaction {
	return {
		orderType: "PAY",
		transactionId: "t1",
		transactionTime: 1000,
		amount: "10.00",
		currency: "USDT",
		note: "ord-123",
		...overrides,
	};
}

describe("findMatchingTransactions", () => {
	const baseParams = { orderCode: "ord-123", expectedAmountUsd: 10 };

	test("returns empty for an empty transaction list", () => {
		expect(findMatchingTransactions([], baseParams)).toEqual([]);
	});

	test("matches a transaction whose note contains the order code", () => {
		const t = tx();
		expect(findMatchingTransactions([t], baseParams)).toEqual([t]);
	});

	test("ignores a transaction with no note", () => {
		const t = tx({ note: undefined });
		expect(findMatchingTransactions([t], baseParams)).toEqual([]);
	});

	test("does not match a prefix-colliding code (ord-12 vs ord-123)", () => {
		const t = tx({ note: "pago ord-123 gracias" });
		const result = findMatchingTransactions([t], {
			...baseParams,
			orderCode: "ord-12",
		});
		expect(result).toEqual([]);
	});

	test("matches the code as a delimited token inside free text", () => {
		const t = tx({ note: "pago de la orden ord-123, gracias!" });
		expect(findMatchingTransactions([t], baseParams)).toEqual([t]);
	});

	test("matches the code at the very start and end of the note", () => {
		const atStart = tx({ transactionId: "a", note: "ord-123 listo" });
		const atEnd = tx({ transactionId: "b", note: "transferencia ord-123" });
		expect(findMatchingTransactions([atStart], baseParams)).toEqual([atStart]);
		expect(findMatchingTransactions([atEnd], baseParams)).toEqual([atEnd]);
	});

	test("accepts the amount exactly at the min threshold (expected - tolerance)", () => {
		// default tolerance 0.5 → minAmount = 9.5
		const t = tx({ amount: "9.50" });
		expect(findMatchingTransactions([t], baseParams)).toEqual([t]);
	});

	test("rejects an amount just below the min threshold", () => {
		const t = tx({ amount: "9.49" });
		expect(findMatchingTransactions([t], baseParams)).toEqual([]);
	});

	test("rejects non-finite / unparseable amounts", () => {
		const bad = tx({ amount: "not-a-number" });
		expect(findMatchingTransactions([bad], baseParams)).toEqual([]);
	});

	test("rejects non-positive amounts (outgoing transfers)", () => {
		const out = tx({ amount: "-10.00" });
		const zero = tx({ amount: "0" });
		expect(findMatchingTransactions([out, zero], baseParams)).toEqual([]);
	});

	test("normalizes currency case on both sides", () => {
		const t = tx({ currency: "usdt" });
		expect(findMatchingTransactions([t], baseParams)).toEqual([t]);
		const eur = tx({ currency: "EUR" });
		expect(findMatchingTransactions([eur], baseParams)).toEqual([]);
	});

	test("honors a custom expected currency", () => {
		const t = tx({ currency: "BUSD" });
		expect(
			findMatchingTransactions([t], {
				...baseParams,
				expectedCurrency: "busd",
			}),
		).toEqual([t]);
	});

	test("returns multiple matches sorted oldest-first", () => {
		const newer = tx({ transactionId: "new", transactionTime: 2000 });
		const older = tx({ transactionId: "old", transactionTime: 1000 });
		const result = findMatchingTransactions([newer, older], baseParams);
		expect(result.map((t) => t.transactionId)).toEqual(["old", "new"]);
	});
});
