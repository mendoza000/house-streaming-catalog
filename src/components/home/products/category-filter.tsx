"use client"

import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { categories, type Category } from "@/constants/products"

interface CategoryFilterProps {
	selectedCategory: Category
	onCategoryChange: (category: Category) => void
}

export function CategoryFilter({
	selectedCategory,
	onCategoryChange,
}: CategoryFilterProps) {
	return (
		<div className="w-full overflow-x-auto">
			<ButtonGroup>
				{categories.map((category) => (
					<Button
						key={category}
						variant={selectedCategory === category ? "default" : "outline"}
						onClick={() => onCategoryChange(category)}
					>
						{category}
					</Button>
				))}
			</ButtonGroup>
		</div>
	)
}
