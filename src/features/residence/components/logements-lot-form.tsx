import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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
import { Textarea } from "#/components/ui/textarea";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { cn } from "#/lib/utils";

import { useCreerLogementsLot } from "../hooks/use-logements";
import type { Batiment } from "../models/batiments";
import {
	basculerEquipement,
	EQUIPEMENTS_PREDEFINIS,
	equipementsDepuisTexte,
	LOGEMENT_STATUT_LABELS,
	type LogementStatut,
} from "../models/logements";

interface LogementsLotFormProps {
	batiments: Batiment[];
	batimentIdParDefaut?: string;
	onCancel: () => void;
	onSaved: () => void;
}

export function LogementsLotForm({
	batiments,
	batimentIdParDefaut,
	onCancel,
	onSaved,
}: LogementsLotFormProps) {
	const mutation = useCreerLogementsLot();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			idBatiment: batimentIdParDefaut ?? "",
			type: "CHAMBRE" as "CHAMBRE" | "STUDIO",
			tarif: "",
			statut: "DISPONIBLE" as LogementStatut,
			quantite: "1",
			equipements: "",
			etat: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<
					Record<"idBatiment" | "tarif" | "quantite", string>
				> = {};
				if (!value.idBatiment) fields.idBatiment = "Ce champ est requis.";
				if (!value.tarif.trim()) {
					fields.tarif = "Ce champ est requis.";
				} else if (!/^\d+(\.\d{1,2})?$/.test(value.tarif.trim())) {
					fields.tarif = "Le tarif doit contenir au maximum deux décimales.";
				}
				const quantite = Number(value.quantite);
				if (!Number.isInteger(quantite) || quantite < 1 || quantite > 100) {
					fields.quantite = "La quantité doit être un entier entre 1 et 100.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await mutation.mutateAsync({
					idBatiment: value.idBatiment,
					type: value.type,
					tarif: value.tarif.trim(),
					statut: value.statut,
					quantite: Number(value.quantite),
					equipements: value.equipements.trim() || null,
					etat: value.etat.trim() || null,
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

	if (mutation.isSuccess) {
		return (
			<div className="space-y-4">
				<p className="text-sm font-medium text-foreground">
					{mutation.data.length} logement
					{mutation.data.length > 1 ? "s" : ""} créé
					{mutation.data.length > 1 ? "s" : ""} avec succès.
				</p>
				<div className="max-h-60 overflow-y-auto rounded-lg border border-border">
					<ul className="divide-y divide-border">
						{mutation.data.map((logement) => (
							<li
								key={logement.id}
								className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
							>
								<span className="font-medium text-foreground">
									{logement.numero}
								</span>
								<span className="text-muted-foreground">{logement.type}</span>
							</li>
						))}
					</ul>
				</div>
				<div className="flex justify-end">
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
			<form.Field name="idBatiment">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Bâtiment</Label>
						<Select
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							<SelectTrigger id={field.name} className="w-full">
								<SelectValue placeholder="Sélectionner un bâtiment" />
							</SelectTrigger>
							<SelectContent>
								{batiments.map((batiment) => (
									<SelectItem key={batiment.id} value={batiment.id}>
										{batiment.code} — {batiment.nom}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{field.state.meta.errors[0] ? (
							<p className="text-sm text-destructive">
								{field.state.meta.errors[0]}
							</p>
						) : null}
					</div>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="type">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Type</Label>
							<Select
								value={field.state.value}
								onValueChange={(value) =>
									field.handleChange(value as "CHAMBRE" | "STUDIO")
								}
							>
								<SelectTrigger id={field.name} className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="CHAMBRE">Chambre</SelectItem>
									<SelectItem value="STUDIO">Studio</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>

				<form.Field name="statut">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Statut</Label>
							<Select
								value={field.state.value}
								onValueChange={(value) =>
									field.handleChange(value as LogementStatut)
								}
							>
								<SelectTrigger id={field.name} className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(
										Object.keys(LOGEMENT_STATUT_LABELS) as LogementStatut[]
									).map((statut) => (
										<SelectItem key={statut} value={statut}>
											{LOGEMENT_STATUT_LABELS[statut]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="tarif">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Tarif (FCFA)"
							inputMode="decimal"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="quantite">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Quantité"
							type="number"
							min={1}
							max={100}
							step={1}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="equipements">
				{(field) => {
					const equipementsSelectionnes = equipementsDepuisTexte(
						field.state.value,
					).map((equipement) => equipement.toLocaleLowerCase("fr"));
					return (
						<div className="space-y-3">
							<div className="space-y-2">
								<Label>Équipements proposés</Label>
								<div className="flex flex-wrap gap-2">
									{EQUIPEMENTS_PREDEFINIS.map((equipement) => {
										const selectionne = equipementsSelectionnes.includes(
											equipement.toLocaleLowerCase("fr"),
										);
										return (
											<button
												key={equipement}
												type="button"
												aria-pressed={selectionne}
												onClick={() =>
													field.handleChange(
														basculerEquipement(field.state.value, equipement),
													)
												}
												className={cn(
													"rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
													selectionne
														? "border-lagoon bg-lagoon text-white"
														: "border-border bg-card text-muted-foreground hover:border-lagoon/50 hover:text-foreground",
												)}
											>
												{equipement}
											</button>
										);
									})}
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor={field.name}>Équipements enregistrés</Label>
								<Textarea
									id={field.name}
									placeholder="Sélectionnez les équipements ou ajoutez-en d'autres…"
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</div>
						</div>
					);
				}}
			</form.Field>

			<form.Field name="etat">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>État (optionnel)</Label>
						<Textarea
							id={field.name}
							placeholder="ex : Bon état"
							value={field.state.value}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
					</div>
				)}
			</form.Field>

			{globalError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{globalError}
				</p>
			) : null}

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<div className="flex justify-end gap-2 pt-2">
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
							{isSubmitting ? "Création…" : "Créer le lot"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
