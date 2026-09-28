import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { Flag, Loader2, MapPin, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { PageHeader } from "#/components/ui/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { getErrorMessageForCode, isApiError, toApiError } from "#/core/api";
import type { Signalement } from "#/core/api/signalements";
import { validerPhotosSignalement } from "#/features/signalements/models/signalements";

import {
	useCreerSignalementPortail,
	useUploaderPhotoSignalementPortail,
} from "../hooks/use-signalements";
import {
	MODULE_CIBLE_PORTAIL_LABELS,
	MODULES_CIBLE_PORTAIL,
	type ModuleCiblePortail,
} from "../models/signalements";

/** Valeur sentinelle du Select pour « signalement général » (non envoyée). */
const MODULE_GENERAL = "__general__";

type SignalementField = "titre" | "description";

const LABELS_CHAMPS: Record<SignalementField, string> = {
	titre: "Le sujet",
	description: "La description",
};

interface SignalementFormPageProps {
	/** Route fiche pour le lien de suivi affiché après envoi (sans `/$id`). */
	lienDetailBase: string;
	/** Route liste (« Mes demandes » / « Mes signalements »). */
	lienListe: string;
	/** Fil d'Ariane : libellé racine + destination. */
	breadcrumbAccueil: { label: string; to: string };
	/** Classes du conteneur (le portail résident ajoute `p-6`). */
	className?: string;
}

/**
 * « Signaler un problème » — formulaire portail (`POST /signalements/portail`,
 * backend 091, `PORTAIL.VOIR`). Volontairement plus simple que la version
 * staff : `titre` + `description` requis, `lieu` libre et `module_cible`
 * optionnels (absent = signalement général trié par le personnel), photos
 * envoyées après création via l'upload dédié. Partagé entre l'espace client
 * (`/espace-client/signalement`) et le portail résident
 * (`/residence/portail/signalements/nouveau`).
 */
export function SignalementFormPage({
	lienDetailBase,
	lienListe,
	breadcrumbAccueil,
	className = "w-full space-y-6 pt-6 pb-16",
}: SignalementFormPageProps) {
	const creerMutation = useCreerSignalementPortail();
	const uploaderPhotoMutation = useUploaderPhotoSignalementPortail();
	const [cree, setCree] = useState<Signalement | null>(null);
	const [erreurPhotos, setErreurPhotos] = useState<string | null>(null);
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [fichiers, setFichiers] = useState<File[]>([]);
	const [erreursSelection, setErreursSelection] = useState<string[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm({
		defaultValues: {
			titre: "",
			lieu: "",
			// `""` = pas de module choisi → `module_cible` omis (GENERAL serveur).
			// La sentinelle MODULE_GENERAL ne sert qu'à revenir à ce choix après
			// avoir sélectionné un module (Radix refuse les items value="").
			moduleCible: "" as ModuleCiblePortail | typeof MODULE_GENERAL | "",
			description: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<SignalementField, string>> = {};
				if (!value.titre.trim()) {
					fields.titre = `${LABELS_CHAMPS.titre} est requis.`;
				}
				if (!value.description.trim()) {
					fields.description = `${LABELS_CHAMPS.description} est requis.`;
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			setErreurPhotos(null);
			try {
				const signalement = await creerMutation.mutateAsync({
					titre: value.titre.trim(),
					description: value.description.trim(),
					...(value.lieu.trim() ? { lieu: value.lieu.trim() } : {}),
					...(value.moduleCible && value.moduleCible !== MODULE_GENERAL
						? { module_cible: value.moduleCible }
						: {}),
				});
				// Le signalement est créé même si une photo échoue ensuite —
				// distinguer les deux pour ne pas accuser un échec de déclaration.
				if (fichiers.length > 0) {
					const uploads = await Promise.allSettled(
						fichiers.map((fichier) =>
							uploaderPhotoMutation.mutateAsync({
								id: signalement.id,
								file: fichier,
							}),
						),
					);
					const echouees = uploads.filter(
						(u) => u.status === "rejected",
					).length;
					if (echouees > 0) {
						setErreurPhotos(
							`${echouees} photo${echouees > 1 ? "s" : ""} n'a pas pu être envoyée${echouees > 1 ? "s" : ""} — le signalement est bien enregistré.`,
						);
					}
				}
				setCree(signalement);
			} catch (error) {
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

	const busy = creerMutation.isPending || uploaderPhotoMutation.isPending;

	if (cree) {
		return (
			<div className={className}>
				<PageHeader
					breadcrumb={[
						breadcrumbAccueil,
						{ label: "Signalement", to: lienListe },
						{ label: "Envoyé" },
					]}
					title="Signalement envoyé"
					description="Votre signalement a bien été transmis à nos équipes."
				/>
				<div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
					{erreurPhotos ? (
						<p role="alert" className="text-sm text-destructive">
							{erreurPhotos}
						</p>
					) : null}
					<p className="text-sm text-muted-foreground">
						« {cree.titre} » est enregistré avec le statut « Ouvert ». Vous
						serez notifié à chaque étape de son traitement.
					</p>
					<div className="flex flex-wrap items-center gap-2">
						<Button asChild className="rounded-full">
							<Link
								to={`${lienDetailBase}/$id` as never}
								params={{ id: cree.id } as never}
							>
								Suivre mon signalement
							</Link>
						</Button>
						<Button variant="outline" asChild className="rounded-full">
							<Link to={lienListe as never}>Voir mes demandes</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			<PageHeader
				breadcrumb={[breadcrumbAccueil, { label: "Signaler un problème" }]}
				title="Signaler un problème"
				description="Décrivez le problème rencontré dans nos locaux ou services — nos équipes vous répondront pour le traiter."
			/>

			<form
				className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
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
							label="Sujet"
							placeholder="Fuite d'eau, climatiseur en panne, bruit…"
							icon={<Flag className="size-4" aria-hidden />}
							value={field.state.value}
							disabled={busy}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>

				<form.Field name="moduleCible">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Service concerné (optionnel)</Label>
							<Select
								value={field.state.value || undefined}
								onValueChange={(value) =>
									field.handleChange(
										value as ModuleCiblePortail | typeof MODULE_GENERAL,
									)
								}
								disabled={busy}
							>
								<SelectTrigger id={field.name} className="w-full">
									<SelectValue placeholder="Je ne sais pas / signalement général" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={MODULE_GENERAL}>
										Je ne sais pas / signalement général
									</SelectItem>
									{MODULES_CIBLE_PORTAIL.map((module) => (
										<SelectItem key={module} value={module}>
											{MODULE_CIBLE_PORTAIL_LABELS[module]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>

				<form.Field name="lieu">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Lieu (optionnel)"
							placeholder="Restaurant, chambre 12, hall…"
							icon={<MapPin className="size-4" aria-hidden />}
							value={field.state.value}
							disabled={busy}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Description</Label>
							<Textarea
								id={field.name}
								name={field.name}
								placeholder="Décrivez le problème et depuis quand vous l'avez remarqué…"
								value={field.state.value}
								disabled={busy}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
							{field.state.meta.errors[0] ? (
								<p className="text-sm text-destructive">
									{field.state.meta.errors[0]}
								</p>
							) : null}
						</div>
					)}
				</form.Field>

				<div className="space-y-2">
					<Label htmlFor="signalement-photos">Photos (optionnel)</Label>
					<input
						id="signalement-photos"
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						disabled={busy}
						onChange={(event) => {
							// Filtre taille/MIME à la sélection : sans ça, un fichier
							// refusé par le backend partirait quand même — après la
							// création du signalement.
							const { acceptes, erreurs } = validerPhotosSignalement(
								Array.from(event.target.files ?? []),
							);
							setFichiers(acceptes);
							setErreursSelection(erreurs);
						}}
						className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-lagoon file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-lagoon/90"
					/>
					<p className="text-xs text-muted-foreground">
						JPG, PNG ou WebP — 5 Mo maximum par photo.
					</p>
					{fichiers.length > 0 ? (
						<p className="text-xs text-muted-foreground">
							{fichiers.length} photo{fichiers.length > 1 ? "s" : ""}{" "}
							sélectionnée{fichiers.length > 1 ? "s" : ""}.
						</p>
					) : null}
					{erreursSelection.length > 0 ? (
						<div role="alert" className="space-y-0.5">
							{erreursSelection.map((erreur) => (
								<p key={erreur} className="text-xs text-destructive">
									{erreur}
								</p>
							))}
						</div>
					) : null}
				</div>

				{globalError ? (
					<p role="alert" className="text-sm font-medium text-destructive">
						{globalError}
					</p>
				) : null}

				<Button type="submit" disabled={busy} className="w-full rounded-full">
					{busy ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Upload className="size-4" aria-hidden />
					)}
					{creerMutation.isPending
						? "Envoi…"
						: uploaderPhotoMutation.isPending
							? "Envoi des photos…"
							: "Envoyer mon signalement"}
				</Button>
			</form>
		</div>
	);
}
