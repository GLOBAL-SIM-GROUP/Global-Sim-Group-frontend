import { Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { formatMontantFCFA } from "#/features/residence/models/format";
import type { MoyenPaiement } from "#/features/residence/models/moyens-paiement";

import { useCreerVente } from "../hooks/use-ventes";
import type { Produit } from "../models/produits";
import { BarcodeScanInput } from "./barcode-scan-input";

interface VenteFormProps {
	produits: Produit[];
	moyens: MoyenPaiement[];
	onCancel: () => void;
	onSaved: () => void;
}

interface LigneSaisie {
	/** Clé stable (index insuffisant : lignes ajoutées/retirées). */
	cle: number;
	idProduit: string;
	quantite: string;
}

/**
 * Formulaire « Nouvelle vente — Market » (M3) : client optionnel, lignes de
 * produits (recherche par produit + quantité), remise, total calculé
 * automatiquement et moyen de paiement. Le POST décrémente le stock et génère
 * la facture côté backend.
 */
export function VenteForm({
	produits,
	moyens,
	onCancel,
	onSaved,
}: VenteFormProps) {
	const mutation = useCreerVente();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [idClient, setIdClient] = useState("");
	const [lignes, setLignes] = useState<LigneSaisie[]>([
		{ cle: 0, idProduit: "", quantite: "" },
	]);
	const [prochaineCle, setProchaineCle] = useState(1);
	const [remise, setRemise] = useState("");
	const [idMoyen, setIdMoyen] = useState("");
	const [erreurScan, setErreurScan] = useState<string | null>(null);

	const ajouterLigne = () => {
		setLignes((current) => [
			...current,
			{ cle: prochaineCle, idProduit: "", quantite: "" },
		]);
		setProchaineCle((valeur) => valeur + 1);
	};
	// Indexé par `cle` (pas `index`) : une ligne peut être retirée pendant
	// qu'un scan est en cours, l'index d'une ligne existante changerait alors
	// sous elle sans que ce cle-ci ne bouge.
	const majLigne = (cle: number, patch: Partial<LigneSaisie>) =>
		setLignes((current) =>
			current.map((ligne) =>
				ligne.cle === cle ? { ...ligne, ...patch } : ligne,
			),
		);
	const retirerLigne = (cle: number) =>
		setLignes((current) => current.filter((ligne) => ligne.cle !== cle));

	/**
	 * Scan résolu → produit déjà dans le panier : +1 sur sa quantité (comme un
	 * re-scan au comptoir). Sinon, remplit la première ligne encore vide, ou en
	 * ajoute une nouvelle. Lecture directe de `lignes`/`prochaineCle` (pas de
	 * mise à jour fonctionnelle) : un seul scan est traité à la fois, pas de
	 * concurrence possible entre la lecture et cet appel.
	 */
	const onScanResolu = (produit: Produit) => {
		setErreurScan(null);
		const existante = lignes.find((ligne) => ligne.idProduit === produit.id);
		if (existante) {
			const quantiteActuelle = Number(existante.quantite) || 0;
			majLigne(existante.cle, { quantite: String(quantiteActuelle + 1) });
			return;
		}
		const ligneVide = lignes.find((ligne) => !ligne.idProduit);
		if (ligneVide) {
			majLigne(ligneVide.cle, { idProduit: produit.id, quantite: "1" });
			return;
		}
		setLignes((current) => [
			...current,
			{ cle: prochaineCle, idProduit: produit.id, quantite: "1" },
		]);
		setProchaineCle((valeur) => valeur + 1);
	};

	const total = useMemo(() => {
		const brut = lignes.reduce((somme, ligne) => {
			const produit = produits.find((p) => p.id === ligne.idProduit);
			return (
				somme +
				(produit
					? Number(produit.prix_vente) * (Number(ligne.quantite) || 0)
					: 0)
			);
		}, 0);
		return Math.max(0, brut - (Number(remise) || 0));
	}, [lignes, produits, remise]);

	const valider = (): string | null => {
		if (lignes.length === 0) return "Ajoutez au moins une ligne de produit.";
		for (const ligne of lignes) {
			if (
				!ligne.idProduit ||
				!ligne.quantite.trim() ||
				Number(ligne.quantite) <= 0
			) {
				return "Chaque ligne doit avoir un produit et une quantité positive.";
			}
		}
		if (!idMoyen) return "Sélectionnez un moyen de paiement.";
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		try {
			await mutation.mutateAsync({
				lignes: lignes.map((ligne) => ({
					idProduit: ligne.idProduit,
					quantite: ligne.quantite.trim(),
				})),
				remise: remise || undefined,
				idClient: idClient || null,
				paiement: { montant: String(total), idMoyen },
			});
			onSaved();
		} catch {
			setGlobalError(
				"Une erreur est survenue lors de l'enregistrement de la vente.",
			);
		}
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
			<div>
				<ClientRechercheField
					value={idClient}
					onChange={(id) => setIdClient(id)}
				/>
				<p className="mt-1 text-xs text-muted-foreground">
					Client optionnel — la vente peut être enregistrée sans client.
				</p>
			</div>

			<BarcodeScanInput
				label="Scanner un produit"
				onResolu={onScanResolu}
				onIntrouvable={(code) =>
					setErreurScan(`Aucun produit pour le code « ${code} ».`)
				}
			/>
			{erreurScan ? (
				<p role="alert" className="text-sm text-destructive">
					{erreurScan}
				</p>
			) : null}

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>Produits</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={ajouterLigne}
					>
						<Plus className="size-4" aria-hidden />
						Ajouter une ligne
					</Button>
				</div>

				{lignes.map((ligne, index) => (
					<div
						key={ligne.cle}
						className="grid grid-cols-[1fr_6rem_auto] items-end gap-3"
					>
						<Select
							value={ligne.idProduit}
							onValueChange={(valeur) =>
								majLigne(ligne.cle, { idProduit: valeur })
							}
						>
							<SelectTrigger aria-label={`Produit ligne ${index + 1}`}>
								<SelectValue placeholder="Produit…" />
							</SelectTrigger>
							<SelectContent>
								{produits.map((produit) => (
									<SelectItem key={produit.id} value={produit.id}>
										{produit.reference} — {produit.nom} (
										{formatMontantFCFA(produit.prix_vente)})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<InputField
							aria-label={`Quantité ligne ${index + 1}`}
							placeholder="Qté"
							inputMode="decimal"
							value={ligne.quantite}
							onChange={(event) =>
								majLigne(ligne.cle, { quantite: event.target.value })
							}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="Retirer la ligne"
							disabled={lignes.length === 1}
							onClick={() => retirerLigne(ligne.cle)}
						>
							<Trash2 className="size-4 text-destructive" aria-hidden />
						</Button>
					</div>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="vente-remise">Remise (FCFA, optionnelle)</Label>
					<input
						id="vente-remise"
						className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						type="number"
						min="0"
						step="0.01"
						value={remise}
						onChange={(event) => setRemise(event.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="vente-moyen">Moyen de paiement</Label>
					<Select value={idMoyen} onValueChange={setIdMoyen}>
						<SelectTrigger id="vente-moyen" className="w-full">
							<SelectValue placeholder="Sélectionner un moyen" />
						</SelectTrigger>
						<SelectContent>
							{moyens.map((moyen) => (
								<SelectItem key={moyen.id} value={moyen.id}>
									{moyen.libelle}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<p className="text-right text-base font-semibold text-foreground">
				Total : {formatMontantFCFA(String(total))}
			</p>

			{globalError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{globalError}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="ghost"
					disabled={mutation.isPending}
					onClick={onCancel}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={mutation.isPending}>
					{mutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{mutation.isPending ? "Enregistrement…" : "Valider la vente"}
				</Button>
			</div>
		</form>
	);
}
