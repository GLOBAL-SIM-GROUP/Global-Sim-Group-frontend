import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Toast } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { usePanierArticles } from "../hooks/use-panier-articles";
import { enregistrerDemande } from "../models/demandes";
import {
	CLE_PANIER_BOUTIQUE,
	CLE_PANIER_RESTAURANT,
	type LigneArticlePanier,
} from "../models/panier-articles";

type ServicePanier = "restaurant" | "boutique";

const SERVICES_PANIER: {
	service: ServicePanier;
	label: string;
	cle: string;
	catalogueTo: string;
	catalogueLabel: string;
}[] = [
	{
		service: "restaurant",
		label: "Restaurant",
		cle: CLE_PANIER_RESTAURANT,
		catalogueTo: "/espace-client/restaurant",
		catalogueLabel: "la carte",
	},
	{
		service: "boutique",
		label: "Boutique",
		cle: CLE_PANIER_BOUTIQUE,
		catalogueTo: "/espace-client/boutique",
		catalogueLabel: "la boutique",
	},
];

function LignePanierItem({
	ligne,
	onQuantite,
	disabled,
}: {
	ligne: LigneArticlePanier;
	onQuantite: (quantite: number) => void;
	disabled: boolean;
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
			{ligne.imageUrl ? (
				<img
					src={ligne.imageUrl}
					alt=""
					className="size-12 shrink-0 rounded-md object-cover"
				/>
			) : (
				<span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted">
					<ShoppingCart className="size-5 text-muted-foreground" aria-hidden />
				</span>
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-foreground">
					{ligne.nom}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatMontantFCFA(ligne.prix)} / article
				</p>
			</div>
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					aria-label={`Réduire la quantité de ${ligne.nom}`}
					disabled={disabled}
					onClick={() => onQuantite(ligne.quantite - 1)}
				>
					{ligne.quantite <= 1 ? (
						<Trash2 className="size-4" aria-hidden />
					) : (
						<Minus className="size-4" aria-hidden />
					)}
				</Button>
				<span className="w-8 text-center text-sm font-medium tabular-nums">
					{ligne.quantite}
				</span>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					aria-label={`Augmenter la quantité de ${ligne.nom}`}
					disabled={disabled}
					onClick={() => onQuantite(ligne.quantite + 1)}
				>
					<Plus className="size-4" aria-hidden />
				</Button>
			</div>
			<span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
				{formatMontantFCFA(String(Number(ligne.prix) * ligne.quantite))}
			</span>
		</div>
	);
}

function SectionPanier({
	service,
	label,
	cle,
	catalogueTo,
	catalogueLabel,
	onDemandeEnvoyee,
}: {
	service: ServicePanier;
	label: string;
	cle: string;
	catalogueTo: string;
	catalogueLabel: string;
	onDemandeEnvoyee: () => void;
}) {
	const panier = usePanierArticles(cle);
	const [envoye, setEnvoye] = useState(false);

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-foreground">{label}</h2>
				{panier.lignes.length > 0 ? (
					<span className="text-sm text-muted-foreground">
						{panier.nombreArticles} article
						{panier.nombreArticles > 1 ? "s" : ""} ·{" "}
						{formatMontantFCFA(String(panier.total))}
					</span>
				) : null}
			</div>

			{envoye ? (
				<div className="rounded-lg border border-lagoon/40 bg-lagoon/5 p-6 text-sm text-foreground">
					Demande envoyée — nos équipes vous répondront prochainement.
					Retrouvez-la dans{" "}
					<Link
						to="/espace-client/mes-demandes"
						className="font-medium text-lagoon hover:underline"
					>
						Mes demandes
					</Link>
					.
				</div>
			) : panier.lignes.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
					Panier vide — ajoutez des articles depuis{" "}
					<Link
						to={catalogueTo}
						className="font-medium text-lagoon hover:underline"
					>
						{catalogueLabel}
					</Link>
					.
				</div>
			) : (
				<>
					<div className="space-y-2">
						{panier.lignes.map((ligne) => (
							<LignePanierItem
								key={ligne.id}
								ligne={ligne}
								disabled={envoye}
								onQuantite={(quantite) =>
									panier.definirQuantite(ligne.id, quantite)
								}
							/>
						))}
					</div>

					<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-base font-semibold text-foreground">
							Total : {formatMontantFCFA(String(panier.total))}
						</p>
						<Button
							type="button"
							disabled={envoye}
							className="bg-lagoon text-white hover:bg-lagoon/90"
							onClick={() => {
								// Pas d'appel réseau : aucun endpoint CLIENT n'existe
								// pour passer commande. Trace locale pour « Mes
								// demandes » + confirmation à l'écran.
								const resume = `${panier.lignes
									.map((ligne) => `${ligne.quantite}× ${ligne.nom}`)
									.join(", ")} — ${formatMontantFCFA(String(panier.total))}`;
								enregistrerDemande({
									service: `commande-${service}`,
									resume,
								});
								panier.vider();
								setEnvoye(true);
								onDemandeEnvoyee();
							}}
						>
							{envoye ? "Demande envoyée" : "Envoyer ma demande"}
						</Button>
					</div>
				</>
			)}
		</section>
	);
}

/**
 * Panier de l'espace client (`/espace-client/panier`) : récapitulatif des
 * articles restaurant et boutique (paniers indépendants par clé de
 * stockage), ajustement des quantités puis envoi de demande — factice, aucun
 * endpoint CLIENT n'existe pour passer commande : trace locale dans
 * « Mes demandes » + toast, cf. `models/demandes.ts`.
 */
export function PanierPage() {
	const [toastOuvert, setToastOuvert] = useState(false);

	return (
		<Toast.Provider swipeDirection="right">
			<div className="mx-auto w-full max-w-4xl space-y-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Mon panier</h1>
					<p className="text-sm text-muted-foreground">
						Vérifiez vos articles puis envoyez votre demande — nos équipes vous
						répondront pour confirmer et régler le paiement.
					</p>
				</div>

				{SERVICES_PANIER.map((config) => (
					<SectionPanier
						key={config.service}
						{...config}
						onDemandeEnvoyee={() => setToastOuvert(true)}
					/>
				))}
			</div>

			<Toast.Root
				open={toastOuvert}
				onOpenChange={setToastOuvert}
				duration={4000}
				className="fixed right-6 bottom-6 z-50 rounded-lg border border-border bg-card px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
			>
				<Toast.Title className="text-sm font-semibold text-foreground">
					Demande enregistrée
				</Toast.Title>
				<Toast.Description className="text-sm text-muted-foreground">
					Nos équipes vous répondront prochainement pour confirmer votre
					commande.
				</Toast.Description>
			</Toast.Root>
			<Toast.Viewport />
		</Toast.Provider>
	);
}
