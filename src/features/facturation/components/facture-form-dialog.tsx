import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
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
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { formatMontantFCFA } from "#/features/residence/models/format";

import { useFacturerPrestation } from "../hooks/use-factures";
import { usePrestations } from "../hooks/use-prestations";

interface FactureFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Appelé avec l'id de la facture créée (navigation vers la fiche). */
	onCreated: (idFacture: string) => void;
}

/**
 * Modale « Nouvelle facture ponctuelle » (M7) : sélection d'une prestation (la
 * ligne de la facture), client (recherche ou création inline), montant payé,
 * moyen de paiement et remise optionnelle. `POST /prestations/{id}/facturer`.
 */
export function FactureFormDialog({
	open,
	onOpenChange,
	onCreated,
}: FactureFormDialogProps) {
	const prestationsQuery = usePrestations();
	const moyensQuery = useMoyensPaiement();
	const facturerMutation = useFacturerPrestation();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const prestations = (prestationsQuery.data ?? []).filter(
		(prestation) => prestation.actif,
	);
	const moyens = (moyensQuery.data ?? []).filter((moyen) => moyen.actif);

	const form = useForm({
		defaultValues: {
			idPrestation: "",
			idClient: "",
			montant: "",
			idMoyen: "",
			remise: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.idPrestation)
					fields.idPrestation = "Sélectionnez une prestation.";
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else {
					const erreur = validerMontant(value.montant, "Le montant");
					if (erreur) fields.montant = erreur;
				}
				if (!value.idMoyen)
					fields.idMoyen = "Sélectionnez un moyen de paiement.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const resultat = await facturerMutation.mutateAsync({
					idPrestation: value.idPrestation,
					montant: normaliserMontantPourBackend(value.montant),
					idMoyen: value.idMoyen,
					idClient: value.idClient || null,
					remise: value.remise.trim() || null,
				});
				onCreated(resultat.id_facture);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						(toApiError(error).message || "Une erreur est survenue."),
				);
			}
		},
	});

	const prestationSelectionnee = (idPrestation: string) =>
		prestations.find((prestation) => prestation.id === idPrestation) ?? null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
				<DialogTitle>Nouvelle facture ponctuelle</DialogTitle>
				<DialogDescription>
					Facturez une prestation avec un premier paiement (le solde peut être
					encaissé plus tard).
				</DialogDescription>
				<form
					className="mt-4 space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="idPrestation">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Prestation</Label>
								<Select
									value={field.state.value}
									onValueChange={(valeur) => {
										field.handleChange(valeur);
										const prestation = prestationSelectionnee(valeur);
										if (prestation) {
											form.setFieldValue("montant", (precedent) =>
												precedent.trim() ? precedent : prestation.prix,
											);
										}
									}}
								>
									<SelectTrigger
										id={field.name}
										aria-label="Prestation"
										className="w-full"
									>
										<SelectValue placeholder="Sélectionner une prestation" />
									</SelectTrigger>
									<SelectContent>
										{prestations.map((prestation) => (
											<SelectItem key={prestation.id} value={prestation.id}>
												{prestation.libelle} —{" "}
												{formatMontantFCFA(prestation.prix)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors[0] ? (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					<form.Field name="idClient">
						{(field) => (
							<ClientRechercheField
								value={field.state.value}
								onChange={(id) => field.handleChange(id)}
							/>
						)}
					</form.Field>

					<div className="grid grid-cols-2 gap-4">
						<form.Field name="montant">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Montant payé (FCFA)"
									inputMode="numeric"
									placeholder="0"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<form.Field name="remise">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Remise (FCFA)"
									inputMode="numeric"
									placeholder="0"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
					</div>

					<form.Field name="idMoyen">
						{(field) => (
							<div className="space-y-1.5">
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
								{field.state.meta.errors[0] ? (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					{globalError ? (
						<p role="alert" className="text-sm font-medium text-destructive">
							{globalError}
						</p>
					) : null}

					<div className="flex items-center justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={facturerMutation.isPending}>
							{facturerMutation.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Facturer
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
