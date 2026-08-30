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
import { Textarea } from "#/components/ui/textarea";
import { getErrorMessageForCode, isApiError, toApiError } from "#/core/api";
import { uploadImage } from "#/core/api/uploads";

import { useAjouterEtatDesLieux } from "../hooks/use-etat-des-lieux";
import {
	ETAT_DES_LIEUX_TYPE_LABELS,
	type EtatDesLieuxType,
} from "../models/etat-des-lieux";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

interface EtatDesLieuxFormDialogProps {
	open: boolean;
	idContrat: string;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Ajouter une photo » de l'onglet État des lieux. Deux étapes :
 * upload du fichier (POST /uploads, catégorie `etat-lieux`) puis liaison au
 * contrat (POST /contrats/{id}/etat-des-lieux) avec la clé obtenue.
 */
export function EtatDesLieuxFormDialog({
	open,
	idContrat,
	onOpenChange,
	onSaved,
}: EtatDesLieuxFormDialogProps) {
	const ajouterMutation = useAjouterEtatDesLieux();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [fichier, setFichier] = useState<File | null>(null);
	const [fichierErreur, setFichierErreur] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const reinitialiser = () => {
		setFichier(null);
		setFichierErreur(null);
		setGlobalError(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const form = useForm({
		defaultValues: {
			type: "ENTREE" as EtatDesLieuxType,
			piece: "",
			commentaire: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.type) fields.type = "Ce champ est requis.";
				if (value.piece.trim().length > 100) {
					fields.piece = "100 caractères maximum.";
				}
				if (value.commentaire.trim().length > 255) {
					fields.commentaire = "255 caractères maximum.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			setFichierErreur(null);
			if (!fichier) {
				setFichierErreur("Veuillez sélectionner un fichier.");
				return;
			}
			try {
				setIsUploading(true);
				const cleObjet = await uploadImage(fichier, "etat-lieux");
				setIsUploading(false);
				await ajouterMutation.mutateAsync({
					idContrat,
					type: value.type,
					piece: value.piece.trim() || null,
					cle_objet: cleObjet,
					commentaire: value.commentaire.trim() || null,
				});
				reinitialiser();
				form.reset();
				onSaved();
			} catch (error) {
				setIsUploading(false);
				if (!isApiError(error) && error instanceof Error) {
					// Erreur de validation cliente d'`uploadImage` (taille, format) :
					// message déjà en français, pas d'enveloppe ApiError à décoder.
					setGlobalError(error.message);
				} else {
					setGlobalError(
						getErrorMessageForCode(toApiError(error).code) ??
							"Une erreur est survenue.",
					);
				}
			}
		},
	});

	const busy = isUploading || ajouterMutation.isPending;

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(ouvert) => {
				if (!ouvert) reinitialiser();
				onOpenChange(ouvert);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter une photo
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						JPG, PNG, WebP ou PDF — 5 Mo maximum.
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<div className="space-y-1.5">
							<Label htmlFor="etat-des-lieux-fichier">Fichier</Label>
							<input
								id="etat-des-lieux-fichier"
								ref={fileInputRef}
								type="file"
								accept={ACCEPT}
								disabled={busy}
								onChange={(event) => {
									setFichier(event.target.files?.[0] ?? null);
									setFichierErreur(null);
								}}
								className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-lagoon file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-lagoon/90"
							/>
							{fichierErreur ? (
								<p className="text-xs text-destructive">{fichierErreur}</p>
							) : null}
						</div>

						<form.Field name="type">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Type</Label>
									<Select
										value={field.state.value}
										onValueChange={(v) =>
											field.handleChange(v as EtatDesLieuxType)
										}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Type d'état des lieux"
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(
												Object.entries(ETAT_DES_LIEUX_TYPE_LABELS) as [
													EtatDesLieuxType,
													string,
												][]
											).map(([valeur, libelle]) => (
												<SelectItem key={valeur} value={valeur}>
													{libelle}
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

						<form.Field name="piece">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Pièce (optionnel)"
									placeholder="ex : Chambre"
									autoComplete="off"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>

						<form.Field name="commentaire">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Commentaire (optionnel)</Label>
									<Textarea
										id={field.name}
										name={field.name}
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
									? "Envoi…"
									: ajouterMutation.isPending
										? "Enregistrement…"
										: "Ajouter"}
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
