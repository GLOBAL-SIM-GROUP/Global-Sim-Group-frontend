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
import { messageErreurPaiement } from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";
import { CaissePicker } from "#/features/finances/components/caisse-picker";
import { useCaissesAccessibles } from "#/features/finances/hooks/use-caisses-accessibles";
import {
	erreurCaisseRequise,
	idCaisseAEnvoyer,
} from "#/features/finances/models/caisses";
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
	const caissesQuery = useCaissesAccessibles();

	const prestations = (prestationsQuery.data ?? []).filter(
		(prestation) => prestation.actif,
	);
	const moyens = (moyensQuery.data ?? []).filter((moyen) => moyen.actif);

	const prestationSelectionnee = (idPrestation: string) =>
		prestations.find((prestation) => prestation.id === idPrestation) ?? null;

	// Reste dû serveur = prix de la prestation − remise : le paiement ne peut
	// pas le dépasser (sinon 400 MONTANT_DEPASSE_RESTE).
	const resteDu = (idPrestation: string, remise: string) => {
		const prestation = prestationSelectionnee(idPrestation);
		if (!prestation) return null;
		const remiseNombre = remise.trim()
			? Number(normaliserMontantPourBackend(remise))
			: 0;
		if (!Number.isFinite(remiseNombre)) return null;
		return Number(prestation.prix) - remiseNombre;
	};

	const form = useForm({
		defaultValues: {
			idPrestation: "",
			idClient: "",
			montant: "",
			idMoyen: "",
			idCaisse: "",
			remise: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.idPrestation)
					fields.idPrestation = "Sélectionnez une prestation.";
				// Le backend exige `id_client` ou un nouveau client — une
				// absence déclenche un 500 brut (`resoudreClient`), pas un 400.
				if (!value.idClient) fields.idClient = "Sélectionnez un client.";
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else {
					const erreur = validerMontant(value.montant, "Le montant");
					if (erreur) fields.montant = erreur;
				}
				if (value.remise.trim()) {
					const erreurRemise = validerMontant(value.remise, "La remise");
					if (erreurRemise) {
						fields.remise = erreurRemise;
					} else {
						const prestation = prestationSelectionnee(value.idPrestation);
						if (
							prestation &&
							Number(normaliserMontantPourBackend(value.remise)) >
								Number(prestation.prix)
						)
							fields.remise =
								"La remise ne peut pas dépasser le prix de la prestation.";
					}
				}
				if (!value.idMoyen)
					fields.idMoyen = "Sélectionnez un moyen de paiement.";
				const erreurCaisse = erreurCaisseRequise(
					caissesQuery.data,
					value.idCaisse,
				);
				if (erreurCaisse) fields.idCaisse = erreurCaisse;
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				// La remise s'applique en arrière-plan : si le montant saisi
				// dépasse le reste dû (prix − remise), il est ramené au reste
				// plutôt que rejeté — le serveur exige `montant <= reste`.
				const reste = resteDu(value.idPrestation, value.remise);
				const montantNormalise = normaliserMontantPourBackend(value.montant);
				const montant =
					reste !== null && Number(montantNormalise) > reste
						? String(Math.max(reste, 0))
						: montantNormalise;
				const resultat = await facturerMutation.mutateAsync({
					idPrestation: value.idPrestation,
					montant,
					idMoyen: value.idMoyen,
					idCaisse: idCaisseAEnvoyer(caissesQuery.data, value.idCaisse),
					idClient: value.idClient || null,
					remise: value.remise.trim() || null,
				});
				onCreated(resultat.id_facture);
			} catch (error) {
				setGlobalError(messageErreurPaiement(error));
			}
		},
	});

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
											// Pré-remplit au reste dû (prix − remise courante),
											// pas au prix plein — sinon une remise déjà saisie
											// rend la valeur envoyée > reste dû.
											form.setFieldValue("montant", (precedent) => {
												if (precedent.trim()) return precedent;
												const reste = resteDu(
													valeur,
													form.getFieldValue("remise"),
												);
												return String(reste ?? prestation.prix);
											});
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
							<div className="space-y-1.5">
								<ClientRechercheField
									value={field.state.value}
									onChange={(id) => field.handleChange(id)}
								/>
								{field.state.meta.errors[0] ? (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					<div className="grid grid-cols-2 gap-4">
						<form.Field name="montant">
							{(field) => (
								<div className="space-y-1">
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
									<form.Subscribe
										selector={(state) =>
											[state.values.idPrestation, state.values.remise] as const
										}
									>
										{([idPrestation, remise]) => {
											const reste = resteDu(idPrestation, remise);
											if (reste === null || reste < 0) return null;
											return (
												<p className="text-xs text-muted-foreground">
													Reste dû : {formatMontantFCFA(String(reste))}
													{remise.trim() ? " (prix − remise)" : ""}
												</p>
											);
										}}
									</form.Subscribe>
								</div>
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
									onChange={(event) => {
										const saisie = event.target.value;
										field.handleChange(saisie);
										// La remise s'applique en arrière-plan : le
										// « Montant payé » suit le reste dû
										// (prix − remise) au fil de la saisie.
										const prestation = prestationSelectionnee(
											form.getFieldValue("idPrestation"),
										);
										if (!prestation) return;
										const remiseNombre = saisie.trim()
											? Number(normaliserMontantPourBackend(saisie))
											: 0;
										if (!Number.isFinite(remiseNombre)) return;
										form.setFieldValue(
											"montant",
											String(
												Math.max(0, Number(prestation.prix) - remiseNombre),
											),
										);
									}}
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

					<form.Field name="idCaisse">
						{(field) => (
							<CaissePicker
								id={field.name}
								caisses={caissesQuery.data}
								chargement={caissesQuery.isLoading}
								value={field.state.value}
								onChange={field.handleChange}
								erreur={field.state.meta.errors[0]}
							/>
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
