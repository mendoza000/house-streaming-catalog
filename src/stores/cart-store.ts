import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface CartItem {
	id: string
	title: string
	price: number
	quantity: number
	image?: string
}

interface CartStore {
	items: CartItem[]
	addItem: (item: Omit<CartItem, "quantity">) => void
	removeItem: (itemId: string) => void
	updateQuantity: (itemId: string, quantity: number) => void
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
					const existingItem = state.items.find((i) => i.id === item.id)

					if (existingItem) {
						return {
							items: state.items.map((i) =>
								i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
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
						item.id === itemId ? { ...item, quantity } : item
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
					(total, item) => total + item.price * item.quantity,
					0
				)
			},
		}),
		{
			name: "cart-storage", // nombre de la key en localStorage
			storage: createJSONStorage(() => localStorage),
		}
	)
)
