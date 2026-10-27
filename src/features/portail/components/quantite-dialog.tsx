import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { formatMontantFCFA } from "#/features/residence/models/format";

const QUANTITE_MIN = 1;
const QUANTITE_MAX = 99;

const borneQuantite = (valeur: number) =>
	Math.min(
		QUANTITE_MAX,
		Math.max(QUANTITE_MIN, Math.trunc(valeur) || QUANTITE_MIN),
	);

/**
 * Modale « choisir la quantité » d'un article de catalogue (restaurant,
 * super-marché…) — ouverte au clic sur le bouton panier de la carte pour que
 * la personne saisisse directement le nombre voulu au lieu de cliquer
 * autant de fois. Partagée entre l'espace client et le portail résident.
 *
 * `quantiteInitiale` = quantité déjà au panier (0 pour un nouvel ajout) :
 * la confirmation appelle `onConfirmer` avec le **total** voulu (la page
 * catalogue décide entre `ajouter` et `definirQuantite`).
 */
export function QuantiteDialog({
	open,
	onOpenChange,
	nom,
	prixUnitaire,
	quantiteInitiale,
	onConfirmer,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	nom: string;
	/** Prix unitaire (chaîne API) — le total est recalculé en direct. */
	prixUnitaire: string;
	quantiteInitiale: number;
	onConfirmer: (quantite: number) => void;
}) {
	// Saisie brute du champ nombre : vider le champ ou taper plusieurs
	// chiffres ne doit pas être borné à chaque frappe (sinon « 12 » devient
	// impossible à saisir). La valeur est bornée au blur et à la
	// confirmation.
	const [saisie, setSaisie] = useState("1");
	const quantite = borneQuantite(Number(saisie));

	// Chaque ouverture repart de la quantité actuelle (1 pour un nouvel
	// article, la quantité existante pour une modification).
	useEffect(() => {
		if (open) setSaisie(String(Math.max(QUANTITE_MIN, quantiteInitiale || 1)));
	}, [open, quantiteInitiale]);

	const total = Number(prixUnitaire) * quantite;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Quantité — {nom}</DialogTitle>
					<DialogDescription>
						Choisissez le nombre souhaité avant l'ajout au panier.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					<Label htmlFor="quantite-article">Nombre</Label>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Diminuer la quantité"
							disabled={quantite <= QUANTITE_MIN}
							onClick={() => setSaisie(String(borneQuantite(quantite - 1)))}
						>
							<Minus className="size-4" aria-hidden />
						</Button>
						<Input
							id="quantite-article"
							type="number"
							inputMode="numeric"
							min={QUANTITE_MIN}
							max={QUANTITE_MAX}
							value={saisie}
							onChange={(event) => setSaisie(event.target.value)}
							onBlur={() => setSaisie(String(quantite))}
							className="w-20 text-center font-semibold tabular-nums"
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Augmenter la quantité"
							disabled={quantite >= QUANTITE_MAX}
							onClick={() => setSaisie(String(borneQuantite(quantite + 1)))}
						>
							<Plus className="size-4" aria-hidden />
						</Button>
						<span className="ml-auto text-sm text-muted-foreground">
							{formatMontantFCFA(prixUnitaire)} / unité
						</span>
					</div>
					<p className="text-sm text-muted-foreground">
						Total :{" "}
						<span className="font-semibold text-foreground">
							{formatMontantFCFA(String(total))}
						</span>
					</p>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Annuler
					</Button>
					<Button
						type="button"
						onClick={() => {
							onConfirmer(quantite);
							onOpenChange(false);
						}}
					>
						<ShoppingCart className="size-4" aria-hidden />
						{quantiteInitiale > 0 ? "Mettre à jour" : "Ajouter au panier"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
