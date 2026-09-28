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
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
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
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
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

		// URLs créées pendant l'effet — le cleanup les révoque toutes (les
		// states ne sont pas lisibles ici : ils seraient capturés avant le fetch).
		const createdUrls: string[] = [];

		const loadPhotos = async () => {
			if (piece.copie_num) {
				setLoadingRecto(true);
				try {
					const blob = await downloadUploadedFile(piece.copie_num);
					if (blob) {
						const url = URL.createObjectURL(blob);
						createdUrls.push(url);
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
						createdUrls.push(url);
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
			for (const url of createdUrls) URL.revokeObjectURL(url);
		};
	}, [piece]);

	if (!piece) return null;

	const hasNoPhotos = !piece.copie_num && !piece.copie_num_verso;

	return (
		<Dialog open={piece !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-4">
					<div>
						<DialogTitle>
							{TYPE_PIECE_LABELS[piece.type_piece] ?? piece.type_piece}
						</DialogTitle>
						<DialogDescription>Numéro: {piece.numero}</DialogDescription>
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
			</DialogContent>
		</Dialog>
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
						(toApiError(error).message || "Une erreur est survenue."),
				);
			}
		},
	});
	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Ajouter un contact d'urgence</DialogTitle>
				<DialogDescription>
					Personne à contacter en cas de besoin.
				</DialogDescription>
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
			</DialogContent>
		</Dialog>
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
						(toApiError(error).message || "Une erreur est survenue."),
				);
			} finally {
				setUploading(false);
			}
		},
	});

	const isPending =
		creerMutation.isPending || modifierMutation.isPending || uploading;

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
				<DialogTitle>Ajouter une pièce d'identité</DialogTitle>
				<DialogDescription>Pièce fournie par le client.</DialogDescription>
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
											<ImageIcon className="mx-auto mb-1 size-4" aria-hidden />
											{fileRecto.name.substring(0, 20)}
										</div>
									) : (
										<div className="text-xs text-muted-foreground">
											<ImageIcon className="mx-auto mb-1 size-4" aria-hidden />
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
											<ImageIcon className="mx-auto mb-1 size-4" aria-hidden />
											{fileVerso.name.substring(0, 20)}
										</div>
									) : (
										<div className="text-xs text-muted-foreground">
											<ImageIcon className="mx-auto mb-1 size-4" aria-hidden />
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
										onChange={(event) => field.handleChange(event.target.value)}
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
										onChange={(event) => field.handleChange(event.target.value)}
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
									/>
								</div>
							)}
						</form.Field>
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
			</DialogContent>
		</Dialog>
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
	const canVoirResidence = useCan("RESIDENCE.VOIR");
	const clientQuery = useClient(id);
	const [formOuvert, setFormOuvert] = useState(false);
	const [contactOuvert, setContactOuvert] = useState(false);
	const [pieceOuverte, setPieceOuverte] = useState(false);
	const [pieceAConsulter, setPieceAConsulter] = useState<PieceIdentite | null>(
		null,
	);

	if (clientQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (clientQuery.isError || !clientQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Locataires et clients", to: "/client/clients" },
					{ label: nomComplet(client) },
				]}
				title={
					<span className="inline-flex items-center gap-4">
						<PhotoClientAvatar cle={client.photo} nom={nomComplet(client)} />
						Fiche client — {nomComplet(client)}
					</span>
				}
				description={`${TYPE_CLIENT_LABELS[client.type_client]} · ${client.profession ?? "profession non renseignée"}.`}
				actions={
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
				}
			/>

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

				{canVoirResidence ? (
					<section className="space-y-3 rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
						<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
							<Phone className="size-5 text-lagoon" aria-hidden />
							Coordonnées
						</h2>
						<dl className="grid gap-3 sm:gap-4 sm:grid-cols-2">
							<Ligne
								label="Téléphone principal"
								valeur={client.tel_principal}
							/>
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
				) : null}
			</div>

			{canVoirResidence ? (
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
						<EmptyState title="Aucune pièce enregistrée." />
					) : (
						<div className="overflow-x-auto">
							<DataTable>
								<DataTableHead>
									<tr>
										<Th>TYPE</Th>
										<Th>NUMÉRO</Th>
										<Th>DÉLIVRANCE</Th>
										<Th>EXPIRATION</Th>
										<Th>AUTORITÉ</Th>
										<Th>PHOTOS</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{client.pieces.map((piece) => (
										<Tr key={piece.id}>
											<Td className="font-medium text-foreground">
												{TYPE_PIECE_LABELS[piece.type_piece] ??
													piece.type_piece}
											</Td>
											<Td className="text-foreground">{piece.numero}</Td>
											<Td className="text-muted-foreground">
												{formatDateISO(piece.date_delivrance)}
											</Td>
											<Td className="text-muted-foreground">
												{formatDateISO(piece.date_expiration)}
											</Td>
											<Td className="text-muted-foreground">
												{piece.autorite_delivrance ?? "—"}
											</Td>
											<Td className="text-center">
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
													<span className="text-xs text-muted-foreground">
														—
													</span>
												)}
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>
						</div>
					)}
				</section>
			) : null}

			{canVoirResidence ? (
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
						<EmptyState title="Aucun contact d'urgence enregistré." />
					) : (
						<div className="overflow-x-auto">
							<DataTable>
								<DataTableHead>
									<tr>
										<Th>CONTACT</Th>
										<Th>LIEN</Th>
										<Th>TÉLÉPHONE</Th>
										<Th>E-MAIL</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{client.contacts.map((contact) => (
										<Tr key={contact.id}>
											<Td className="font-medium text-foreground">
												{[contact.prenom, contact.nom]
													.filter(Boolean)
													.join(" ") || contact.nom}
											</Td>
											<Td className="text-muted-foreground">{contact.lien}</Td>
											<Td className="text-foreground">
												{contact.tel_principal}
												{contact.tel_secondaire
													? ` · ${contact.tel_secondaire}`
													: ""}
											</Td>
											<Td className="text-muted-foreground">
												{contact.email ?? "—"}
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>
						</div>
					)}
				</section>
			) : null}

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
