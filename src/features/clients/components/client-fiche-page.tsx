import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import {
	Image as ImageIcon,
	Loader2,
	Pencil,
	Phone,
	Plus,
	UserRound,
	X,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
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
import { downloadUploadedFile, uploadImage } from "#/core/api/uploads";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { useCan } from "#/core/auth";
import { formatDateISO } from "#/features/residence/models/format";

import {
	useClient,
	useCreerContact,
	useCreerPiece,
	useModifierPiece,
} from "../hooks/use-clients";
import type { PieceIdentite } from "../models/clients";
import {
	nomComplet,
	SEXE_LABELS,
	TYPE_CLIENT_LABELS,
	TYPE_PIECE_LABELS,
} from "../models/clients";
import { ClientFormDialog } from "./client-form-dialog";

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="space-y-1">
			<dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				{label}
			</dt>
			<dd className="text-sm text-foreground break-words">{valeur}</dd>
		</div>
	);
}

/** Avatar du client (catégorie MinIO `client-photo`) — silhouette par défaut. */
function PhotoClientAvatar({ cle, nom }: { cle: string | null; nom: string }) {
	const { blobUrl, isLoading } = useUploadBlobUrl(cle);

	return (
		<div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted sm:size-20">
			{isLoading ? (
				<Loader2
					className="size-5 animate-spin text-muted-foreground"
					aria-hidden
				/>
			) : blobUrl ? (
				<img src={blobUrl} alt={nom} className="size-full object-cover" />
			) : (
				<UserRound className="size-8 text-muted-foreground" aria-hidden />
			)}
		</div>
	);
}

/** Modale « Consulter les photos de la pièce d'identité » */
function PiecePhotosDialog({
	piece,
	onOpenChange,
}: {
	piece: PieceIdentite | null;
	onOpenChange: (open: boolean) => void;
}) {
	const [rectoUrl, setRectoUrl] = useState<string | null>(null);
	const [versoUrl, setVersoUrl] = useState<string | null>(null);
	const [loadingRecto, setLoadingRecto] = useState(false);
	const [loadingVerso, setLoadingVerso] = useState(false);

	useEffect(() => {
		if (!piece) return;

		const loadPhotos = async () => {
			if (piece.copie_num) {
				setLoadingRecto(true);
				try {
					const blob = await downloadUploadedFile(piece.copie_num);
					if (blob) {
						const url = URL.createObjectURL(blob);
						setRectoUrl(url);
					}
				} catch (error) {
					console.error("Erreur lors du chargement du recto", error);
				} finally {
					setLoadingRecto(false);
				}
			}

			if (piece.copie_num_verso) {
				setLoadingVerso(true);
				try {
					const blob = await downloadUploadedFile(piece.copie_num_verso);
					if (blob) {
						const url = URL.createObjectURL(blob);
						setVersoUrl(url);
					}
				} catch (error) {
					console.error("Erreur lors du chargement du verso", error);
				} finally {
					setLoadingVerso(false);
				}
			}
		};

		loadPhotos();

		return () => {
			if (rectoUrl) URL.revokeObjectURL(rectoUrl);
			if (versoUrl) URL.revokeObjectURL(versoUrl);
		};
	}, [piece]);

	if (!piece) return null;

	const hasNoPhotos = !piece.copie_num && !piece.copie_num_verso;

	return (
		<Dialog.Root open={piece !== null} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
					<div className="flex items-center justify-between mb-4">
						<div>
							<Dialog.Title className="text-lg font-semibold text-foreground">
								{TYPE_PIECE_LABELS[piece.type_piece] ?? piece.type_piece}
							</Dialog.Title>
							<Dialog.Description className="mt-1 text-sm text-muted-foreground">
								Numéro: {piece.numero}
							</Dialog.Description>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onOpenChange(false)}
						>
							<X className="size-4" aria-hidden />
							<span className="sr-only">Fermer</span>
						</Button>
					</div>

					{hasNoPhotos ? (
						<div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
							<ImageIcon
								className="mx-auto mb-2 size-8 text-muted-foreground"
								aria-hidden
							/>
							<p className="text-sm text-muted-foreground">
								Aucune photo n'a été enregistrée pour cette pièce.
							</p>
						</div>
					) : (
						<div className="grid gap-6 sm:grid-cols-2">
							{piece.copie_num && (
								<div className="space-y-2">
									<h3 className="text-sm font-medium text-foreground">Recto</h3>
									<div className="rounded-lg border border-border bg-muted overflow-hidden">
										{loadingRecto ? (
											<div className="flex h-64 items-center justify-center">
												<Loader2
													className="size-5 animate-spin text-muted-foreground"
													aria-hidden
												/>
											</div>
										) : rectoUrl ? (
											<img
												src={rectoUrl}
												alt="Recto"
												className="w-full h-auto max-h-96 object-contain"
											/>
										) : (
											<div className="flex h-64 items-center justify-center bg-muted">
												<p className="text-xs text-muted-foreground">
													Impossible de charger l'image
												</p>
											</div>
										)}
									</div>
								</div>
							)}

							{piece.copie_num_verso && (
								<div className="space-y-2">
									<h3 className="text-sm font-medium text-foreground">Verso</h3>
									<div className="rounded-lg border border-border bg-muted overflow-hidden">
										{loadingVerso ? (
											<div className="flex h-64 items-center justify-center">
												<Loader2
													className="size-5 animate-spin text-muted-foreground"
													aria-hidden
												/>
											</div>
										) : versoUrl ? (
											<img
												src={versoUrl}
												alt="Verso"
												className="w-full h-auto max-h-96 object-contain"
											/>
										) : (
											<div className="flex h-64 items-center justify-center bg-muted">
												<p className="text-xs text-muted-foreground">
													Impossible de charger l'image
												</p>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}

					<div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Fermer
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** Modale « Ajouter un contact d'urgence » (3.2). */
function ContactDialog({
	idClient,
	onOpenChange,
}: {
	idClient: string;
	onOpenChange: (open: boolean) => void;
}) {
	const creerMutation = useCreerContact();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			nom: "",
			prenom: "",
			lien: "",
			telPrincipal: "",
			telSecondaire: "",
			adresse: "",
			email: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.lien.trim()) fields.lien = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				await creerMutation.mutateAsync({
					idClient,
					nom: value.nom.trim(),
					lien: value.lien.trim(),
					telPrincipal: value.telPrincipal.trim(),
					prenom: value.prenom.trim() || null,
					telSecondaire: value.telSecondaire.trim() || null,
					adresse: value.adresse.trim() || null,
					email: value.email.trim() || null,
				});
				onOpenChange(false);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			}
		},
	});
	return (
		<Dialog.Root open onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter un contact d'urgence
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Personne à contacter en cas de besoin.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="nom">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Nom"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="prenom">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Prénom"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>
						<form.Field name="lien">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Lien avec le locataire"
									placeholder="ex : Frère, Conjoint…"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="telPrincipal">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Téléphone principal"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
							<form.Field name="telSecondaire">
								{(field) => (
									<InputField
										id={field.name}
										name={field.name}
										label="Deuxième numéro"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										error={field.state.meta.errors[0]}
									/>
								)}
							</form.Field>
						</div>
						<form.Field name="adresse">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Adresse"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<form.Field name="email">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Adresse e-mail"
									type="email"
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
						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={creerMutation.isPending}>
								{creerMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Enregistrer
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** Modale « Ajouter une pièce d'identité » (3.1). */
function PieceDialog({
	idClient,
	onOpenChange,
}: {
	idClient: string;
	onOpenChange: (open: boolean) => void;
}) {
	const creerMutation = useCreerPiece();
	const modifierMutation = useModifierPiece();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [fileRecto, setFileRecto] = useState<File | null>(null);
	const [fileVerso, setFileVerso] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);

	const form = useForm({
		defaultValues: {
			typePiece: "CNI",
			numero: "",
			dateDelivrance: "",
			dateExpiration: "",
			autoriteDelivrance: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.numero.trim()) fields.numero = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				setUploading(true);

				// 1. Créer la pièce
				const pieceResponse = await creerMutation.mutateAsync({
					idClient,
					typePiece: value.typePiece,
					numero: value.numero.trim(),
					dateDelivrance: value.dateDelivrance || null,
					dateExpiration: value.dateExpiration || null,
					autoriteDelivrance: value.autoriteDelivrance.trim() || null,
				});

				const idPiece = (pieceResponse as { id_piece: string }).id_piece;

				// 2. Upload les fichiers si présents et attacher les clés
				if (fileRecto || fileVerso) {
					const updates: {
						copieNum?: string | null;
						copieNumVerso?: string | null;
					} = {};

					if (fileRecto) {
						const keyRecto = await uploadImage(fileRecto, "piece-identite");
						updates.copieNum = keyRecto;
					}

					if (fileVerso) {
						const keyVerso = await uploadImage(fileVerso, "piece-identite");
						updates.copieNumVerso = keyVerso;
					}

					if (Object.keys(updates).length > 0) {
						await modifierMutation.mutateAsync({
							idClient,
							idPiece,
							...updates,
						});
					}
				}

				onOpenChange(false);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			} finally {
				setUploading(false);
			}
		},
	});

	const isPending =
		creerMutation.isPending || modifierMutation.isPending || uploading;

	return (
		<Dialog.Root open onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter une pièce d'identité
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Pièce fournie par le client.
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="typePiece">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Type de pièce</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Type de pièce"
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(TYPE_PIECE_LABELS).map(
												([valeur, libelle]) => (
													<SelectItem key={valeur} value={valeur}>
														{libelle}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>
						<form.Field name="numero">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Numéro de la pièce"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<Label htmlFor="fileRecto">Recto (photo)</Label>
								<div className="relative">
									<input
										id="fileRecto"
										type="file"
										accept="image/jpeg,image/png,image/webp,application/pdf"
										onChange={(e) => setFileRecto(e.target.files?.[0] ?? null)}
										disabled={isPending}
										className="absolute inset-0 cursor-pointer opacity-0"
									/>
									<div className="flex h-20 items-center justify-center rounded-md border border-dashed border-input bg-muted/30 text-center">
										{fileRecto ? (
											<div className="text-xs text-foreground">
												<ImageIcon
													className="mx-auto mb-1 size-4"
													aria-hidden
												/>
												{fileRecto.name.substring(0, 20)}
											</div>
										) : (
											<div className="text-xs text-muted-foreground">
												<ImageIcon
													className="mx-auto mb-1 size-4"
													aria-hidden
												/>
												Choisir une image
											</div>
										)}
									</div>
								</div>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="fileVerso">Verso (photo)</Label>
								<div className="relative">
									<input
										id="fileVerso"
										type="file"
										accept="image/jpeg,image/png,image/webp,application/pdf"
										onChange={(e) => setFileVerso(e.target.files?.[0] ?? null)}
										disabled={isPending}
										className="absolute inset-0 cursor-pointer opacity-0"
									/>
									<div className="flex h-20 items-center justify-center rounded-md border border-dashed border-input bg-muted/30 text-center">
										{fileVerso ? (
											<div className="text-xs text-foreground">
												<ImageIcon
													className="mx-auto mb-1 size-4"
													aria-hidden
												/>
												{fileVerso.name.substring(0, 20)}
											</div>
										) : (
											<div className="text-xs text-muted-foreground">
												<ImageIcon
													className="mx-auto mb-1 size-4"
													aria-hidden
												/>
												Choisir une image
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="dateDelivrance">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Délivrance</Label>
										<input
											id={field.name}
											name={field.name}
											type="date"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</div>
								)}
							</form.Field>
							<form.Field name="dateExpiration">
								{(field) => (
									<div className="space-y-1.5">
										<Label htmlFor={field.name}>Expiration</Label>
										<input
											id={field.name}
											name={field.name}
											type="date"
											value={field.state.value}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</div>
								)}
							</form.Field>
						</div>
						<form.Field name="autoriteDelivrance">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Autorité de délivrance"
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
						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Enregistrer
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

interface ClientFichePageProps {
	/** Id du client (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche client » (3.1/3.2) : informations personnelles, coordonnées,
 * pièces d'identité et contacts d'urgence.
 */
export function ClientFichePage({ id }: ClientFichePageProps) {
	const canModifier = useCan("CLIENT.MODIFIER");
	const clientQuery = useClient(id);
	const [formOuvert, setFormOuvert] = useState(false);
	const [contactOuvert, setContactOuvert] = useState(false);
	const [pieceOuverte, setPieceOuverte] = useState(false);
	const [pieceAConsulter, setPieceAConsulter] = useState<PieceIdentite | null>(
		null,
	);

	if (clientQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (clientQuery.isError || !clientQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Fiche client</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Client introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/client/clients">Retour à la liste des clients</Link>
					</Button>
				</div>
			</div>
		);
	}

	const client = clientQuery.data;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Locataires et clients", to: "/client/clients" },
					{ label: nomComplet(client) },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="flex items-center gap-4">
					<PhotoClientAvatar cle={client.photo} nom={nomComplet(client)} />
					<div className="space-y-1">
						<h1 className="text-2xl font-semibold text-foreground">
							Fiche client — {nomComplet(client)}
						</h1>
						<p className="text-muted-foreground">
							{TYPE_CLIENT_LABELS[client.type_client]} ·{" "}
							{client.profession ?? "profession non renseignée"}.
						</p>
					</div>
				</section>
				<div className="flex items-center gap-2">
					{canModifier ? (
						<Button variant="outline" onClick={() => setFormOuvert(true)}>
							<Pencil className="size-4" aria-hidden />
							Modifier
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<Link to="/client/clients">Retour</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
				<section className="space-y-3 rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
						<UserRound className="size-5 text-lagoon" aria-hidden />
						Informations personnelles
					</h2>
					<dl className="grid gap-3 sm:gap-4 sm:grid-cols-2">
						<Ligne label="Code client" valeur={client.code} />
						<Ligne label="Nom" valeur={client.nom} />
						<Ligne label="Prénom(s)" valeur={client.prenoms} />
						<Ligne
							label="Date de naissance"
							valeur={formatDateISO(client.date_naissance)}
						/>
						<Ligne
							label="Lieu de naissance"
							valeur={client.lieu_naissance ?? "—"}
						/>
						<Ligne
							label="Sexe"
							valeur={
								client.sexe ? (SEXE_LABELS[client.sexe] ?? client.sexe) : "—"
							}
						/>
						<Ligne label="Nationalité" valeur={client.nationalite ?? "—"} />
						<Ligne label="Profession" valeur={client.profession ?? "—"} />
						<Ligne
							label="Type de client"
							valeur={TYPE_CLIENT_LABELS[client.type_client]}
						/>
					</dl>
				</section>

				<section className="space-y-3 rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
						<Phone className="size-5 text-lagoon" aria-hidden />
						Coordonnées
					</h2>
					<dl className="grid gap-3 sm:gap-4 sm:grid-cols-2">
						<Ligne label="Téléphone principal" valeur={client.tel_principal} />
						<Ligne
							label="Téléphone secondaire"
							valeur={client.tel_secondaire ?? "—"}
						/>
						<Ligne label="Adresse e-mail" valeur={client.email ?? "—"} />
						<Ligne label="Ville" valeur={client.ville ?? "—"} />
						<Ligne label="Adresse" valeur={client.adresse ?? "—"} />
						<Ligne label="Pays" valeur={client.pays ?? "—"} />
					</dl>
				</section>
			</div>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-foreground">
						Pièces d'identité
					</h2>
					{canModifier ? (
						<Button size="sm" onClick={() => setPieceOuverte(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter une pièce
						</Button>
					) : null}
				</div>
				{client.pieces.length === 0 ? (
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucune pièce enregistrée.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										TYPE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										NUMÉRO
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										DÉLIVRANCE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										EXPIRATION
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										AUTORITÉ
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										PHOTOS
									</th>
								</tr>
							</thead>
							<tbody>
								{client.pieces.map((piece) => (
									<tr
										key={piece.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{TYPE_PIECE_LABELS[piece.type_piece] ?? piece.type_piece}
										</td>
										<td className="px-4 py-3 text-foreground">
											{piece.numero}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateISO(piece.date_delivrance)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateISO(piece.date_expiration)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{piece.autorite_delivrance ?? "—"}
										</td>
										<td className="px-4 py-3 text-center">
											{piece.copie_num || piece.copie_num_verso ? (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setPieceAConsulter(piece)}
													className="text-xs"
												>
													<ImageIcon className="size-4 mr-1" aria-hidden />
													Voir
												</Button>
											) : (
												<span className="text-xs text-muted-foreground">—</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-foreground">
						Contacts d'urgence
					</h2>
					{canModifier ? (
						<Button size="sm" onClick={() => setContactOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter un contact
						</Button>
					) : null}
				</div>
				{client.contacts.length === 0 ? (
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucun contact d'urgence enregistré.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										CONTACT
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										LIEN
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										TÉLÉPHONE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										E-MAIL
									</th>
								</tr>
							</thead>
							<tbody>
								{client.contacts.map((contact) => (
									<tr
										key={contact.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{[contact.prenom, contact.nom]
												.filter(Boolean)
												.join(" ") || contact.nom}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{contact.lien}
										</td>
										<td className="px-4 py-3 text-foreground">
											{contact.tel_principal}
											{contact.tel_secondaire
												? ` · ${contact.tel_secondaire}`
												: ""}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{contact.email ?? "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<ClientFormDialog
				open={formOuvert}
				client={client}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>

			{contactOuvert ? (
				<ContactDialog idClient={client.id} onOpenChange={setContactOuvert} />
			) : null}

			{pieceOuverte ? (
				<PieceDialog idClient={client.id} onOpenChange={setPieceOuverte} />
			) : null}

			{pieceAConsulter ? (
				<PiecePhotosDialog
					piece={pieceAConsulter}
					onOpenChange={(ouvert) => {
						if (!ouvert) setPieceAConsulter(null);
					}}
				/>
			) : null}
		</div>
	);
}
