import Header from "@/components/home/header";
import Products from "@/components/home/products/products";

export default function Home() {
	return (
		<div className="container mx-auto">
			<Header />
			<section id="catalogo" className="scroll-mt-24">
				<Products />
			</section>
		</div>
	);
}
