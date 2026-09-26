import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";

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
import { toApiError } from "#/core/api";
import { useCataloguePressing } from "#/features/pressing/hooks/use-catalogue";
import { useCategoriesPlats } from "#/features/restaurant/hooks/use-plats";

import { useCreerOffre, useMajOffre } from "../hooks/use-offres";
import {
	ACTIVITE_LABELS,
	type ActiviteAbonnement,
	type Offre,
	UNITE_LABELS,
	type UniteAbonnement,
} from "../models/abonnements";

interface OffreFormDialogProps {
	open: boolean;
	/** Offre à modifier (mode édition — champs commerciaux seuls) ; null = création. */
	offre: Offre | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

interface ValeursForm {
	code: string;
	libelle: string;
	description: string;
	activite: ActiviteAbonnement;
	unite: UniteAbonnement;
	quota: string;
	prix: string;
	dureeJours: string;
	actif: boolean;
	idPrestation: string;
	idCategoriePlat: string;
	maxParJour: string;
}

/**
 * Modale « Offre d'abonnement » : création (avec couverture pilotée par
 * `activite` — prestation pressing **requise** vs catégorie/plafond
 * restaurant optionnels, mêmes combinaisons que le 400 serveur) et édition
 * limitée aux champs commerciaux (la couverture est immuable une fois
 * l'offre créée — `MajOffreDto` ne la porte pas).
 */
export function OffreFormDialog({
	open,
	offre,
	onOpenChange,
	onSaved,
}: OffreFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{offre ? "Modifier l'offre" : "Nouvelle offre"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{offre
							? `${offre.code} — seuls les champs commerciaux sont modifiables (la couverture est figée).`
							: "Quota prépayé vendu en une fois — pressing (prestation exacte) ou restauration (catégorie/plafond optionnels)."}
					</Dialog.Description>
					{open ? (
						<OffreForm
							key={offre?.id_offre ?? "nouvelle"}
							offre={offre}
							onOpenChange={onOpenChange}
							onSaved={onSaved}
						/>
					) : null}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

function OffreForm({
	offre,
	onOpenChange,
	onSaved,
}: Omit<OffreFormDialogProps, "open">) {
	const edition = offre !== null;
	const creerMutation = useCreerOffre();
	const majMutation = useMajOffre();
	const catalogueQuery = useCataloguePressing();
	const categoriesQuery = useCategoriesPlats();
	const prestationsActives = (catalogueQuery.data?.prestations ?? []).filter(
		(prestation) => prestation.actif,
	);

	const form = useForm({
		defaultValues: {
			code: offre?.code ?? "",
			libelle: offre?.libelle ?? "",
			description: offre?.description ?? "",
			activite: offre?.activite ?? ("PRESSING" as ActiviteAbonnement),
			unite: offre?.unite ?? ("KG" as UniteAbonnement),
			quota: offre?.quota ?? "",
			prix: offre?.prix ?? "",
			dureeJours: offre ? String(offre.duree_jours) : "30",
			actif: offre?.actif ?? true,
			idPrestation: offre?.id_prestation ?? "",
			idCategoriePlat: offre?.id_categorie_plat ?? "",
			maxParJour: offre?.max_par_jour ? String(offre.max_par_jour) : "",
		} satisfies ValeursForm,
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<keyof ValeursForm, string>> = {};
				if (!edition && !value.code.trim()) {
					fields.code = "Le code est requis.";
				}
				if (!value.libelle.trim()) fields.libelle = "Le libellé est requis.";
				if (!value.quota.trim() || Number(value.quota) <= 0) {
					fields.quota = "Quota positif requis.";
				} else if (
					value.unite !== "KG" &&
					!Number.isInteger(Number(value.quota))
				) {
					fields.quota = "Entier requis pour pièce(s)/repas.";
				}
				if (!value.prix.trim() || Number(value.prix) < 0) {
					fields.prix = "Prix positif requis.";
				}
				if (!value.dureeJours.trim() || Number(value.dureeJours) <= 0) {
					fields.dureeJours = "Durée en jours positive requise.";
				}
				if (!edition && value.activite === "PRESSING" && !value.idPrestation) {
					fields.idPrestation = "Sélectionnez la prestation couverte.";
				}
				if (
					!edition &&
					value.activite === "RESTAURATION" &&
					value.maxParJour.trim() &&
					(!Number.isInteger(Number(value.maxParJour)) ||
						Number(value.maxParJour) <= 0)
				) {
					fields.maxParJour = "Entier positif (ou vide = aucun plafond).";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			// `mutateAsync` rejette : ne pas relancer — `form.handleSubmit()` est
			// void-é (une rejection serait non gérée) ; l'erreur est lue depuis
			// `mutation.error` ci-dessous.
			try {
				if (edition) {
					await majMutation.mutateAsync({
						id: offre.id_offre,
						libelle: value.libelle,
						description: value.description,
						quota: value.quota,
						prix: value.prix,
						dureeJours: value.dureeJours,
						actif: value.actif,
					});
				} else {
					await creerMutation.mutateAsync({
						code: value.code,
						libelle: value.libelle,
						description: value.description,
						activite: value.activite,
						unite: value.unite,
						quota: value.quota,
						prix: value.prix,
						dureeJours: value.dureeJours,
						actif: value.actif,
						...(value.activite === "PRESSING"
							? { idPrestation: value.idPrestation }
							: {}),
						...(value.activite === "RESTAURATION"
							? {
									idCategoriePlat: value.idCategoriePlat,
									maxParJour: value.maxParJour,
								}
							: {}),
					});
				}
				onSaved();
			} catch {
				// Message lu depuis `mutation.error` (erreur serveur réelle).
			}
		},
	});
	const enCours = creerMutation.isPending || majMutation.isPending;
	const erreurServeur =
		creerMutation.error || majMutation.error
			? toApiError(creerMutation.error ?? majMutation.error).message
			: null;

	return (
		<form
			className="mt-4 space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<div className="grid gap-3 sm:grid-cols-2">
				<form.Field name="code">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Code *"
							placeholder="PRESS_LS_9KG"
							autoComplete="off"
							disabled={edition}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
				<form.Field name="dureeJours">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Durée de validité (jours) *"
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

			<form.Field name="libelle">
				{(field) => (
					<InputField
						id={field.name}
						name={field.name}
						label="Libellé *"
						placeholder="Lavage + séchage — 9 kg / mois"
						autoComplete="off"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(event) => field.handleChange(event.target.value)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.Field>

			{edition ? (
				<div className="space-y-1 rounded-md border border-border bg-accent/30 px-3 py-2 text-sm">
					<p className="text-muted-foreground">
						Couverture : {ACTIVITE_LABELS[offre.activite]} —{" "}
						{offre.activite === "PRESSING"
							? (offre.prestation_libelle ?? "prestation")
							: (offre.categorie_plat_libelle ?? "tout plat")}
						{offre.max_par_jour ? ` (max ${offre.max_par_jour}/jour)` : ""}
					</p>
					<p className="text-xs text-muted-foreground">
						La couverture est immuable (les souscriptions vendues gardent leur
						quota/prix).
					</p>
				</div>
			) : (
				<>
					<div className="grid gap-3 sm:grid-cols-2">
						<form.Field name="activite">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Activité *</Label>
									<Select
										value={field.state.value}
										onValueChange={(valeur) => {
											const activite = valeur as ActiviteAbonnement;
											field.handleChange(activite);
											// Réinitialise la couverture de l'autre activité —
											// envoyer les deux combinaisons serait un 400.
											form.setFieldValue(
												"unite",
												activite === "RESTAURATION" ? "REPAS" : "KG",
											);
											form.setFieldValue("idPrestation", "");
											form.setFieldValue("idCategoriePlat", "");
											form.setFieldValue("maxParJour", "");
										}}
									>
										<SelectTrigger id={field.name} className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(
												Object.keys(ACTIVITE_LABELS) as ActiviteAbonnement[]
											).map((valeur) => (
												<SelectItem key={valeur} value={valeur}>
													{ACTIVITE_LABELS[valeur]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name="unite">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Unité *</Label>
									<form.Subscribe selector={(state) => state.values.activite}>
										{(activite) => (
											<Select
												value={field.state.value}
												disabled={activite === "RESTAURATION"}
												onValueChange={(valeur) =>
													field.handleChange(valeur as UniteAbonnement)
												}
											>
												<SelectTrigger id={field.name} className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{(activite === "RESTAURATION"
														? (["REPAS"] as UniteAbonnement[])
														: (["KG", "PIECE"] as UniteAbonnement[])
													).map((valeur) => (
														<SelectItem key={valeur} value={valeur}>
															{UNITE_LABELS[valeur]}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}
									</form.Subscribe>
								</div>
							)}
						</form.Field>
					</div>

					<form.Subscribe selector={(state) => state.values.activite}>
						{(activite) =>
							activite === "PRESSING" ? (
								<form.Field name="idPrestation">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Prestation couverte *</Label>
											<Select
												value={field.state.value}
												onValueChange={field.handleChange}
											>
												<SelectTrigger id={field.name} className="w-full">
													<SelectValue placeholder="Sélectionner une prestation" />
												</SelectTrigger>
												<SelectContent>
													{prestationsActives.map((prestation) => (
														<SelectItem
															key={prestation.id_prestation}
															value={prestation.id_prestation}
														>
															{prestation.libelle}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<p className="text-xs text-muted-foreground">
												Correspondance exacte : seules les lignes de commande
												portant cette prestation sont couvertes.
											</p>
											{field.state.meta.errors[0] ? (
												<p role="alert" className="text-xs text-destructive">
													{field.state.meta.errors[0]}
												</p>
											) : null}
										</div>
									)}
								</form.Field>
							) : (
								<div className="grid gap-3 sm:grid-cols-2">
									<form.Field name="idCategoriePlat">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name}>
													Catégorie de plats (optionnel)
												</Label>
												<Select
													value={field.state.value || "toutes"}
													onValueChange={(valeur) =>
														field.handleChange(
															valeur === "toutes" ? "" : valeur,
														)
													}
												>
													<SelectTrigger id={field.name} className="w-full">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="toutes">
															Toutes les catégories
														</SelectItem>
														{(categoriesQuery.data ?? []).map((categorie) => (
															<SelectItem
																key={categorie.id}
																value={categorie.id}
															>
																{categorie.libelle}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<p className="text-xs text-muted-foreground">
													Vide = tout plat couvert.
												</p>
											</div>
										)}
									</form.Field>
									<form.Field name="maxParJour">
										{(field) => (
											<InputField
												id={field.name}
												name={field.name}
												label="Repas max / jour (optionnel)"
												inputMode="numeric"
												autoComplete="off"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
												error={field.state.meta.errors[0]}
											/>
										)}
									</form.Field>
								</div>
							)
						}
					</form.Subscribe>
				</>
			)}

			<div className="grid gap-3 sm:grid-cols-2">
				<form.Field name="quota">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Quota *"
							placeholder="9.000"
							inputMode="decimal"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							error={field.state.meta.errors[0]}
						/>
					)}
				</form.Field>
				<form.Field name="prix">
					{(field) => (
						<InputField
							id={field.name}
							name={field.name}
							label="Prix (FCFA) *"
							placeholder="5000"
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

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Description (optionnel)</Label>
						<Textarea
							id={field.name}
							value={field.state.value}
							onChange={(event) => field.handleChange(event.target.value)}
							rows={2}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="actif">
				{(field) => (
					<label className="flex items-center gap-2 text-sm text-foreground">
						<input
							type="checkbox"
							checked={field.state.value}
							onChange={(event) => field.handleChange(event.target.checked)}
						/>
						Offre active (vendable)
					</label>
				)}
			</form.Field>

			{erreurServeur ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{erreurServeur}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="ghost"
					disabled={enCours}
					onClick={() => onOpenChange(false)}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={enCours}>
					{enCours ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{enCours
						? "Enregistrement…"
						: edition
							? "Enregistrer"
							: "Créer l'offre"}
				</Button>
			</div>
		</form>
	);
}
