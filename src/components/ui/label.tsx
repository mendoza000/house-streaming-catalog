import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
	HTMLLabelElement,
	React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
	// biome-ignore lint/a11y/noLabelWithoutControl: reusable primitive; htmlFor/children are provided by call sites via {...props}
	<label
		ref={ref}
		className={cn(
			"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
			className,
		)}
		{...props}
	/>
));
Label.displayName = "Label";

export { Label };
