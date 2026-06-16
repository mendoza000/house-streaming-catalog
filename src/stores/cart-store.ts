import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface CartItem {
	id: string
	title: string
	price: number
	quantity: number
	image?: string
	accounts: number
	months: number
}

interface CartStore {
	items: CartItem[]
	addItem: (item: Omit<CartItem, "quantity">) => void
	removeItem: (itemId: string) => void
	updateQuantity: (itemId: string, quantity: number) => void
	updateItemConfig: (itemId: string, accounts: number, months: number) => void
	clearCart: () => void
	getTotalItems: () => number
	getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],

			addItem: (item) => {
				set((state) => {
					// Find existing item with same id, accounts, and months
					const existingItem = state.items.find(
						(i) =>
							i.id === item.id &&
							i.accounts === item.accounts &&
							i.months === item.months,
					)

					if (existingItem) {
						return {
							items: state.items.map((i) =>
								i.id === item.id &&
								i.accounts === item.accounts &&
								i.months === item.months
									? { ...i, quantity: i.quantity + 1 }
									: i,
							),
						}
					}

					return {
						items: [...state.items, { ...item, quantity: 1 }],
					}
				})
			},

			removeItem: (itemId) => {
				set((state) => ({
					items: state.items.filter((item) => item.id !== itemId),
				}))
			},

			updateQuantity: (itemId, quantity) => {
				if (quantity <= 0) {
					get().removeItem(itemId)
					return
				}

				set((state) => ({
					items: state.items.map((item) =>
						item.id === itemId ? { ...item, quantity } : item,
					),
				}))
			},

			updateItemConfig: (itemId, accounts, months) => {
				set((state) => ({
					items: state.items.map((item) =>
						item.id === itemId ? { ...item, accounts, months } : item,
					),
				}))
			},

			clearCart: () => {
				set({ items: [] })
			},

			getTotalItems: () => {
				return get().items.reduce((total, item) => total + item.quantity, 0)
			},

			getTotalPrice: () => {
				return get().items.reduce(
					(total, item) =>
						total + item.price * item.accounts * item.months * item.quantity,
					0,
				)
			},
		}),
		{
			name: "cart-storage", // nombre de la key en localStorage
			storage: createJSONStorage(() => localStorage),
		},
	),
)
