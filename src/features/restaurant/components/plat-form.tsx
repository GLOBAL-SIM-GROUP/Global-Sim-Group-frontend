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
import { getErrorMessageForCode, toApiError } from "#/core/api";

import { uploadImage } from "#/core/api/uploads";

import { useCreerPlat, useModifierPlat } from "../hooks/use-plats";
import type { CategoriePlat, Plat } from "../models/plats";

interface PlatFormProps {
	plat: Plat | null;
	categories: CategoriePlat[];
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

/** Formulaire « Ajouter / Modifier un plat » (M5) : nom, catégorie, prix, dispo, description. */
export function PlatForm({
	plat,
	categories,
	onCancel,
	onSaved,
}: PlatFormProps) {
	const createMutation = useCreerPlat();
	const editMutation = useModifierPlat();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(plat?.image_url ?? null);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = async (file: File | null) => {
		if (!file) {
			setImagePreview(null);
			setUploadedFile(null);
			return;
		}

		// Limite à 5 MB
		if (file.size > 5 * 1024 * 1024) {
			setGlobalError("L'image ne doit pas dépasser 5 Mo.");
			return;
		}

		// Crée un preview local sans envoyer la Data URL au backend
		const reader = new FileReader();
		reader.onload = (e) => {
			const dataUrl = e.target?.result as string;
			setImagePreview(dataUrl);
		};
		reader.readAsDataURL(file);
		setUploadedFile(file);
	};

	const form = useForm({
		defaultValues: {
			nom: plat?.nom ?? "",
			id_categorie_plat: plat?.id_categorie_plat ?? "",
			prix: plat?.prix ?? "",
			disponible: plat?.disponible ?? true,
			description: plat?.description ?? "",
			image_url: plat?.image_url ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.prix.trim()) {
					fields.prix = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.prix.trim())) {
					fields.prix = "Le prix doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				// Si une image a été uploadée, l'envoyer à MinIO
				let image_url = value.image_url.trim() || null;
				if (uploadedFile) {
					try {
						image_url = await uploadImage(uploadedFile, "plat-photo");
					} catch (uploadError) {
						setGlobalError(
							uploadError instanceof Error
								? uploadError.message
								: "Erreur lors de l'upload de l'image.",
						);
						return;
					}
				}

				const corps = {
					nom: value.nom.trim(),
					id_categorie_plat: value.id_categorie_plat || null,
					prix: value.prix.trim(),
					disponible: value.disponible,
					description: value.description.trim() || null,
					image_url,
				};
				if (plat) {
					await editMutation.mutateAsync({ id: plat.id, ...corps });
				} else {
					await createMutation.mutateAsync(corps);
				}
				onSaved();
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
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
			<form.Field name="nom">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Nom"
						placeholder="ex : Attiéké poisson"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="id_categorie_plat">
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

				<form.Field name="prix">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prix (FCFA)"
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

			<div className="space-y-3">
				<div>
					<Label htmlFor="imageUpload">Image du plat (optionnelle)</Label>
					<p className="text-xs text-muted-foreground mb-2">
						JPG, PNG ou WebP — max 5 Mo
					</p>
					<div className="flex items-center gap-3">
						<input
							id="imageUpload"
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
							className="hidden"
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
						>
							<Upload className="size-4 mr-2" aria-hidden />
							Choisir une image
						</Button>
						{imagePreview && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => {
									setImagePreview(null);
									form.setFieldValue("image_url", "");
									if (fileInputRef.current) {
										fileInputRef.current.value = "";
									}
								}}
							>
								<X className="size-4" aria-hidden />
								<span className="sr-only">Supprimer</span>
							</Button>
						)}
					</div>
				</div>

				{imagePreview && (
					<div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
						<img
							src={imagePreview}
							alt="Aperçu de l'image"
							className="h-auto w-full max-h-48 object-cover"
						/>
					</div>
				)}
			</div>

			<form.Field name="description">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Description (optionnelle)"
						placeholder="ex : Servi avec riz et sauce"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<form.Field name="disponible">
				{(field) => (
					<div className="flex items-center gap-3">
						<Label htmlFor={field.name}>Disponible</Label>
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
