import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { useEncaisserLoyerLot } from "../hooks/use-contrats";
import type { Echeance } from "../models/contrats";
import { echanceStatutLabel } from "../models/echeances";
import { formatMontantFCFA } from "../models/format";
import type { MoyenPaiement } from "../models/moyens-paiement";

interface EncaisserLotFormProps {
	idContrat: string;
	/** Échéances du contrat, pour afficher mois/année dans le résultat (le
	 *  serveur ne renvoie que des id). */
	echeances: Echeance[];
	montantMaximum: number;
	moyens: MoyenPaiement[];
	onCancel: () => void;
	/** Appelé quand l'utilisateur ferme la vue de résultat (rafraîchit déjà
	 *  fait par la mutation, ce callback ne fait que fermer la modale). */
	onSaved: () => void;
}

/**
 * Formulaire « Encaissement en lot » (POST
 * `/contrats/{id}/encaisser-loyer-lot`) : un seul montant réparti par le
 * serveur sur plusieurs échéances impayées, des plus anciennes aux plus
 * récentes. Après succès, affiche le détail renvoyé (aucune répartition
 * recalculée côté client) au lieu de fermer immédiatement la modale.
 */
export function EncaisserLotForm({
	idContrat,
	echeances,
	montantMaximum,
	moyens,
	onCancel,
	onSaved,
}: EncaisserLotFormProps) {
	const mutation = useEncaisserLoyerLot();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const echeanceParId = useMemo(
		() => new Map(echeances.map((echeance) => [echeance.id, echeance])),
		[echeances],
	);

	const form = useForm({
		defaultValues: { montant: "", idMoyen: moyens[0]?.id ?? "", date: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<"montant" | "idMoyen", string>> = {};
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else if (!/^\d+(\.\d{1,2})?$/.test(value.montant.trim())) {
					fields.montant =
						"Le montant doit contenir au maximum deux décimales.";
				} else if (Number(value.montant) > montantMaximum) {
					fields.montant = `Le montant ne peut pas dépasser ${formatMontantFCFA(
						String(montantMaximum),
					)}.`;
				}
				if (!value.idMoyen) {
					fields.idMoyen = "Sélectionnez un moyen de paiement.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await mutation.mutateAsync({
					idContrat,
					montant: value.montant.trim(),
					idMoyen: value.idMoyen,
					date: value.date ? `${value.date.replace("T", " ")}:00` : undefined,
				});
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						(toApiError(error).message || "Une erreur est survenue."),
				);
			}
		},
	});

	if (mutation.isSuccess && mutation.data) {
		const resultat = mutation.data;
		const nbPayees = resultat.echeances.filter(
			(e) => e.statut === "PAYE",
		).length;
		const nbPartielles = resultat.echeances.filter(
			(e) => e.statut === "PARTIEL",
		).length;

		return (
			<div className="space-y-4">
				<p className="text-sm text-foreground">
					{formatMontantFCFA(resultat.montantTotal)} encaissé — {nbPayees}{" "}
					échéance{nbPayees > 1 ? "s" : ""} réglée
					{nbPayees > 1 ? "s" : ""} intégralement
					{nbPartielles > 0
						? `, ${nbPartielles} réglée${nbPartielles > 1 ? "s" : ""} partiellement`
						: ""}
					.
				</p>

				<div className="overflow-x-auto rounded-lg border border-border">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-muted text-left">
							<tr>
								<th scope="col" className="px-3 py-2 font-medium">
									Échéance
								</th>
								<th scope="col" className="px-3 py-2 font-medium">
									Montant appliqué
								</th>
								<th scope="col" className="px-3 py-2 font-medium">
									Statut
								</th>
							</tr>
						</thead>
						<tbody>
							{resultat.echeances.map((e) => {
								const echeance = echeanceParId.get(e.id);
								return (
									<tr key={e.id} className="border-t border-border">
										<td className="px-3 py-2 text-foreground">
											{echeance ? `${echeance.mois}/${echeance.annee}` : e.id}
										</td>
										<td className="px-3 py-2 text-foreground">
											{formatMontantFCFA(e.montantApplique)}
										</td>
										<td className="px-3 py-2 text-muted-foreground">
											{echanceStatutLabel(e.statut)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{resultat.montantNonAffecte !== undefined ? (
					<output className="block rounded-lg border border-[#E67E22]/40 bg-[#E67E22]/10 p-3 text-sm text-[#E67E22]">
						{resultat.avertissement ??
							`${formatMontantFCFA(String(resultat.montantNonAffecte))} n'ont pu être affectés à aucune échéance.`}
					</output>
				) : null}

				<div className="flex items-center justify-end gap-2 pt-2">
					<Button type="button" onClick={onSaved}>
						Fermer
					</Button>
				</div>
			</div>
		);
	}

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="montant">
				{(field) => (
					<div className="space-y-1.5">
						<InputField
							id={field.name}
							name={field.name}
							label="Montant (FCFA)"
							inputMode="decimal"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
						<p className="text-xs text-muted-foreground">
							Maximum à encaisser : {formatMontantFCFA(String(montantMaximum))}
						</p>
					</div>
				)}
			</form.Field>

			<form.Field name="idMoyen">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Moyen de paiement</Label>
						<Select
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							<SelectTrigger
								id={field.name}
								aria-label="Moyen de paiement"
								className="w-full"
							>
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
						{field.state.meta.errors[0] ? (
							<p className="text-sm text-destructive">
								{field.state.meta.errors[0]}
							</p>
						) : null}
					</div>
				)}
			</form.Field>

			<form.Field name="date">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Date (optionnelle)"
						type="datetime-local"
						step="60"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
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
							onClick={onCancel}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							{isSubmitting ? "Enregistrement…" : "Enregistrer le paiement"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
