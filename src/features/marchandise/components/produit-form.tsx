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
import { Switch } from "#/components/ui/switch";
import { getErrorMessageForCode, getFieldErrors, toApiError } from "#/core/api";

import { useCreerProduit, useModifierProduit } from "../hooks/use-produits";
import type {
	CategorieProduit,
	Fournisseur,
	Produit,
} from "../models/produits";

/** Champs du formulaire (noms cohérents avec le corps API). */
type ProduitField =
	| "reference"
	| "nom"
	| "idCategorieProduit"
	| "prixAchat"
	| "prixVente"
	| "stockInitial"
	| "seuilAlerte"
	| "idFournisseur"
	| "actif";

/** Propriétés backend (snake_case) → champs du formulaire. */
const FIELD_PROPERTY_TO_FORM: Record<string, ProduitField> = {
	reference: "reference",
	nom: "nom",
	id_categorie_produit: "idCategorieProduit",
	prix_achat: "prixAchat",
	prix_vente: "prixVente",
	quantite_initiale: "stockInitial",
	seuil_alerte: "seuilAlerte",
	id_fournisseur: "idFournisseur",
	actif: "actif",
};

interface ProduitFormProps {
	/** Produit à modifier (mode édition) ; null = création. */
	produit: Produit | null;
	categories: CategorieProduit[];
	fournisseurs: Fournisseur[];
	onCancel: () => void;
	onSaved: () => void;
}

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
 * Formulaire « Ajouter / Modifier un produit » (M3), affiché dans une modale.
 * Référence et nom obligatoires, prix numériques, stock initial (création
 * seule), seuil d'alerte, catégorie/fournisseur optionnels, actif.
 */
export function ProduitForm({
	produit,
	categories,
	fournisseurs,
	onCancel,
	onSaved,
}: ProduitFormProps) {
	const createMutation = useCreerProduit();
	const editMutation = useModifierProduit();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			reference: produit?.reference ?? "",
			nom: produit?.nom ?? "",
			idCategorieProduit: produit?.id_categorie_produit ?? "",
			prixAchat: produit?.prix_achat ?? "",
			prixVente: produit?.prix_vente ?? "",
			stockInitial: "",
			seuilAlerte: produit?.seuil_alerte ?? "",
			idFournisseur: produit?.id_fournisseur ?? "",
			actif: produit?.actif ?? true,
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				const fields: Partial<Record<ProduitField, string>> = {};
				if (!value.reference.trim()) fields.reference = "Ce champ est requis.";
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.prixAchat.trim()) {
					fields.prixAchat = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.prixAchat.trim())) {
					fields.prixAchat = "Le prix doit être un nombre.";
				}
				if (!value.prixVente.trim()) {
					fields.prixVente = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.prixVente.trim())) {
					fields.prixVente = "Le prix doit être un nombre.";
				}
				if (
					value.seuilAlerte &&
					!/^\d+(\.\d+)?$/.test(value.seuilAlerte.trim())
				) {
					fields.seuilAlerte = "Le seuil doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					reference: value.reference.trim(),
					nom: value.nom.trim(),
					idCategorieProduit: value.idCategorieProduit || null,
					prixAchat: value.prixAchat.trim(),
					prixVente: value.prixVente.trim(),
					quantiteInitiale: value.stockInitial.trim() || null,
					seuilAlerte: value.seuilAlerte.trim() || null,
					idFournisseur: value.idFournisseur || null,
					actif: value.actif,
				};
				if (produit) {
					await editMutation.mutateAsync({ id: produit.id, ...corps });
				} else {
					await createMutation.mutateAsync(corps);
				}
				onSaved();
			} catch (error) {
				// Erreurs de validation backend → champ par champ (details[].property).
				let mappedFields = 0;
				for (const detail of getFieldErrors(error)) {
					const formField = FIELD_PROPERTY_TO_FORM[detail.property];
					if (formField && detail.messages.length > 0) {
						form.setFieldMeta(formField, (prev) => ({
							...prev,
							errorMap: {
								...prev.errorMap,
								onServer: detail.messages.join(" · "),
							},
						}));
						mappedFields += 1;
					}
				}
				if (mappedFields === 0) {
					setGlobalError(
						getErrorMessageForCode(toApiError(error).code) ??
							"Une erreur est survenue.",
					);
				}
			}
		},
	});

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="reference">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Référence"
							placeholder="ex : SUCRE-01"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="nom">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Nom"
							placeholder="ex : Sucre en poudre 1kg"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="idCategorieProduit">
					{(field) => (
						<SelectField
							id={field.name}
							label="Catégorie"
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							{categories.map((categorie) => (
								<SelectItem key={categorie.id} value={categorie.id}>
									{categorie.libelle}
								</SelectItem>
							))}
						</SelectField>
					)}
				</form.Field>

				<form.Field name="idFournisseur">
					{(field) => (
						<SelectField
							id={field.name}
							label="Fournisseur"
							value={field.state.value}
							onValueChange={field.handleChange}
						>
							{fournisseurs.map((fournisseur) => (
								<SelectItem key={fournisseur.id} value={fournisseur.id}>
									{fournisseur.nom}
								</SelectItem>
							))}
						</SelectField>
					)}
				</form.Field>

				<form.Field name="prixAchat">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prix d'achat (FCFA)"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="prixVente">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prix de vente (FCFA)"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				{!produit ? (
					<form.Field name="stockInitial">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Stock initial"
								inputMode="numeric"
								autoComplete="off"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
				) : null}

				<form.Field name="seuilAlerte">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Seuil d'alerte"
							inputMode="numeric"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="actif">
				{(field) => (
					<div className="flex items-center gap-3">
						<Label htmlFor={field.name}>Actif</Label>
						<Switch
							id={field.name}
							checked={field.state.value}
							onCheckedChange={field.handleChange}
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
							{isSubmitting ? "Enregistrement…" : "Enregistrer"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
