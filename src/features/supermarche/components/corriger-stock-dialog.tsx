import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";

import { creerMouvement } from "../api/mouvements";
import { type EcraserStockResult, getProduit } from "../api/produits";
import { useEcraserStock } from "../hooks/use-produits";
import type { Produit } from "../models/produits";

interface CorrigerStockDialogProps {
	open: boolean;
	produit: Produit;
	onOpenChange: (open: boolean) => void;
}

/**
 * Modale « Corriger le stock » : écrase la quantité en stock à une valeur
 * cible (permission `MARCHANDISE.CORRIGER_STOCK` — réservé
 * ADMINISTRATEUR/DIRIGEANT). À utiliser pour les corrections d'inventaire ;
 * les flux courants restent les mouvements ENTRÉE/SORTIE. L'écart (cible −
 * actuel) est prévisualisé avant l'envoi et le résultat affiché après.
 *
 * Traçabilité : `POST .../stock/ecraser` n'écrit aucun mouvement dans
 * l'historique (vérifié en direct). On écrit donc d'abord un AJUSTEMENT via
 * `POST /market/mouvements` avec l'écart calculé sur le stock frais — la
 * ligne apparaît dans « Mouvements de stock » — puis on appelle `ecraser`
 * en filet : si une opération s'est intercalée entre les deux, la cible est
 * quand même atteinte. ⚠️ Si le backend se met un jour à écrire le
 * mouvement dans `ecraser`, retirer le `creerMouvement` pour éviter le
 * double enregistrement.
 */
export function CorrigerStockDialog({
	open,
	produit,
	onOpenChange,
}: CorrigerStockDialogProps) {
	const mutation = useEcraserStock();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [resultat, setResultat] = useState<EcraserStockResult | null>(null);

	const form = useForm({
		defaultValues: {
			// Pré-rempli sur le stock actuel : la correction part du réel.
			quantite: String(Number(produit.quantite_stock)),
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.quantite.trim()) {
					fields.quantite = "Ce champ est requis.";
				} else {
					// `validerMontant` n'accepte que « 42 » / « 42.5 » / « 42.50 » —
					// le signe « − » est déjà exclu par le format (backend : ≥ 0, 2 décimales).
					const erreur = validerMontant(value.quantite, "Le stock");
					if (erreur) fields.quantite = erreur;
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const cible = Number(normaliserMontantPourBackend(value.quantite));
				// Stock frais juste avant l'écriture : l'écart affiché à
				// l'ouverture peut être périmé si une vente est passée entre-temps.
				const frais = await getProduit(produit.id);
				const stockAvant = Number(frais.quantite_stock);
				// Arrondi 2 décimales : la soustraction de flottants peut
				// produire « 12.749999… », refusé par le backend.
				const ecart = Number((cible - stockAvant).toFixed(2));
				if (ecart !== 0) {
					// Le mouvement applique le delta ET écrit la trace dans
					// l'historique — quantité signée (AJUSTEMENT).
					await creerMouvement({
						idProduit: produit.id,
						type: "AJUSTEMENT",
						quantite: String(ecart),
						motif: `Correction d'inventaire — stock écrasé à ${cible}`,
					});
				}
				// Filet : la cible est atteinte même si une opération s'est
				// intercalée entre la lecture fraîche et le mouvement.
				const res = await mutation.mutateAsync({
					id: produit.id,
					quantite: normaliserMontantPourBackend(value.quantite),
				});
				// Afficher le vrai point de départ (lu ci-dessus), pas le
				// `stock_avant` de `ecraser` — qui vaut déjà ~la cible puisque le
				// mouvement vient de l'appliquer.
				setResultat({
					stock_avant: stockAvant,
					stock_apres: res.stock_apres,
					ecart,
				});
			} catch (error) {
				const apiError = toApiError(error);
				setGlobalError(
					getErrorMessageForCode(apiError.code) ??
						(apiError.message || "Une erreur est survenue."),
				);
			}
		},
	});

	const stockActuel = Number(produit.quantite_stock);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>Corriger le stock</DialogTitle>
				<DialogDescription>
					{produit.reference} — {produit.nom}. Écrase le stock à la valeur cible
					saisie (correction d'inventaire).
				</DialogDescription>

				{resultat ? (
					<div className="mt-4 space-y-4">
						<div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
							<div>
								<p className="text-muted-foreground">Stock avant</p>
								<p className="font-semibold text-foreground">
									{resultat.stock_avant}
								</p>
							</div>
							<div className="text-muted-foreground">→</div>
							<div>
								<p className="text-muted-foreground">Stock après</p>
								<p className="font-semibold text-foreground">
									{resultat.stock_apres}
								</p>
							</div>
							<Badge
								variant={
									resultat.ecart > 0
										? "success"
										: resultat.ecart < 0
											? "danger"
											: "neutral"
								}
							>
								{resultat.ecart > 0 ? "+" : ""}
								{resultat.ecart}
							</Badge>
						</div>
						<div className="flex justify-end">
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Fermer
							</Button>
						</div>
					</div>
				) : (
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<p className="text-sm text-muted-foreground">
							Stock actuel :{" "}
							<span className="font-semibold text-foreground">
								{stockActuel}
							</span>
						</p>

						<form.Field name="quantite">
							{(field) => (
								<>
									<InputField
										id={field.name}
										name={field.name}
										label="Nouveau stock"
										placeholder="ex : 42"
										autoComplete="off"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										onKeyDown={(event) => {
											if (event.key === "Enter") event.preventDefault();
										}}
										error={field.state.meta.errors[0]}
									/>
									{!field.state.meta.errors[0] && field.state.value.trim() ? (
										<p className="mt-1 text-sm text-muted-foreground">
											Écart :{" "}
											<span className="font-medium text-foreground">
												{(() => {
													const ecart =
														Number(
															normaliserMontantPourBackend(field.state.value),
														) - stockActuel;
													return `${ecart > 0 ? "+" : ""}${ecart}`;
												})()}
											</span>
										</p>
									) : null}
								</>
							)}
						</form.Field>

						{globalError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{globalError}
							</p>
						) : null}

						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<div className="flex items-center justify-end gap-2 pt-2">
									<Button
										type="button"
										variant="ghost"
										disabled={isSubmitting}
										onClick={() => onOpenChange(false)}
									>
										Annuler
									</Button>
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? (
											<Loader2 className="size-4 animate-spin" aria-hidden />
										) : null}
										{isSubmitting ? "Correction…" : "Corriger le stock"}
									</Button>
								</div>
							)}
						</form.Subscribe>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
