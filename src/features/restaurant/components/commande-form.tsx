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

import { useCreerCommande } from "../hooks/use-commandes";
import { TYPE_COMMANDE_LABELS, type TypeCommande } from "../models/commandes";
import type { Plat } from "../models/plats";

interface CommandeFormProps {
	plats: Plat[];
	moyens: MoyenPaiement[];
	onCancel: () => void;
	onSaved: () => void;
}

interface LigneSaisie {
	cle: number;
	idPlat: string;
	quantite: string;
}

/**
 * Formulaire « Nouvelle commande — Restaurant » (M5) : type de commande, client
 * optionnel, lignes de plats (sélection + quantité), total calculé et moyen de
 * paiement. Le POST génère la facture côté backend.
 */
export function CommandeForm({
	plats,
	moyens,
	onCancel,
	onSaved,
}: CommandeFormProps) {
	const mutation = useCreerCommande();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [type, setType] = useState<TypeCommande>("SUR_PLACE");
	const [idClient, setIdClient] = useState("");
	const [lignes, setLignes] = useState<LigneSaisie[]>([
		{ cle: 0, idPlat: "", quantite: "1" },
	]);
	const [prochaineCle, setProchaineCle] = useState(1);
	const [idMoyen, setIdMoyen] = useState("");

	const ajouterLigne = () => {
		setLignes((current) => [
			...current,
			{ cle: prochaineCle, idPlat: "", quantite: "1" },
		]);
		setProchaineCle((valeur) => valeur + 1);
	};
	const majLigne = (cle: number, patch: Partial<LigneSaisie>) =>
		setLignes((current) =>
			current.map((ligne) =>
				ligne.cle === cle ? { ...ligne, ...patch } : ligne,
			),
		);
	const retirerLigne = (cle: number) =>
		setLignes((current) => current.filter((ligne) => ligne.cle !== cle));

	const total = useMemo(
		() =>
			lignes.reduce((somme, ligne) => {
				const plat = plats.find((p) => p.id === ligne.idPlat);
				return (
					somme + (plat ? Number(plat.prix) * (Number(ligne.quantite) || 0) : 0)
				);
			}, 0),
		[lignes, plats],
	);

	const valider = (): string | null => {
		if (lignes.length === 0) return "Ajoutez au moins une ligne de plat.";
		for (const ligne of lignes) {
			if (
				!ligne.idPlat ||
				!ligne.quantite.trim() ||
				Number(ligne.quantite) <= 0
			) {
				return "Chaque ligne doit avoir un plat et une quantité positive.";
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
				type,
				lignes: lignes.map((ligne) => ({
					idPlat: ligne.idPlat,
					quantite: ligne.quantite.trim(),
				})),
				idClient: idClient || null,
				paiement: { montant: String(total), idMoyen },
			});
			onSaved();
		} catch {
			setGlobalError("Une erreur est survenue lors de l'enregistrement.");
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
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="commande-type">Type de commande</Label>
					<Select
						value={type}
						onValueChange={(valeur) => setType(valeur as TypeCommande)}
					>
						<SelectTrigger id="commande-type" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(TYPE_COMMANDE_LABELS) as TypeCommande[]).map(
								(valeur) => (
									<SelectItem key={valeur} value={valeur}>
										{TYPE_COMMANDE_LABELS[valeur]}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</div>
			</div>

			<ClientRechercheField
				value={idClient}
				onChange={(id) => setIdClient(id)}
			/>
			<p className="-mt-3 text-xs text-muted-foreground">
				Client optionnel — la commande peut être enregistrée sans client.
			</p>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>Plats</Label>
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

				{lignes.map((ligne) => (
					<div
						key={ligne.cle}
						className="grid grid-cols-[1fr_6rem_auto] items-end gap-3"
					>
						<Select
							value={ligne.idPlat}
							onValueChange={(valeur) =>
								majLigne(ligne.cle, { idPlat: valeur })
							}
						>
							<SelectTrigger aria-label="Plat">
								<SelectValue placeholder="Plat…" />
							</SelectTrigger>
							<SelectContent>
								{plats.map((plat) => (
									<SelectItem key={plat.id} value={plat.id}>
										{plat.nom} ({formatMontantFCFA(plat.prix)})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<InputField
							aria-label="Quantité"
							placeholder="Qté"
							type="number"
							min="1"
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

			<div className="space-y-2">
				<Label htmlFor="commande-moyen">Moyen de paiement</Label>
				<Select value={idMoyen} onValueChange={setIdMoyen}>
					<SelectTrigger id="commande-moyen" className="w-full">
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
				{moyens.length === 0 ? (
					<p className="text-xs text-muted-foreground">
						Aucun moyen de paiement configuré (module Finances).
					</p>
				) : null}
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
					{mutation.isPending ? "Enregistrement…" : "Valider la commande"}
				</Button>
			</div>
		</form>
	);
}
