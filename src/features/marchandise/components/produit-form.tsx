import { useForm } from "@tanstack/react-form";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { BoutonCamera } from "#/components/bouton-camera";
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
import { useCan } from "#/core/auth";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";
import { cn } from "#/lib/utils";

import {
	useCreerCategorieProduit,
	useCreerFournisseur,
	useCreerProduit,
	useModifierProduit,
} from "../hooks/use-produits";
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
	| "imageUrl"
	| "codeBarre";

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
	code_barre: "codeBarre",
};

interface ProduitFormProps {
	/** Produit à modifier (mode édition) ; null = création. */
	produit: Produit | null;
	categories: CategorieProduit[];
	fournisseurs: Fournisseur[];
	/**
	 * Code-barres à pré-remplir (création à la volée depuis un scan sans
	 * correspondance, cf. `vente-form.tsx`). Ignoré en édition (le code du
	 * produit existant prévaut).
	 */
	codeBarrePrefill?: string;
	onCancel: () => void;
	/**
	 * Appelé après enregistrement avec le produit résultant — en édition,
	 * c'est le produit passé en prop (la réponse du PATCH n'est pas typée) ;
	 * en création, c'est le produit réellement créé (id inclus), nécessaire
	 * pour l'ajouter immédiatement à un panier en cours.
	 */
	onSaved: (produit: Produit) => void;
}

/** Entrée de catalogue normalisée pour `ChampSelectOuCreer` (catégorie/fournisseur). */
interface EntreeCatalogue {
	id: string;
	libelle: string;
}

/**
 * Champ Catégorie/Fournisseur : Select des entrées existantes par défaut,
 * bascule explicite vers une saisie libre qui crée l'entrée au catalogue
 * (`onCreer`) puis sélectionne automatiquement celle qui vient d'être créée.
 * Contrairement à l'équivalent du catalogue Pressing (`ChampLibelleCatalogue`
 * dans pressing/commande-form.tsx), pas de réactivation : les catégories et
 * fournisseurs n'ont pas d'état actif/inactif dans les modèles front.
 */
function ChampSelectOuCreer({
	id,
	label,
	placeholder,
	valeur,
	entrees,
	peutCreer,
	onChange,
	onCreer,
}: {
	id: string;
	label: string;
	placeholder: string;
	valeur: string;
	entrees: EntreeCatalogue[];
	peutCreer: boolean;
	onChange: (id: string) => void;
	onCreer: (libelle: string) => Promise<{ id: string }>;
}) {
	const [libre, setLibre] = useState(false);
	const [saisie, setSaisie] = useState("");
	const [enCours, setEnCours] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	const recherche = saisie.trim();
	const existeDeja = entrees.some(
		(entree) =>
			entree.libelle.localeCompare(recherche, "fr", { sensitivity: "base" }) ===
			0,
	);

	const ajouter = () => {
		if (!recherche || existeDeja) return;
		setEnCours(true);
		setErreur(null);
		onCreer(recherche)
			.then((entree) => {
				onChange(entree.id);
				setLibre(false);
				setSaisie("");
			})
			.catch(() => setErreur("Échec de l'ajout au catalogue."))
			.finally(() => setEnCours(false));
	};

	if (libre) {
		return (
			<div className="space-y-2">
				<Label htmlFor={id}>{label}</Label>
				<InputField
					id={id}
					placeholder={placeholder}
					value={saisie}
					onChange={(event) => setSaisie(event.target.value)}
				/>
				<div className="flex flex-wrap gap-x-4">
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto px-0 text-xs"
						onClick={() => {
							setLibre(false);
							setSaisie("");
							setErreur(null);
						}}
					>
						Choisir dans la liste
					</Button>
					{recherche && !existeDeja && peutCreer ? (
						<Button
							type="button"
							variant="link"
							size="sm"
							className="h-auto px-0 text-xs"
							disabled={enCours}
							onClick={ajouter}
						>
							{enCours ? (
								<Loader2 className="size-3 animate-spin" aria-hidden />
							) : (
								<Plus className="size-3" aria-hidden />
							)}
							Ajouter « {recherche} »
						</Button>
					) : null}
				</div>
				{erreur ? (
					<p role="alert" className="text-xs text-destructive">
						{erreur}
					</p>
				) : null}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={valeur} onValueChange={onChange}>
				<SelectTrigger id={id} aria-label={label} className="w-full">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{entrees.map((entree) => (
						<SelectItem key={entree.id} value={entree.id}>
							{entree.libelle}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{peutCreer ? (
				<Button
					type="button"
					variant="link"
					size="sm"
					className="h-auto px-0 text-xs"
					onClick={() => setLibre(true)}
				>
					Saisir manuellement
				</Button>
			) : null}
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
	codeBarrePrefill,
	onCancel,
	onSaved,
}: ProduitFormProps) {
	const createMutation = useCreerProduit();
	const editMutation = useModifierProduit();
	const uploadMutation = useUploadImage();
	const creerCategorieMutation = useCreerCategorieProduit();
	const creerFournisseurMutation = useCreerFournisseur();
	const peutCreerCatalogue = useCan("MARCHANDISE.CREER");
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
			codeBarre: produit?.code_barre ?? codeBarrePrefill ?? "",
		},
		validators: {
			onSubmit: ({ value }) => {
				// `{ fields }` = erreurs champ par champ (cf. login.tsx).
				const fields: Partial<Record<ProduitField, string>> = {};
				// Obligatoire en édition (figée à la création, jamais vide sur un
				// produit existant) ; optionnelle en création — vide = le backend
				// génère une référence GSG-REF-xxx automatiquement (vérifié en
				// direct, absent du schéma généré).
				if (produit && !value.reference.trim()) {
					fields.reference = "Ce champ est requis.";
				}
				if (!value.nom.trim()) fields.nom = "Ce champ est requis.";
				if (!value.prixAchat.trim()) {
					fields.prixAchat = "Ce champ est requis.";
				} else {
					const erreur = validerMontant(value.prixAchat, "Le prix d'achat");
					if (erreur) fields.prixAchat = erreur;
				}
				if (!value.prixVente.trim()) {
					fields.prixVente = "Ce champ est requis.";
				} else {
					const erreur = validerMontant(value.prixVente, "Le prix de vente");
					if (erreur) fields.prixVente = erreur;
				}
				if (value.seuilAlerte.trim()) {
					const erreur = validerMontant(value.seuilAlerte, "Le seuil d'alerte");
					if (erreur) fields.seuilAlerte = erreur;
				}
				if (
					value.codeBarre.trim() &&
					!/^\d{6,32}$/.test(value.codeBarre.trim())
				) {
					// Contrainte backend exacte (vérifiée en direct) : uniquement des
					// chiffres, 6 à 32 caractères — jamais documentée dans le spec.
					fields.codeBarre =
						"Le code-barres doit contenir entre 6 et 32 chiffres.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const corps = {
					reference: value.reference.trim() || null,
					nom: value.nom.trim(),
					idCategorieProduit: value.idCategorieProduit || null,
					prixAchat: normaliserMontantPourBackend(value.prixAchat),
					prixVente: normaliserMontantPourBackend(value.prixVente),
					quantiteInitiale: value.stockInitial.trim() || null,
					seuilAlerte: value.seuilAlerte.trim()
						? normaliserMontantPourBackend(value.seuilAlerte)
						: null,
					idFournisseur: value.idFournisseur || null,
					actif: value.actif,
					imageUrl: value.imageUrl || null,
					codeBarre: value.codeBarre.trim() || null,
				};
				if (produit) {
					await editMutation.mutateAsync({ id: produit.id, ...corps });
					onSaved(produit);
				} else {
					const produitCree = await createMutation.mutateAsync(corps);
					onSaved(produitCree);
				}
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
							(toApiError(error).message || "Une erreur est survenue."),
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
							label={produit ? "Référence" : "Référence (optionnel)"}
							placeholder={
								produit
									? "ex : SUCRE-01"
									: "Laissez vide pour générer automatiquement (GSG-REF-xxx)"
							}
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
						<ChampSelectOuCreer
							id={field.name}
							label="Catégorie"
							placeholder="ex : Épicerie"
							valeur={field.state.value}
							entrees={categories}
							peutCreer={peutCreerCatalogue}
							onChange={field.handleChange}
							onCreer={(libelle) =>
								creerCategorieMutation.mutateAsync({ libelle })
							}
						/>
					)}
				</form.Field>

				<form.Field name="idFournisseur">
					{(field) => (
						<ChampSelectOuCreer
							id={field.name}
							label="Fournisseur"
							placeholder="ex : SODEXCO"
							valeur={field.state.value}
							entrees={fournisseurs.map((fournisseur) => ({
								id: fournisseur.id,
								libelle: fournisseur.nom,
							}))}
							peutCreer={peutCreerCatalogue}
							onChange={field.handleChange}
							onCreer={(nom) => creerFournisseurMutation.mutateAsync({ nom })}
						/>
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

				<form.Field name="codeBarre">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Code-barres (optionnel)"
							placeholder="Scannez le code imprimé sur l'emballage, ou saisissez-le"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							onKeyDown={(event) => {
								// Une douchette envoie `Entrée` après avoir tapé le code —
								// on l'empêche de soumettre le formulaire prématurément.
								if (event.key === "Enter") event.preventDefault();
							}}
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

	const handleFile = async (file: File) => {
		try {
			const result = await uploadMutation.mutateAsync(file);
			onImageKeyChange(result.key);
		} catch (error) {
			console.error("Erreur lors de l'upload :", error);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		void handleFile(file);
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
				{blobUrl ? null : (
					<div className="mt-3 flex justify-center">
						<BoutonCamera
							label="Prendre une photo"
							titre={label}
							description="Photographiez le produit dans le cadre."
							facingMode="environment"
							disabled={uploadMutation.isPending}
							onCapture={(file) => void handleFile(file)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
