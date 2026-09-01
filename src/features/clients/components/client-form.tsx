import { useForm } from "@tanstack/react-form";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
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
import { uploadImage } from "#/core/api/uploads";
import { useUploadBlobUrl } from "#/core/api/use-upload-blob";
import { cn } from "#/lib/utils";

import { listClients } from "../api/clients";
import {
	useCreerClient,
	useCreerContact,
	useCreerPiece,
	useModifierClient,
	useModifierPiece,
} from "../hooks/use-clients";
import type { Client, TypeClient, TypePiece } from "../models/clients";
import {
	nomComplet,
	TYPE_CLIENT_LABELS,
	TYPE_PIECE_LABELS,
} from "../models/clients";

const TYPES: TypeClient[] = ["AUTRE"];

interface PieceDraft {
	typePiece: TypePiece;
	numero: string;
	dateDelivrance: string;
	dateExpiration: string;
	fileRecto: File | null;
	fileVerso: File | null;
}

const PIECE_DRAFT_VIDE: PieceDraft = {
	typePiece: "CNI",
	numero: "",
	dateDelivrance: "",
	dateExpiration: "",
	fileRecto: null,
	fileVerso: null,
};

interface ContactDraft {
	nom: string;
	prenom: string;
	lien: string;
	telPrincipal: string;
	telSecondaire: string;
	adresse: string;
	email: string;
}

const CONTACT_DRAFT_VIDE: ContactDraft = {
	nom: "",
	prenom: "",
	lien: "",
	telPrincipal: "",
	telSecondaire: "",
	adresse: "",
	email: "",
};

/** Pièce « touchée » : au moins un champ saisi (numéro, dates, autorité, photo). */
function pieceEstRenseignee(piece: PieceDraft): boolean {
	return (
		piece.numero.trim() !== "" ||
		piece.dateDelivrance !== "" ||
		piece.dateExpiration !== "" ||
		piece.fileRecto !== null ||
		piece.fileVerso !== null
	);
}

/** Contact « touché » : au moins un champ saisi. */
function contactEstRenseigne(contact: ContactDraft): boolean {
	return (
		contact.nom.trim() !== "" ||
		contact.prenom.trim() !== "" ||
		contact.lien.trim() !== "" ||
		contact.telPrincipal.trim() !== "" ||
		contact.telSecondaire.trim() !== "" ||
		contact.adresse.trim() !== "" ||
		contact.email.trim() !== ""
	);
}

interface ClientFormProps {
	/** Client à modifier (mode édition) ; null = création. */
	client: Client | null;
	/**
	 * Type imposé à la création (« Ajouter un locataire » vs « Ajouter un
	 * client ») : le sélecteur de type est alors masqué, implicite au contexte
	 * d'origine. Ignoré en édition (le type reste modifiable comme avant).
	 */
	typeClientCree?: TypeClient;
	onCancel: () => void;
	/**
	 * Appelé après un enregistrement réussi avec l'id (et le nom complet) du
	 * client — création ou édition. La réponse du POST n'a pas de schéma
	 * garanti : si elle n'expose pas `id_client`, on relance une recherche par
	 * nom + prénoms et on prend le premier résultat (jamais d'id inventé).
	 */
	onSaved: (id?: string, label?: string) => void;
}

/**
 * Formulaire « Ajouter / Modifier un client » (3.1) : informations
 * personnelles, coordonnées et type de client. En création, le type est
 * imposé par le contexte d'origine (`typeClientCree`) plutôt que choisi dans
 * le formulaire, et deux sections optionnelles permettent d'ajouter dans la
 * foulée une pièce d'identité (avec photos recto/verso) et un contact
 * d'urgence — sous-ressources qui exigent un `id_client` existant, donc
 * enregistrées juste après la création du client, avant `onSaved`. En
 * édition, ces sous-ressources restent gérées depuis la fiche client (pas de
 * duplication ici). Dialog-agnostique : `ClientFormDialog` l'affiche en
 * modale, `ClientRechercheField` peut l'embarquer inline (création d'un
 * locataire depuis un autre formulaire, ex. contrat de location).
 */
export function ClientForm({
	client,
	typeClientCree,
	onCancel,
	onSaved,
}: ClientFormProps) {
	const createMutation = useCreerClient();
	const editMutation = useModifierClient();
	const creerPieceMutation = useCreerPiece();
	const modifierPieceMutation = useModifierPiece();
	const creerContactMutation = useCreerContact();
	const [globalError, setGlobalError] = useState<string | null>(null);

	const [photo, setPhoto] = useState(client?.photo ?? "");
	const [uploadingPhoto, setUploadingPhoto] = useState(false);

	const [piece, setPiece] = useState<PieceDraft>(PIECE_DRAFT_VIDE);
	const [pieceErreur, setPieceErreur] = useState<string | null>(null);
	const [contact, setContact] = useState<ContactDraft>(CONTACT_DRAFT_VIDE);
	const [contactErreurs, setContactErreurs] = useState<
		Partial<Record<keyof ContactDraft, string>>
	>({});
	const [enregistrementAnnexes, setEnregistrementAnnexes] = useState(false);

	/** Type imposé par le contexte d'origine : sélecteur masqué (implicite). */
	const typeVerrouille = !client && Boolean(typeClientCree);

	const form = useForm({
		defaultValues: {
			nom: client?.nom ?? "",
			prenoms: client?.prenoms ?? "",
			typeClient: client?.type_client ?? typeClientCree ?? "",
			dateNaissance: client?.date_naissance ?? "",
			lieuNaissance: client?.lieu_naissance ?? "",
			sexe: client?.sexe ?? "",
			nationalite: client?.nationalite ?? "",
			profession: client?.profession ?? "",
			telPrincipal: client?.tel_principal ?? "",
			telSecondaire: client?.tel_secondaire ?? "",
			email: client?.email ?? "",
			adresse: client?.adresse ?? "",
			ville: client?.ville ?? "",
			pays: client?.pays ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.prenoms.trim()) fields.prenoms = "Ce champ est requis.";
				if (!value.telPrincipal.trim())
					fields.telPrincipal = "Ce champ est requis.";
				if (!value.typeClient) fields.typeClient = "Sélectionnez un type.";
				if (!value.dateNaissance) fields.dateNaissance = "Ce champ est requis.";
				if (!value.lieuNaissance.trim())
					fields.lieuNaissance = "Ce champ est requis.";
				if (!value.sexe) fields.sexe = "Sélectionnez une option.";
				if (!value.nationalite.trim())
					fields.nationalite = "Ce champ est requis.";
				if (!value.profession.trim())
					fields.profession = "Ce champ est requis.";
				if (!value.email.trim()) fields.email = "Ce champ est requis.";
				if (!value.adresse.trim()) fields.adresse = "Ce champ est requis.";
				if (!value.ville.trim()) fields.ville = "Ce champ est requis.";
				if (!value.pays.trim()) fields.pays = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			setPieceErreur(null);
			setContactErreurs({});

			// Pièce/contact : sous-ressources optionnelles, uniquement à la
			// création (l'édition les gère depuis la fiche client). Un champ
			// rempli engage la validation minimale du reste de la section.
			let pieceValide = true;
			if (!client && pieceEstRenseignee(piece) && !piece.numero.trim()) {
				setPieceErreur("Le numéro de la pièce est requis.");
				pieceValide = false;
			}

			let contactValide = true;
			if (!client && contactEstRenseigne(contact)) {
				const erreurs: Partial<Record<keyof ContactDraft, string>> = {};
				if (!contact.nom.trim()) erreurs.nom = "Ce champ est requis.";
				if (!contact.lien.trim()) erreurs.lien = "Ce champ est requis.";
				if (!contact.telPrincipal.trim())
					erreurs.telPrincipal = "Ce champ est requis.";
				if (Object.keys(erreurs).length > 0) {
					setContactErreurs(erreurs);
					contactValide = false;
				}
			}

			if (!pieceValide || !contactValide) return;

			try {
				const corps = {
					nom: value.nom.trim(),
					prenoms: value.prenoms.trim(),
					telPrincipal: value.telPrincipal.trim(),
					typeClient: value.typeClient as TypeClient,
					dateNaissance: value.dateNaissance || null,
					lieuNaissance: value.lieuNaissance.trim() || null,
					sexe: value.sexe || null,
					nationalite: value.nationalite.trim() || null,
					profession: value.profession.trim() || null,
					telSecondaire: value.telSecondaire.trim() || null,
					email: value.email.trim() || null,
					adresse: value.adresse.trim() || null,
					ville: value.ville.trim() || null,
					pays: value.pays.trim() || null,
					photo: photo || null,
				};
				if (client) {
					await editMutation.mutateAsync({ id: client.id, ...corps });
					onSaved(client.id, `${corps.prenoms} ${corps.nom}`.trim());
					return;
				}

				const resultat = await createMutation.mutateAsync(corps);
				const idDirect = (resultat as { id_client?: string } | undefined)
					?.id_client;
				const label = `${corps.nom} ${corps.prenoms}`.trim();

				let idClientCree: string;
				let labelClientCree: string;
				if (idDirect) {
					idClientCree = idDirect;
					labelClientCree = label;
				} else {
					// Réponse sans id : re-recherche par nom + prénoms, premier résultat.
					const trouves = await listClients({ search: label });
					const premier = trouves[0];
					if (!premier) {
						setGlobalError(
							"Client créé mais introuvable — relancez la recherche.",
						);
						return;
					}
					idClientCree = premier.id;
					labelClientCree = nomComplet(premier);
				}

				try {
					setEnregistrementAnnexes(true);
					if (pieceEstRenseignee(piece)) {
						const pieceResponse = await creerPieceMutation.mutateAsync({
							idClient: idClientCree,
							typePiece: piece.typePiece,
							numero: piece.numero.trim(),
							dateDelivrance: piece.dateDelivrance || null,
							dateExpiration: piece.dateExpiration || null,
						});
						if (piece.fileRecto || piece.fileVerso) {
							const updates: {
								copieNum?: string | null;
								copieNumVerso?: string | null;
							} = {};
							if (piece.fileRecto) {
								updates.copieNum = await uploadImage(
									piece.fileRecto,
									"piece-identite",
								);
							}
							if (piece.fileVerso) {
								updates.copieNumVerso = await uploadImage(
									piece.fileVerso,
									"piece-identite",
								);
							}
							await modifierPieceMutation.mutateAsync({
								idClient: idClientCree,
								idPiece: pieceResponse.id_piece,
								...updates,
							});
						}
					}
					if (contactEstRenseigne(contact)) {
						await creerContactMutation.mutateAsync({
							idClient: idClientCree,
							nom: contact.nom.trim(),
							lien: contact.lien.trim(),
							telPrincipal: contact.telPrincipal.trim(),
							prenom: contact.prenom.trim() || null,
							telSecondaire: contact.telSecondaire.trim() || null,
							adresse: contact.adresse.trim() || null,
							email: contact.email.trim() || null,
						});
					}
				} catch (error) {
					// Le client est déjà créé : on ne bloque pas le flux, on prévient
					// juste que la pièce/le contact devra être ajouté depuis la fiche.
					setGlobalError(
						`Client créé, mais l'ajout de la pièce/du contact a échoué (${
							getErrorMessageForCode(toApiError(error).code) ??
							"erreur inconnue"
						}). Complétez le dossier depuis la fiche client.`,
					);
					onSaved(idClientCree, labelClientCree);
					return;
				} finally {
					setEnregistrementAnnexes(false);
				}

				onSaved(idClientCree, labelClientCree);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						"Une erreur est survenue.",
				);
			}
		},
	});

	const busy =
		createMutation.isPending ||
		editMutation.isPending ||
		enregistrementAnnexes ||
		uploadingPhoto;

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<ChampPhoto
				cle={photo}
				onChange={setPhoto}
				disabled={busy}
				onUploadingChange={setUploadingPhoto}
			/>

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
				<form.Field name="prenoms">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prénom(s)"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<div
				className={cn(
					"grid gap-4",
					typeVerrouille ? "grid-cols-1" : "grid-cols-2",
				)}
			>
				{!typeVerrouille ? (
					<form.Field name="typeClient">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Type de client</Label>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger
										id={field.name}
										aria-label="Type de client"
										className="w-full"
									>
										<SelectValue placeholder="Sélectionner" />
									</SelectTrigger>
									<SelectContent>
										{TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{TYPE_CLIENT_LABELS[type]}
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
				) : null}
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
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="dateNaissance">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Date de naissance</Label>
							<Input
								id={field.name}
								name={field.name}
								type="date"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							{field.state.meta.errors[0] ? (
								<p className="text-xs text-destructive">
									{field.state.meta.errors[0]}
								</p>
							) : null}
						</div>
					)}
				</form.Field>
				<form.Field name="lieuNaissance">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Lieu de naissance"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="sexe">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Sexe</Label>
							<Select
								value={field.state.value}
								onValueChange={field.handleChange}
							>
								<SelectTrigger
									id={field.name}
									aria-label="Sexe"
									className="w-full"
								>
									<SelectValue placeholder="—" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="M">Masculin</SelectItem>
									<SelectItem value="F">Féminin</SelectItem>
									<SelectItem value="AUTRE">Autre</SelectItem>
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
				<form.Field name="nationalite">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Nationalité"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="profession">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Profession / activité"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="telSecondaire">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Téléphone secondaire"
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
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="adresse">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Adresse habituelle"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
				<div className="grid grid-cols-2 gap-4">
					<form.Field name="ville">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Ville"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
					<form.Field name="pays">
						{(field) => (
							<InputField
								id={field.name}
								name={field.name}
								label="Pays"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								error={field.state.meta.errors[0]}
							/>
						)}
					</form.Field>
				</div>
			</div>

			{!client ? (
				<>
					<SectionPieceIdentite
						value={piece}
						onChange={(patch) => setPiece((prev) => ({ ...prev, ...patch }))}
						disabled={busy}
						erreurNumero={pieceErreur}
					/>

					<SectionContactUrgence
						value={contact}
						onChange={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
						disabled={busy}
						erreurs={contactErreurs}
					/>
				</>
			) : null}

			{globalError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{globalError}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="ghost"
					onClick={onCancel}
					disabled={busy}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={busy}>
					{busy ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					Enregistrer
				</Button>
			</div>
		</form>
	);
}

/**
 * Photo du client : upload immédiat au choix du fichier (catégorie MinIO
 * `client-photo`) — contrairement à la pièce d'identité, la photo fait
 * partie du `CreerClientDto`/`MajClientDto` (champ `photo`), pas d'une
 * sous-ressource ; elle est donc envoyée avec le reste du formulaire plutôt
 * qu'après coup. Disponible en création comme en édition.
 */
function ChampPhoto({
	cle,
	onChange,
	disabled,
	onUploadingChange,
}: {
	cle: string;
	onChange: (cle: string) => void;
	disabled: boolean;
	onUploadingChange: (uploading: boolean) => void;
}) {
	const { blobUrl, isLoading } = useUploadBlobUrl(cle || undefined);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		try {
			setIsUploading(true);
			onUploadingChange(true);
			const cleUploadee = await uploadImage(file, "client-photo");
			onChange(cleUploadee);
		} catch (error) {
			console.error("Erreur lors de l'upload de la photo :", error);
		} finally {
			setIsUploading(false);
			onUploadingChange(false);
		}
	};

	const desactive = disabled || isUploading;

	return (
		<div className="space-y-1.5">
			<Label htmlFor="client-photo">Photo (optionnel)</Label>
			<input
				id="client-photo"
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={(event) => void handleFileChange(event)}
				disabled={desactive}
				className="hidden"
			/>
			<div className="rounded-lg border border-border bg-card p-3">
				{isLoading || isUploading ? (
					<div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
						<Loader2
							className="size-5 animate-spin text-muted-foreground"
							aria-hidden
						/>
					</div>
				) : blobUrl ? (
					<div className="flex items-center gap-4">
						<img
							src={blobUrl}
							alt="Aperçu"
							className="size-24 rounded-full object-cover"
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onChange("")}
							disabled={desactive}
						>
							<X className="size-4" aria-hidden />
							Supprimer la photo
						</Button>
					</div>
				) : (
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={desactive}
						className={cn(
							"flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full",
							"border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50",
							"transition-colors cursor-pointer",
							desactive && "cursor-not-allowed opacity-50",
						)}
					>
						<Upload className="size-5 text-muted-foreground/50" aria-hidden />
						<span className="px-1 text-center text-[0.65rem] text-muted-foreground">
							Ajouter
						</span>
					</button>
				)}
			</div>
		</div>
	);
}

/** Zone de dépôt de fichier (recto/verso) — même gabarit que la fiche client. */
function ChampFichier({
	id,
	label,
	fichier,
	onChange,
	disabled,
}: {
	id: string;
	label: string;
	fichier: File | null;
	onChange: (file: File | null) => void;
	disabled: boolean;
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}</Label>
			<div className="relative">
				<input
					id={id}
					type="file"
					accept="image/jpeg,image/png,image/webp,application/pdf"
					onChange={(event) => onChange(event.target.files?.[0] ?? null)}
					disabled={disabled}
					className="absolute inset-0 cursor-pointer opacity-0"
				/>
				<div className="flex h-20 items-center justify-center rounded-md border border-dashed border-input bg-muted/30 text-center">
					{fichier ? (
						<div className="text-xs text-foreground">
							<ImageIcon className="mx-auto mb-1 size-4" aria-hidden />
							{fichier.name.substring(0, 20)}
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
	);
}

/**
 * Section optionnelle « Pièce d'identité » du formulaire de création : mêmes
 * champs que la modale dédiée de la fiche client (type, numéro, photos
 * recto/verso, dates, autorité), enregistrée juste après la création du
 * client puisqu'elle exige son id.
 */
function SectionPieceIdentite({
	value,
	onChange,
	disabled,
	erreurNumero,
}: {
	value: PieceDraft;
	onChange: (patch: Partial<PieceDraft>) => void;
	disabled: boolean;
	erreurNumero: string | null;
}) {
	return (
		<section className="space-y-4 rounded-lg border border-border p-4">
			<div className="space-y-1">
				<h3 className="text-sm font-semibold text-foreground">
					Pièce d'identité (optionnel)
				</h3>
				<p className="text-xs text-muted-foreground">
					Ajoutée au dossier dès la création du locataire.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label htmlFor="piece-type">Type de pièce</Label>
					<Select
						value={value.typePiece}
						onValueChange={(valeur) =>
							onChange({ typePiece: valeur as TypePiece })
						}
					>
						<SelectTrigger
							id="piece-type"
							aria-label="Type de pièce"
							className="w-full"
							disabled={disabled}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(TYPE_PIECE_LABELS).map(([valeur, libelle]) => (
								<SelectItem key={valeur} value={valeur}>
									{libelle}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<InputField
					id="piece-numero"
					label="Numéro de la pièce"
					value={value.numero}
					onChange={(event) => onChange({ numero: event.target.value })}
					disabled={disabled}
					error={erreurNumero ?? undefined}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<ChampFichier
					id="piece-recto"
					label="Recto (photo)"
					fichier={value.fileRecto}
					onChange={(file) => onChange({ fileRecto: file })}
					disabled={disabled}
				/>
				<ChampFichier
					id="piece-verso"
					label="Verso (photo)"
					fichier={value.fileVerso}
					onChange={(file) => onChange({ fileVerso: file })}
					disabled={disabled}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label htmlFor="piece-delivrance">Délivrance</Label>
					<Input
						id="piece-delivrance"
						type="date"
						value={value.dateDelivrance}
						onChange={(event) =>
							onChange({ dateDelivrance: event.target.value })
						}
						disabled={disabled}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="piece-expiration">Expiration</Label>
					<Input
						id="piece-expiration"
						type="date"
						value={value.dateExpiration}
						onChange={(event) =>
							onChange({ dateExpiration: event.target.value })
						}
						disabled={disabled}
					/>
				</div>
			</div>
		</section>
	);
}

/**
 * Section optionnelle « Contact d'urgence » du formulaire de création : mêmes
 * champs que la modale dédiée de la fiche client, enregistrée juste après la
 * création du client puisqu'elle exige son id.
 */
function SectionContactUrgence({
	value,
	onChange,
	disabled,
	erreurs,
}: {
	value: ContactDraft;
	onChange: (patch: Partial<ContactDraft>) => void;
	disabled: boolean;
	erreurs: Partial<Record<keyof ContactDraft, string>>;
}) {
	return (
		<section className="space-y-4 rounded-lg border border-border p-4">
			<div className="space-y-1">
				<h3 className="text-sm font-semibold text-foreground">
					Contact d'urgence (optionnel)
				</h3>
				<p className="text-xs text-muted-foreground">
					Personne à contacter en cas de besoin.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<InputField
					id="contact-nom"
					label="Nom du contact"
					value={value.nom}
					onChange={(event) => onChange({ nom: event.target.value })}
					disabled={disabled}
					error={erreurs.nom}
				/>
				<InputField
					id="contact-prenom"
					label="Prénom du contact"
					value={value.prenom}
					onChange={(event) => onChange({ prenom: event.target.value })}
					disabled={disabled}
				/>
			</div>

			<InputField
				id="contact-lien"
				label="Lien avec le locataire"
				placeholder="ex : Frère, Conjoint…"
				value={value.lien}
				onChange={(event) => onChange({ lien: event.target.value })}
				disabled={disabled}
				error={erreurs.lien}
			/>

			<div className="grid grid-cols-2 gap-4">
				<InputField
					id="contact-tel-principal"
					label="Téléphone du contact"
					value={value.telPrincipal}
					onChange={(event) => onChange({ telPrincipal: event.target.value })}
					disabled={disabled}
					error={erreurs.telPrincipal}
				/>
				<InputField
					id="contact-tel-secondaire"
					label="Deuxième numéro du contact"
					value={value.telSecondaire}
					onChange={(event) => onChange({ telSecondaire: event.target.value })}
					disabled={disabled}
				/>
			</div>

			<InputField
				id="contact-adresse"
				label="Adresse du contact"
				value={value.adresse}
				onChange={(event) => onChange({ adresse: event.target.value })}
				disabled={disabled}
			/>

			<InputField
				id="contact-email"
				label="E-mail du contact"
				type="email"
				value={value.email}
				onChange={(event) => onChange({ email: event.target.value })}
				disabled={disabled}
			/>
		</section>
	);
}
