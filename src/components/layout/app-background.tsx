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

			{/* Halo décoratif — haut droite, teinte or de la marque, statique
			    (DS « Concierge » : le back-office reste silencieux, pas de
			    dérive permanente sous les données). */}
			<div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-lagoon/10 to-transparent blur-3xl pointer-events-none" />
		</div>
	);
}
