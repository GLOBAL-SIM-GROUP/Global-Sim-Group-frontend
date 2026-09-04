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

import { useCreerCommande, useModifierCommande } from "../hooks/use-commandes";
import type {
	CommandePressing,
	LigneCommandePressing,
} from "../models/commandes";

interface CommandeFormProps {
	/** Commande à modifier (mode édition) ; null = dépôt. */
	commande: CommandePressing | null;
	/** Lignes actuelles (mode édition). */
	lignesInitiales?: LigneCommandePressing[];
	moyens: MoyenPaiement[];
	onCancel: () => void;
	onSaved: () => void;
}

interface LigneSaisie {
	/** Clé stable (index insuffisant : lignes ajoutées/retirées). */
	cle: number;
	typeVetement: string;
	quantite: string;
	prestation: string;
	tarif: string;
}

/**
 * Formulaire « Dépôt — Pressing » (M4) : recherche client, articles
 * (type de vêtement, quantité, prestation, tarif), date de retrait prévue,
 * acompte optionnel + moyen de paiement. Total calculé automatiquement. En
 * édition : articles + date de retrait (client conservé).
 */
export function CommandeForm({
	commande,
	lignesInitiales,
	moyens,
	onCancel,
	onSaved,
}: CommandeFormProps) {
	const createMutation = useCreerCommande();
	const editMutation = useModifierCommande();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [idClient, setIdClient] = useState(commande?.id_client ?? "");
	// `cle` dérivée de l'index de construction (pas de `ligne.id`, qui n'est
	// pas forcément numérique) : garantit des clés 0..n-1 uniques quel que
	// soit le contenu de `lignesInitiales`.
	const lignesInitialesEffectives: LigneSaisie[] =
		lignesInitiales && lignesInitiales.length > 0
			? lignesInitiales.map((ligne, index) => ({
					cle: index,
					typeVetement: ligne.type_vetement,
					quantite: String(ligne.quantite),
					prestation: ligne.prestation,
					tarif: ligne.tarif,
				}))
			: [
					{
						cle: 0,
						typeVetement: "",
						quantite: "1",
						prestation: "",
						tarif: "",
					},
				];
	const [lignes, setLignes] = useState<LigneSaisie[]>(
		lignesInitialesEffectives,
	);
	// Dérivée de la liste effectivement posée en état (jamais de `lignesInitiales`
	// directement) : évite qu'un tableau initial vide (ex. lignes pas encore
	// chargées) ne fasse démarrer `prochaineCle` à 0 et entre en collision avec
	// la ligne par défaut, elle aussi `cle: 0`.
	const [prochaineCle, setProchaineCle] = useState(
		lignesInitialesEffectives.length,
	);
	const [dateRetrait, setDateRetrait] = useState(
		commande?.date_retrait_prevue ?? "",
	);
	const [acompte, setAcompte] = useState("");
	const [idMoyen, setIdMoyen] = useState("");

	const ajouterLigne = () => {
		setLignes((current) => [
			...current,
			{
				cle: prochaineCle,
				typeVetement: "",
				quantite: "1",
				prestation: "",
				tarif: "",
			},
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
			lignes.reduce(
				(somme, ligne) =>
					somme + (Number(ligne.tarif) || 0) * (Number(ligne.quantite) || 0),
				0,
			),
		[lignes],
	);
	const reste = Math.max(0, total - (Number(acompte) || 0));

	const valider = (): string | null => {
		if (!commande && !idClient) return "Sélectionnez un client.";
		if (lignes.length === 0) return "Ajoutez au moins un article.";
		for (const ligne of lignes) {
			if (
				!ligne.typeVetement.trim() ||
				!ligne.prestation.trim() ||
				!ligne.tarif.trim() ||
				Number(ligne.quantite) <= 0
			) {
				return "Chaque article doit avoir un type, une prestation, un tarif et une quantité positive.";
			}
		}
		if (!dateRetrait.trim()) return "Saisissez la date de retrait prévue.";
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		const lignesCorps = lignes.map((ligne) => ({
			typeVetement: ligne.typeVetement.trim(),
			quantite: ligne.quantite.trim(),
			prestation: ligne.prestation.trim(),
			tarif: ligne.tarif.trim(),
		}));
		try {
			if (commande) {
				await editMutation.mutateAsync({
					id: commande.id,
					idClient,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
				});
			} else {
				await createMutation.mutateAsync({
					idClient,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
					paiement: idMoyen && acompte ? { montant: acompte, idMoyen } : null,
				});
			}
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
			{!commande ? (
				<ClientRechercheField
					value={idClient}
					onChange={(id) => setIdClient(id)}
				/>
			) : null}

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>Articles</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={ajouterLigne}
					>
						<Plus className="size-4" aria-hidden />
						Ajouter un article
					</Button>
				</div>

				{lignes.map((ligne) => (
					<div
						key={ligne.cle}
						className="space-y-3 rounded-md border border-border p-3"
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<InputField
								aria-label="Type de vêtement"
								placeholder="Type de vêtement (ex : Chemise)"
								value={ligne.typeVetement}
								onChange={(event) =>
									majLigne(ligne.cle, { typeVetement: event.target.value })
								}
							/>
							<InputField
								aria-label="Prestation"
								placeholder="Prestation (ex : Repassage)"
								value={ligne.prestation}
								onChange={(event) =>
									majLigne(ligne.cle, { prestation: event.target.value })
								}
							/>
							<InputField
								aria-label="Quantité"
								type="number"
								min="1"
								value={ligne.quantite}
								onChange={(event) =>
									majLigne(ligne.cle, { quantite: event.target.value })
								}
							/>
							<InputField
								aria-label="Tarif"
								placeholder="Tarif (FCFA)"
								inputMode="numeric"
								value={ligne.tarif}
								onChange={(event) =>
									majLigne(ligne.cle, { tarif: event.target.value })
								}
							/>
						</div>
						<div className="flex justify-end">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={lignes.length === 1}
								onClick={() => retirerLigne(ligne.cle)}
							>
								<Trash2 className="size-4 text-destructive" aria-hidden />
								Retirer
							</Button>
						</div>
					</div>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="commande-retrait">Date de retrait prévue</Label>
					<input
						id="commande-retrait"
						className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						type="date"
						value={dateRetrait}
						onChange={(event) => setDateRetrait(event.target.value)}
					/>
				</div>

				{!commande ? (
					<div>
						<Label htmlFor="commande-acompte">Acompte (FCFA, optionnel)</Label>
						<input
							id="commande-acompte"
							className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
							type="number"
							min="0"
							step="0.01"
							value={acompte}
							onChange={(event) => setAcompte(event.target.value)}
						/>
					</div>
				) : null}
			</div>

			{!commande && moyens.length > 0 ? (
				<div className="space-y-2">
					<Label htmlFor="commande-moyen">Moyen de paiement (si acompte)</Label>
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
				</div>
			) : null}

			<div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3 text-sm">
				<span className="text-muted-foreground">
					Total : {formatMontantFCFA(String(total))}
				</span>
				{!commande ? (
					<span className="font-medium text-foreground">
						Reste à payer : {formatMontantFCFA(String(reste))}
					</span>
				) : null}
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
					disabled={createMutation.isPending || editMutation.isPending}
					onClick={onCancel}
				>
					Annuler
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending || editMutation.isPending}
				>
					{createMutation.isPending || editMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{createMutation.isPending || editMutation.isPending
						? "Enregistrement…"
						: "Enregistrer"}
				</Button>
			</div>
		</form>
	);
}
