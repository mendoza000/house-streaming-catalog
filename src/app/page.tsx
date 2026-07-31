import AuthPromoBanner from "@/components/home/auth-promo-banner";
import Header from "@/components/home/header";
import Products from "@/components/home/products/products";
import QuickActions from "@/components/home/quick-actions";

export default function Home() {
	return (
		<div className="container mx-auto">
			<Header />
			<AuthPromoBanner />
			<QuickActions />
			<section id="catalogo" className="scroll-mt-24">
				<Products />
			</section>
		</div>
	);
}
