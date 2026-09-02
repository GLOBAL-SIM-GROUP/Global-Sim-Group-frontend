/**
 * Fond décoratif de l'app connectée. Reprend la même ambiance de marque que
 * le fond public (`body`) et la page de connexion — halos or/navy issus du
 * logo, filigrane du logo — mais volontairement discrète : les décors sont
 * placés à droite (la sidebar, opaque, couvre les 240px de gauche sur
 * desktop) et restent assez doux pour ne jamais gêner la lecture des
 * tableaux/formulaires qui s'affichent par-dessus.
 */
export function AppBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden">
			{/* Dégradé de base — même halos que le fond public (--hero-a/--hero-b) */}
			<div className="absolute inset-0 app-bg-wash" />

			{/* Grille discrète, cohérente avec le fond public (body::after) */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.1]"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
					maskImage:
						"radial-gradient(circle at 75% 15%, black, transparent 70%)",
				}}
			/>

			{/* Halo décoratif — haut droite, teinte or de la marque */}
			<div className="app-bg-halo-1 absolute -top-32 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-lagoon/14 to-transparent blur-3xl opacity-70 pointer-events-none" />

			{/* Halo décoratif — bas droite, teinte navy de la marque */}
			<div className="app-bg-halo-2 absolute -bottom-40 -right-40 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tl from-sea-ink/10 to-transparent blur-3xl opacity-70 pointer-events-none" />

			{/* Filigrane du logo — bas droite, très discret */}
			<div
				className="absolute bottom-0 right-0 h-96 w-96 pointer-events-none"
				style={{
					backgroundImage: "url(/logo.png)",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "bottom right",
					opacity: 0.05,
					filter: "brightness(0.6) saturate(0.25)",
				}}
			/>

			{/* Filigrane du logo — haut droite, encore plus discret */}
			<div
				className="absolute top-0 right-0 h-72 w-72 pointer-events-none"
				style={{
					backgroundImage: "url(/logo.png)",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "top right",
					opacity: 0.03,
					filter: "brightness(0.5) saturate(0.2)",
				}}
			/>
		</div>
	);
}
