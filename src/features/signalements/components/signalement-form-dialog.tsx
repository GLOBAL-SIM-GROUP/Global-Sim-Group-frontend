import { useForm } from "@tanstack/react-form";
import { Loader2, Upload } from "lucide-react";
import { Dialog } from "radix-ui";
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
import { getErrorMessageForCode, isApiError, toApiError } from "#/core/api";
import type { SignalementType } from "#/core/api/signalements";
import { uploadImage } from "#/core/api/uploads";

import {
	useAjouterSignalementPhoto,
	useCreerSignalement,
} from "../hooks/use-signalements";
import {
	SIGNALEMENT_TYPE_LABELS,
	SIGNALEMENT_TYPES,
} from "../models/signalements";

interface SignalementFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Appelé avec l'id du signalement créé (navigation vers la fiche). */
	onCreated: (idSignalement: string) => void;
}

/**
 * Modale « Nouveau signalement » — même pattern que les autres formulaires
 * de création de l'app (`FactureFormDialog`, `ClientFormDialog`) : modale
 * plutôt que page dédiée.
 */
export function SignalementFormDialog({
	open,
	onOpenChange,
	onCreated,
}: SignalementFormDialogProps) {
	const creerMutation = useCreerSignalement();
	const ajouterPhotoMutation = useAjouterSignalementPhoto();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [fichiers, setFichiers] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const reinitialiser = () => {
		setFichiers([]);
		setGlobalError(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const form = useForm({
		defaultValues: {
			titre: "",
			description: "",
			typeSignalement: "GENERAL" as SignalementType | "GENERAL",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.titre.trim()) fields.titre = "Ce champ est requis.";
				if (!value.description.trim()) {
					fields.description = "Ce champ est requis.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				setIsUploading(fichiers.length > 0);
				const clesObjet = await Promise.all(
					fichiers.map((fichier) => uploadImage(fichier, "signalement-photo")),
				);
				setIsUploading(false);
				const signalement = await creerMutation.mutateAsync({
					titre: value.titre.trim(),
					description: value.description.trim(),
					type_signalement:
						value.typeSignalement === "GENERAL"
							? undefined
							: value.typeSignalement,
				});
				await Promise.all(
					clesObjet.map((cleObjet) =>
						ajouterPhotoMutation.mutateAsync({
							id: signalement.id,
							cleObjet,
						}),
					),
				);
				reinitialiser();
				form.reset();
				onCreated(signalement.id);
			} catch (error) {
				setIsUploading(false);
				if (!isApiError(error) && error instanceof Error) {
					setGlobalError(error.message);
				} else {
					setGlobalError(
						getErrorMessageForCode(toApiError(error).code) ??
							(toApiError(error).message || "Une erreur est survenue."),
					);
				}
			}
		},
	});

	const busy =
		isUploading || creerMutation.isPending || ajouterPhotoMutation.isPending;

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					form.reset();
					reinitialiser();
				}
				onOpenChange(next);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Nouveau signalement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Décrivez le problème ou le signalement.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="titre">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Titre"
									placeholder="Résumé du problème"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Description</Label>
									<textarea
										id={field.name}
										name={field.name}
										className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
										placeholder="Décrivez le problème en détail"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
									{field.state.meta.errors[0] ? (
										<p className="text-xs text-destructive">
											{field.state.meta.errors[0]}
										</p>
									) : null}
								</div>
							)}
						</form.Field>

						<form.Field name="typeSignalement">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>
										Module concerné (optionnel)
									</Label>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as SignalementType | "GENERAL")
										}
									>
										<SelectTrigger id={field.name} className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="GENERAL">Général</SelectItem>
											{SIGNALEMENT_TYPES.map((type) => (
												<SelectItem key={type} value={type}>
													{SIGNALEMENT_TYPE_LABELS[type]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<div className="space-y-1.5">
							<Label htmlFor="signalement-photos">Photos (optionnel)</Label>
							<input
								id="signalement-photos"
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								multiple
								disabled={busy}
								onChange={(event) =>
									setFichiers(Array.from(event.target.files ?? []))
								}
								className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-lagoon file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-lagoon/90"
							/>
							<p className="text-xs text-muted-foreground">
								JPG, PNG ou WebP — 5 Mo maximum par photo.
							</p>
							{fichiers.length > 0 ? (
								<p className="text-xs text-muted-foreground">
									{fichiers.length} photo{fichiers.length > 1 ? "s" : ""}
									sélectionnée{fichiers.length > 1 ? "s" : ""}.
								</p>
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
								disabled={busy}
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={busy}>
								{busy ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<Upload className="size-4" aria-hidden />
								)}
								{isUploading
									? "Envoi des photos…"
									: ajouterPhotoMutation.isPending
										? "Association des photos…"
										: creerMutation.isPending
											? "Création…"
											: "Créer le signalement"}
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
