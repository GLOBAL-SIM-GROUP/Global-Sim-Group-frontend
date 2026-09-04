import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { cn } from "#/lib/utils";

import { creerMouvement } from "../api/mouvements";
import type { Produit } from "../models/produits";
import { mouvementsKeys, produitsKeys, stockKeys } from "../permissions";
import { BarcodeScanInput } from "./barcode-scan-input";

interface EntreeStockScanFormProps {
	onCancel: () => void;
	onSaved: () => void;
}

interface LigneEntree {
	cle: number;
	produit: Produit;
	quantite: string;
	statut: "idle" | "envoi" | "ok" | "erreur";
	erreur?: string;
}

/**
 * Panier de réception par scan (M3) : chaque scan résout un produit et
 * l'ajoute (ou incrémente sa quantité de +1 s'il est déjà dans la liste).
 * Contrairement au panier de vente (`POST /market/ventes` prend `lignes[]`
 * en un seul appel), `POST /market/mouvements` ne prend qu'UN produit par
 * appel — la validation envoie donc une requête par ligne, séquentiellement,
 * et s'arrête à la première erreur pour ne pas rejouer les lignes déjà
 * enregistrées si l'utilisateur retente.
 */
export function EntreeStockScanForm({
	onCancel,
	onSaved,
}: EntreeStockScanFormProps) {
	const queryClient = useQueryClient();
	const [lignes, setLignes] = useState<LigneEntree[]>([]);
	const [prochaineCle, setProchaineCle] = useState(0);
	const [motif, setMotif] = useState("");
	const [documentRef, setDocumentRef] = useState("");
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [enCours, setEnCours] = useState(false);

	const majLigne = (cle: number, patch: Partial<LigneEntree>) =>
		setLignes((current) =>
			current.map((ligne) =>
				ligne.cle === cle ? { ...ligne, ...patch } : ligne,
			),
		);
	const retirerLigne = (cle: number) =>
		setLignes((current) => current.filter((ligne) => ligne.cle !== cle));

	const onScanResolu = (produit: Produit) => {
		setGlobalError(null);
		const existante = lignes.find((ligne) => ligne.produit.id === produit.id);
		if (existante) {
			const quantiteActuelle = Number(existante.quantite) || 0;
			majLigne(existante.cle, { quantite: String(quantiteActuelle + 1) });
			return;
		}
		setLignes((current) => [
			...current,
			{ cle: prochaineCle, produit, quantite: "1", statut: "idle" },
		]);
		setProchaineCle((valeur) => valeur + 1);
	};

	const soumettre = async () => {
		setGlobalError(null);
		if (lignes.length === 0) {
			setGlobalError("Scannez au moins un article à réceptionner.");
			return;
		}
		for (const ligne of lignes) {
			if (!ligne.quantite.trim() || Number(ligne.quantite) <= 0) {
				setGlobalError(`Quantité invalide pour « ${ligne.produit.nom} ».`);
				return;
			}
		}

		setEnCours(true);
		for (const ligne of lignes) {
			// Déjà réussi lors d'une tentative précédente (relance après une
			// erreur plus loin dans la liste) : ne pas rejouer.
			if (ligne.statut === "ok") continue;
			majLigne(ligne.cle, { statut: "envoi", erreur: undefined });
			try {
				await creerMouvement({
					idProduit: ligne.produit.id,
					type: "ENTREE",
					quantite: ligne.quantite.trim(),
					motif: motif.trim() || null,
					documentRef: documentRef.trim() || null,
				});
				majLigne(ligne.cle, { statut: "ok" });
			} catch (error) {
				const message =
					getErrorMessageForCode(toApiError(error).code) ??
					(toApiError(error).message || "Une erreur est survenue.");
				majLigne(ligne.cle, { statut: "erreur", erreur: message });
				setGlobalError(
					`Échec sur « ${ligne.produit.nom} » : ${message} — les lignes déjà validées ci-dessus sont enregistrées, corrigez celle-ci puis relancez.`,
				);
				setEnCours(false);
				return;
			}
		}
		setEnCours(false);
		void queryClient.invalidateQueries({ queryKey: mouvementsKeys.all });
		void queryClient.invalidateQueries({ queryKey: produitsKeys.all });
		void queryClient.invalidateQueries({ queryKey: stockKeys.all });
		onSaved();
	};

	return (
		<div className="space-y-4">
			<BarcodeScanInput
				label="Scanner un article reçu"
				onResolu={onScanResolu}
				onIntrouvable={(code) =>
					setGlobalError(`Aucun produit pour le code « ${code} ».`)
				}
			/>

			<div className="space-y-2">
				{lignes.length === 0 ? (
					<p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
						Aucun article scanné pour l'instant.
					</p>
				) : (
					lignes.map((ligne) => (
						<div
							key={ligne.cle}
							className="grid grid-cols-[1fr_5rem_auto_auto] items-center gap-3 rounded-md border border-border p-2"
						>
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-foreground">
									{ligne.produit.nom}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{ligne.produit.reference}
								</p>
							</div>
							<InputField
								aria-label={`Quantité — ${ligne.produit.nom}`}
								inputMode="decimal"
								value={ligne.quantite}
								disabled={ligne.statut === "envoi" || ligne.statut === "ok"}
								onChange={(event) =>
									majLigne(ligne.cle, { quantite: event.target.value })
								}
							/>
							<span
								className={cn(
									"flex size-6 items-center justify-center",
									ligne.statut === "ok" && "text-[#27AE60]",
									ligne.statut === "erreur" && "text-destructive",
								)}
								title={ligne.erreur}
							>
								{ligne.statut === "envoi" ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : ligne.statut === "ok" ? (
									<Check className="size-4" aria-hidden />
								) : ligne.statut === "erreur" ? (
									<X className="size-4" aria-hidden />
								) : null}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label={`Retirer ${ligne.produit.nom}`}
								disabled={ligne.statut === "envoi" || ligne.statut === "ok"}
								onClick={() => retirerLigne(ligne.cle)}
							>
								<Trash2 className="size-4 text-destructive" aria-hidden />
							</Button>
						</div>
					))
				)}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<InputField
					label="Motif (optionnel)"
					placeholder="ex : Réappro fournisseur"
					value={motif}
					onChange={(event) => setMotif(event.target.value)}
				/>
				<InputField
					label="Document (optionnel)"
					placeholder="ex : BL-2026-0147"
					value={documentRef}
					onChange={(event) => setDocumentRef(event.target.value)}
				/>
			</div>

			{globalError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{globalError}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="ghost"
					disabled={enCours}
					onClick={onCancel}
				>
					Annuler
				</Button>
				<Button
					type="button"
					disabled={enCours || lignes.length === 0}
					onClick={() => void soumettre()}
				>
					{enCours ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{enCours ? "Enregistrement…" : "Valider la réception"}
				</Button>
			</div>
		</div>
	);
}
