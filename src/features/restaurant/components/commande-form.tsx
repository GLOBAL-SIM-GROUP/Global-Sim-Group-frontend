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
import { toApiError } from "#/core/api";
import { ApercuAbonnementPanel } from "#/features/abonnement/components/apercu-panel";
import { useApercuDebounced } from "#/features/abonnement/hooks/use-apercu";
import { CODE_EXCEDENT } from "#/features/abonnement/models/abonnements";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { formatMontantFCFA } from "#/features/residence/models/format";
import type { MoyenPaiement } from "#/features/residence/models/moyens-paiement";

import { apercuAbonnementLignes } from "../api/commandes";
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
	// Abonnements : ignorer = plein tarif ; `excedentConfirme` armé par le 409
	// `ABONNEMENT_EXCEDENT` (message serveur affiché, resubmit confirmé).
	const [ignorerAbonnement, setIgnorerAbonnement] = useState(false);
	const [excedentConfirme, setExcedentConfirme] = useState(false);

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

	// Aperçu de couverture abonnement (POST `/restaurant/commandes/apercu-abonnement`)
	// — débouncé ~300 ms, relancé à chaque changement de lignes complètes.
	const lignesCompletes =
		lignes.length > 0 &&
		lignes.every((ligne) => ligne.idPlat && Number(ligne.quantite) > 0);
	const apercuRequest =
		idClient && lignesCompletes && !ignorerAbonnement
			? {
					idClient,
					lignes: lignes.map((ligne) => ({
						idPlat: ligne.idPlat,
						quantite: ligne.quantite.trim(),
					})),
				}
			: null;
	const apercu = useApercuDebounced(apercuAbonnementLignes, apercuRequest);

	// Le montant dû est piloté par l'aperçu (`total_du`), pas le brut.
	const montantDu = apercu.data ? Number(apercu.data.total_du) : total;
	const sansPaiement =
		apercu.data !== null && !ignorerAbonnement && montantDu === 0;

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
		// `paiement` omis quand l'abonnement couvre tout — sinon moyen requis.
		if (!sansPaiement && !idMoyen) {
			return "Sélectionnez un moyen de paiement.";
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
		try {
			await mutation.mutateAsync({
				type,
				lignes: lignes.map((ligne) => ({
					idPlat: ligne.idPlat,
					quantite: ligne.quantite.trim(),
				})),
				idClient: idClient || null,
				...(sansPaiement
					? {}
					: { paiement: { montant: String(montantDu), idMoyen } }),
				utiliserAbonnement: !ignorerAbonnement,
				accepterExcedent: excedentConfirme || apercu.data?.excedent === true,
			});
			onSaved();
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 409 && apiError.code === CODE_EXCEDENT) {
				setExcedentConfirme(true);
				setGlobalError(apiError.message || "Dépassement de quota abonnement.");
			} else {
				setGlobalError("Une erreur est survenue lors de l'enregistrement.");
			}
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

			{idClient ? (
				<>
					<ApercuAbonnementPanel
						apercu={apercu.data}
						pending={apercu.pending}
						error={apercu.error}
						visible={!ignorerAbonnement}
					/>
					{apercu.data && apercu.data.abonnements.length > 0 ? (
						<label className="flex items-center gap-2 text-sm text-muted-foreground">
							<input
								type="checkbox"
								checked={ignorerAbonnement}
								onChange={(event) => setIgnorerAbonnement(event.target.checked)}
							/>
							Ne pas utiliser l'abonnement — facturer plein tarif
						</label>
					) : null}
				</>
			) : null}

			{sansPaiement ? (
				<p className="rounded-md border border-[#27AE60]/30 bg-[#27AE60]/10 px-3 py-2 text-sm text-[#27AE60]">
					Commande entièrement couverte par l'abonnement — aucun paiement à
					encaisser.
				</p>
			) : (
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
			)}

			<p className="text-right text-base font-semibold text-foreground">
				{apercu.data && !ignorerAbonnement
					? `À payer : ${formatMontantFCFA(apercu.data.total_du)}`
					: `Total : ${formatMontantFCFA(String(total))}`}
			</p>

			{excedentConfirme ? (
				<p
					role="alert"
					className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
				>
					Excédent confirmé — cliquez à nouveau pour enregistrer la commande en
					facturant le dépassement au client.
				</p>
			) : null}

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
