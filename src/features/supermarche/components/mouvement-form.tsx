import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { Combobox, type ComboboxOption } from "#/components/ui/combobox";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { cn } from "#/lib/utils";

import { creerMouvement } from "../api/mouvements";
import { useFournisseurs } from "../hooks/use-produits";
import {
	MOUVEMENT_TYPE_LABELS,
	type MouvementType,
} from "../models/mouvements";
import type { Produit } from "../models/produits";
import { mouvementsKeys, produitsKeys, stockKeys } from "../permissions";

interface MouvementFormProps {
	produits: Produit[];
	onCancel: () => void;
	onSaved: () => void;
}

interface LigneMouvement {
	cle: number;
	idProduit: string;
	quantite: string;
	statut: "idle" | "envoi" | "ok" | "erreur";
	erreur?: string;
}

const ligneVide = (cle: number): LigneMouvement => ({
	cle,
	idProduit: "",
	quantite: "",
	statut: "idle",
});

/** Champ Select avec label visible (le contenu s'ouvre en portal). */
function SelectField({
	id,
	label,
	value,
	onValueChange,
	children,
}: {
	id: string;
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={id} aria-label={label} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}

/**
 * Formulaire « Ajouter un mouvement » (M3) : entrée, sortie ou ajustement de
 * stock pour **un ou plusieurs produits** (un type et un motif/document
 * partagés pour tout le lot). `POST /market/mouvements` ne prend qu'un seul
 * produit par appel (contrairement à `POST /market/ventes` qui accepte
 * `lignes[]`) — chaque ligne part donc en une requête séquentielle, à
 * l'arrêt à la première erreur pour ne pas rejouer les lignes déjà
 * enregistrées si l'utilisateur relance. Même principe que
 * `entree-stock-scan-form.tsx`, qui applique déjà ce contournement pour les
 * entrées par scan.
 */
export function MouvementForm({
	produits,
	onCancel,
	onSaved,
}: MouvementFormProps) {
	const queryClient = useQueryClient();
	const [type, setType] = useState<MouvementType>("ENTREE");
	const [lignes, setLignes] = useState<LigneMouvement[]>([ligneVide(0)]);
	const [prochaineCle, setProchaineCle] = useState(1);
	const [motif, setMotif] = useState("");
	const [documentRef, setDocumentRef] = useState("");
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [enCours, setEnCours] = useState(false);

	const fournisseursQuery = useFournisseurs();
	const fournisseurParId = useMemo(
		() =>
			new Map(
				(fournisseursQuery.data ?? []).map((fournisseur) => [
					fournisseur.id,
					fournisseur.nom,
				]),
			),
		[fournisseursQuery.data],
	);
	const produitsOptions = useMemo<ComboboxOption[]>(
		() =>
			produits.map((produit) => {
				const fournisseur = produit.id_fournisseur
					? fournisseurParId.get(produit.id_fournisseur)
					: undefined;
				return {
					value: produit.id,
					label: `${produit.reference} — ${produit.nom}${fournisseur ? ` · ${fournisseur}` : ""}`,
					keywords: `${produit.reference} ${produit.nom} ${fournisseur ?? ""}`,
				};
			}),
		[produits, fournisseurParId],
	);
	const produitParId = useMemo(
		() => new Map(produits.map((produit) => [produit.id, produit])),
		[produits],
	);

	const ajouterLigne = () => {
		setLignes((current) => [...current, ligneVide(prochaineCle)]);
		setProchaineCle((valeur) => valeur + 1);
	};
	const majLigne = (cle: number, patch: Partial<LigneMouvement>) =>
		setLignes((current) =>
			current.map((ligne) =>
				ligne.cle === cle ? { ...ligne, ...patch } : ligne,
			),
		);
	const retirerLigne = (cle: number) =>
		setLignes((current) => current.filter((ligne) => ligne.cle !== cle));

	const valider = (): string | null => {
		if (lignes.length === 0) return "Ajoutez au moins une ligne de produit.";
		for (const ligne of lignes) {
			if (!ligne.idProduit) return "Chaque ligne doit avoir un produit.";
			if (
				!ligne.quantite.trim() ||
				!/^-?\d+(\.\d+)?$/.test(ligne.quantite.trim())
			) {
				return "Chaque ligne doit avoir une quantité numérique.";
			}
		}
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}

		setEnCours(true);
		for (const ligne of lignes) {
			// Déjà réussie lors d'une tentative précédente (relance après une
			// erreur plus loin dans la liste) : ne pas rejouer.
			if (ligne.statut === "ok") continue;
			majLigne(ligne.cle, { statut: "envoi", erreur: undefined });
			try {
				await creerMouvement({
					idProduit: ligne.idProduit,
					type,
					quantite: ligne.quantite.trim(),
					motif: motif.trim() || null,
					documentRef: documentRef.trim() || null,
				});
				majLigne(ligne.cle, { statut: "ok" });
			} catch (error) {
				const message =
					getErrorMessageForCode(toApiError(error).code) ??
					(toApiError(error).message || "Une erreur est survenue.");
				const nomProduit =
					produitParId.get(ligne.idProduit)?.nom ?? "ce produit";
				majLigne(ligne.cle, { statut: "erreur", erreur: message });
				setGlobalError(
					`Échec sur « ${nomProduit} » : ${message} — les lignes déjà validées ci-dessus sont enregistrées, corrigez celle-ci puis relancez.`,
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
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void soumettre();
			}}
		>
			<SelectField
				id="mouvement-type"
				label="Type"
				value={type}
				onValueChange={(valeur) => setType(valeur as MouvementType)}
			>
				{(Object.keys(MOUVEMENT_TYPE_LABELS) as MouvementType[]).map(
					(valeurType) => (
						<SelectItem key={valeurType} value={valeurType}>
							{MOUVEMENT_TYPE_LABELS[valeurType]}
						</SelectItem>
					),
				)}
			</SelectField>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>Produits</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={enCours}
						onClick={ajouterLigne}
					>
						<Plus className="size-4" aria-hidden />
						Ajouter une ligne
					</Button>
				</div>

				{lignes.map((ligne, index) => (
					<div key={ligne.cle} className="space-y-2">
						<Combobox
							options={produitsOptions}
							value={ligne.idProduit}
							onValueChange={(valeur) =>
								majLigne(ligne.cle, { idProduit: valeur })
							}
							placeholder="Produit…"
							searchPlaceholder="Rechercher par référence ou nom…"
							emptyText="Aucun produit trouvé."
							ariaLabel={`Produit ligne ${index + 1}`}
							disabled={ligne.statut === "envoi" || ligne.statut === "ok"}
						/>
						{/* Quantité + statut + Retirer sous le produit : le sélecteur
						    garde toute la largeur de sa ligne (nom de produit +
						    fournisseur potentiellement longs). */}
						<div className="flex items-end gap-2">
							<div className="flex-1">
								<InputField
									aria-label={`Quantité ligne ${index + 1}`}
									placeholder="Qté"
									inputMode="decimal"
									value={ligne.quantite}
									disabled={ligne.statut === "envoi" || ligne.statut === "ok"}
									onChange={(event) =>
										majLigne(ligne.cle, { quantite: event.target.value })
									}
								/>
							</div>
							<span
								className={cn(
									"flex size-9 items-center justify-center",
									ligne.statut === "ok" && "text-success",
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
								aria-label="Retirer la ligne"
								disabled={
									lignes.length === 1 ||
									ligne.statut === "envoi" ||
									ligne.statut === "ok"
								}
								onClick={() => retirerLigne(ligne.cle)}
							>
								<Trash2 className="size-4 text-destructive" aria-hidden />
							</Button>
						</div>
					</div>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<InputField
					id="mouvement-motif"
					label="Motif (optionnel)"
					placeholder="ex : Réappro fournisseur"
					value={motif}
					disabled={enCours}
					onChange={(event) => setMotif(event.target.value)}
				/>
				<div>
					<InputField
						id="mouvement-document-ref"
						label="Référence du document (optionnel)"
						placeholder="ex : BL-2026-0147"
						value={documentRef}
						disabled={enCours}
						onChange={(event) => setDocumentRef(event.target.value)}
					/>
					<p className="mt-1 text-xs text-muted-foreground">
						Numéro du bon de livraison, bon de commande ou facture fournisseur
						associé — un texte libre, pas un fichier à joindre, pour retrouver
						la pièce justificative papier.
					</p>
				</div>
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
				<Button type="submit" disabled={enCours}>
					{enCours ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{enCours ? "Enregistrement…" : "Enregistrer"}
				</Button>
			</div>
		</form>
	);
}
