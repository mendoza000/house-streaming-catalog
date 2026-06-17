"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

interface CategoryFilterProps {
	/** Categorías a mostrar, derivadas de los servicios (incluye "Todos"). */
	categories: string[];
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
	categories,
	selectedCategory,
	onCategoryChange,
}: CategoryFilterProps) {
	return (
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
	);
}
