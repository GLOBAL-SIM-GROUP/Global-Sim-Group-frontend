export function AppBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden px-6">
			{/* Gradient de base */}
			<div className="absolute inset-0 bg-gradient-to-br from-background via-lagoon/3 to-sea-ink/5" />

			{/* Logo watermark - Bas droite */}
			<div
				className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
				style={{
					backgroundImage: "url(/logo.png)",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "bottom right",
					opacity: 0.06,
					filter: "brightness(0.6) saturate(0.2)",
				}}
			/>

			{/* Logo watermark - Haut gauche subtle */}
			<div
				className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
				style={{
					backgroundImage: "url(/logo.png)",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "top left",
					opacity: 0.03,
					filter: "brightness(0.5) saturate(0.15)",
				}}
			/>

			{/* Blob décoratif très subtil - Coin inférieur gauche */}
			<div className="absolute -bottom-40 -left-40 w-72 h-72 bg-gradient-to-tr from-lagoon/10 to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />
		</div>
	);
}
