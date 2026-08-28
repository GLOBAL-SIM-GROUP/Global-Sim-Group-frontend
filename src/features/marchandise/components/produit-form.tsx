import { useForm } from "@tanstack/react-form";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

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
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { useUploadImage } from "#/core/api/use-upload-image";
import { cn } from "#/lib/utils";

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
	| "actif"
	| "imageUrl";

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
	image_url: "imageUrl",
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
	const uploadMutation = useUploadImage();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
			imageUrl: produit?.image_url ?? "",
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
					imageUrl: value.imageUrl || null,
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

			<form.Field name="imageUrl">
				{(field) => (
					<ImageUploadField
						label="Image du produit"
						imageKey={field.state.value}
						onImageKeyChange={field.handleChange}
						uploadMutation={uploadMutation}
						fileInputRef={fileInputRef}
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
							{isSubmitting ? "Enregistrement…" : "Enregistrer"}
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}

/** Composant pour uploader une image de produit */
function ImageUploadField({
	label,
	imageKey,
	onImageKeyChange,
	uploadMutation,
	fileInputRef,
}: {
	label: string;
	imageKey: string;
	onImageKeyChange: (key: string) => void;
	uploadMutation: ReturnType<typeof useUploadImage>;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(imageKey || undefined);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const result = await uploadMutation.mutateAsync(file);
			onImageKeyChange(result.key);
		} catch (error) {
			console.error("Erreur lors de l'upload :", error);
		}
	};

	const handleRemoveImage = () => {
		onImageKeyChange("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				disabled={uploadMutation.isPending}
				className="hidden"
			/>

			<div className="rounded-lg border border-border bg-card p-4">
				{isLoading ? (
					<div className="h-32 w-full flex items-center justify-center bg-muted rounded">
						<div className="text-xs text-muted-foreground">Chargement…</div>
					</div>
				) : blobUrl ? (
					<div className="space-y-3">
						<img
							src={blobUrl}
							alt="Aperçu du produit"
							className="h-32 w-full object-cover rounded"
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleRemoveImage}
							disabled={uploadMutation.isPending}
							className="w-full"
						>
							<X className="size-4 mr-2" aria-hidden />
							Supprimer l'image
						</Button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={uploadMutation.isPending}
						className={cn(
							"w-full h-32 rounded flex flex-col items-center justify-center gap-2",
							"border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50",
							"transition-colors cursor-pointer",
							uploadMutation.isPending && "opacity-50 cursor-not-allowed",
						)}
					>
						{uploadMutation.isPending ? (
							<Loader2
								className="size-6 text-muted-foreground animate-spin"
								aria-hidden
							/>
						) : (
							<>
								<Upload
									className="size-6 text-muted-foreground/50"
									aria-hidden
								/>
								<span className="text-xs text-muted-foreground text-center">
									Cliquez pour uploader une image
								</span>
							</>
						)}
					</button>
				)}
			</div>
		</div>
	);
}
