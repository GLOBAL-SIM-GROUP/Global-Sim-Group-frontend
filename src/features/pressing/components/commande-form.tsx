import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

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
import { toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ApercuAbonnementPanel } from "#/features/abonnement/components/apercu-panel";
import { useApercuDebounced } from "#/features/abonnement/hooks/use-apercu";
import { CODE_EXCEDENT } from "#/features/abonnement/models/abonnements";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { formatMontantFCFA } from "#/features/residence/models/format";
import {
	apercuAbonnementCommande,
	type LigneCommandeBody,
} from "../api/commandes";
import {
	useCataloguePressing,
	useCreerPrestation,
	useCreerTypeVetement,
	useMajPrestation,
	useMajTypeVetement,
} from "../hooks/use-catalogue";
import {
	useCreerCommande,
	useModifierCommande,
	useTarifKg,
} from "../hooks/use-commandes";
import {
	apercuTotalLignePoids,
	type CommandePressing,
	type LigneCommandePressing,
	MODE_TARIFICATION_LABELS,
	type ModeTarificationPressing,
	validerLignePressing,
} from "../models/commandes";

interface CommandeFormProps {
	/** Commande à modifier (mode édition) ; null = dépôt. */
	commande: CommandePressing | null;
	/** Lignes actuelles (mode édition). */
	lignesInitiales?: LigneCommandePressing[];
	onCancel: () => void;
	onSaved: () => void;
}

interface LigneSaisie {
	/** Clé stable (index insuffisant : lignes ajoutées/retirées). */
	cle: number;
	typeVetement: string;
	/** Champ en saisie manuelle (sinon : choix dans le catalogue). */
	typeLibre: boolean;
	quantite: string;
	prestation: string;
	/** Champ en saisie manuelle (sinon : choix dans le catalogue). */
	prestationLibre: boolean;
	tarif: string;
	poidsKg: string;
}

const ligneVide = (cle: number): LigneSaisie => ({
	cle,
	typeVetement: "",
	typeLibre: false,
	quantite: "1",
	prestation: "",
	prestationLibre: false,
	tarif: "",
	poidsKg: "",
});

/** Entrée de catalogue normalisée pour `ChampLibelleCatalogue`. */
interface EntreeCatalogue {
	id: string;
	libelle: string;
	actif: boolean;
}

/**
 * Champ de libellé adossé au catalogue pressing : Select des entrées
 * actives par défaut, bascule explicite « Saisir manuellement » /
 * « Choisir dans le catalogue » pour le texte libre. Avec
 * `PRESSING.GERER_CATALOGUE`, un libellé inconnu peut être ajouté au
 * catalogue (ou réactivé s'il existe mais est inactif) sans quitter le
 * formulaire ; le champ est alors aligné sur le libellé canonique. Une
 * valeur héritée absente du catalogue (commande d'avant le référentiel)
 * est injectée comme option pour ne pas la perdre à l'édition.
 */
function ChampLibelleCatalogue({
	ariaLabel,
	placeholder,
	valeur,
	libre,
	entrees,
	peutGerer,
	onPatch,
	onCreer,
	onReactiver,
}: {
	ariaLabel: string;
	placeholder: string;
	valeur: string;
	libre: boolean;
	entrees: EntreeCatalogue[];
	peutGerer: boolean;
	onPatch: (patch: { valeur?: string; libre?: boolean }) => void;
	onCreer: (libelle: string) => Promise<unknown>;
	onReactiver: (id: string) => Promise<unknown>;
}) {
	const [enCours, setEnCours] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	const actives = entrees.filter((entree) => entree.actif);
	const connues = new Set(actives.map((entree) => entree.libelle));
	const recherche = valeur.trim();
	// Comparaison insensible à la casse pour éviter de créer un doublon
	// (« chemise » vs « Chemise ») — l'appartenance stricte envoyée au
	// backend reste décidée au submit sur le libellé exact.
	const memeLibelle = (libelle: string) =>
		libelle.localeCompare(recherche, "fr", { sensitivity: "base" }) === 0;
	const existeActive = actives.some((entree) => memeLibelle(entree.libelle));
	const entreeInactive = entrees.find(
		(entree) => !entree.actif && memeLibelle(entree.libelle),
	);

	const action: { label: string; executer: () => Promise<void> } | null =
		peutGerer && recherche.length > 0 && !existeActive
			? entreeInactive
				? {
						label: `Réactiver « ${entreeInactive.libelle} »`,
						executer: async () => {
							await onReactiver(entreeInactive.id);
							// Aligner sur le libellé canonique du catalogue.
							onPatch({ valeur: entreeInactive.libelle });
						},
					}
				: {
						label: `Ajouter « ${recherche} » au catalogue`,
						executer: async () => {
							await onCreer(recherche);
							// Écarter les espaces de saisie du libellé canonique.
							onPatch({ valeur: recherche });
						},
					}
			: null;

	const executerAction = (courante: NonNullable<typeof action>) => {
		setEnCours(true);
		setErreur(null);
		courante
			.executer()
			.catch(() => setErreur("Échec de l'enregistrement au catalogue."))
			.finally(() => setEnCours(false));
	};

	// Catalogue vide : rien à choisir → champ libre sans bascule.
	const saisieLibre = libre || actives.length === 0;

	return (
		<div className="space-y-1.5">
			{saisieLibre ? (
				<InputField
					aria-label={ariaLabel}
					placeholder={placeholder}
					value={valeur}
					onChange={(event) => {
						setErreur(null);
						onPatch({ valeur: event.target.value });
					}}
				/>
			) : (
				<Select
					value={valeur}
					onValueChange={(choix) => onPatch({ valeur: choix })}
				>
					<SelectTrigger aria-label={ariaLabel} className="w-full">
						<SelectValue placeholder={ariaLabel} />
					</SelectTrigger>
					<SelectContent>
						{actives.map((entree) => (
							<SelectItem key={entree.id} value={entree.libelle}>
								{entree.libelle}
							</SelectItem>
						))}
						{valeur && !connues.has(valeur) ? (
							<SelectItem value={valeur}>{valeur}</SelectItem>
						) : null}
					</SelectContent>
				</Select>
			)}
			<div className="flex flex-wrap gap-x-4">
				{actives.length > 0 ? (
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto px-0 text-xs"
						onClick={() => onPatch({ libre: !saisieLibre })}
					>
						{saisieLibre ? "Choisir dans le catalogue" : "Saisir manuellement"}
					</Button>
				) : null}
				{action ? (
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto px-0 text-xs"
						disabled={enCours}
						onClick={() => executerAction(action)}
					>
						{enCours ? (
							<Loader2 className="size-3 animate-spin" aria-hidden />
						) : (
							<Plus className="size-3" aria-hidden />
						)}
						{action.label}
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

/**
 * Formulaire « Dépôt — Pressing » (M4) : recherche client, mode de
 * tarification (à la pièce ou au kilo — choisi une seule fois, verrouillé en
 * édition), articles (adaptés au mode) et date de retrait prévue. Total
 * calculé automatiquement (aperçu client pour les lignes au kilo — le total
 * réel reste toujours calculé par le backend). En édition : articles + date
 * de retrait (client et mode conservés).
 */
export function CommandeForm({
	commande,
	lignesInitiales,
	onCancel,
	onSaved,
}: CommandeFormProps) {
	const createMutation = useCreerCommande();
	const editMutation = useModifierCommande();
	const canGererTarifs = useCan("PRESSING.GERER_TARIFS");
	const peutGererCatalogue = useCan("PRESSING.GERER_CATALOGUE");
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [idClient, setIdClient] = useState(commande?.id_client ?? "");
	// Verrouillé en édition (le backend refuse de changer le mode d'une
	// commande existante) ; par défaut à la pièce en création.
	const [mode, setMode] = useState<ModeTarificationPressing>(
		commande?.mode_tarification ?? "UNITAIRE",
	);
	const tarifKgQuery = useTarifKg(mode === "POIDS");
	const catalogueQuery = useCataloguePressing();
	const creerTypeMutation = useCreerTypeVetement();
	const majTypeMutation = useMajTypeVetement();
	const creerPrestationMutation = useCreerPrestation();
	const majPrestationMutation = useMajPrestation();

	// `cle` dérivée de l'index de construction (pas de `ligne.id`, qui n'est
	// pas forcément numérique) : garantit des clés 0..n-1 uniques quel que
	// soit le contenu de `lignesInitiales`.
	const lignesInitialesEffectives: LigneSaisie[] =
		lignesInitiales && lignesInitiales.length > 0
			? lignesInitiales.map((ligne, index) => ({
					cle: index,
					typeVetement: ligne.type_vetement,
					typeLibre: false,
					quantite: String(ligne.quantite),
					prestation: ligne.prestation,
					prestationLibre: false,
					tarif: ligne.tarif ?? "",
					poidsKg: ligne.poids_kg ?? "",
				}))
			: [ligneVide(0)];
	const [lignes, setLignes] = useState<LigneSaisie[]>(
		lignesInitialesEffectives,
	);
	// Dérivée de la liste effectivement posée en état (jamais de `lignesInitiales`
	// directement) : évite qu'un tableau initial vide (ex. lignes pas encore
	// chargées) ne fasse démarrer `prochaineCle` à 0 et entre en collision avec
	// la ligne par défaut, elle aussi `cle: 0`.
	const [prochaineCle, setProchaineCle] = useState(
		lignesInitialesEffectives.length,
	);
	const [dateRetrait, setDateRetrait] = useState(
		commande?.date_retrait_prevue ?? "",
	);
	// Abonnements : `ignorerAbonnement` force le plein tarif ;
	// `excedentConfirme` est armé par le 409 `ABONNEMENT_EXCEDENT` (le staff a
	// vu le message du serveur, le resubmit part avec `accepter_excedent`).
	const [ignorerAbonnement, setIgnorerAbonnement] = useState(false);
	const [excedentConfirme, setExcedentConfirme] = useState(false);

	const ajouterLigne = () => {
		setLignes((current) => [...current, ligneVide(prochaineCle)]);
		setProchaineCle((valeur) => valeur + 1);
	};
	const majLigne = (cle: number, patch: Partial<LigneSaisie>) =>
		setLignes((current) =>
			current.map((ligne) =>
				ligne.cle === cle ? { ...ligne, ...patch } : ligne,
			),
		);
	const retirerLigne = (cle: number) =>
		setLignes((current) => current.filter((ligne) => ligne.cle !== cle));

	// Changer de mode (création seulement) réinitialise les champs propres à
	// l'autre mode — évite d'envoyer un `tarif`/`poids_kg` résiduel de l'ancien
	// mode, que le backend rejetterait (mutuelle exclusivité).
	const changerMode = (nouveauMode: ModeTarificationPressing) => {
		setMode(nouveauMode);
		setLignes((current) =>
			current.map((ligne) => ({
				...ligne,
				tarif: "",
				poidsKg: "",
				quantite: "1",
			})),
		);
	};

	const total = useMemo(() => {
		if (mode === "UNITAIRE") {
			return lignes.reduce(
				(somme, ligne) =>
					somme + (Number(ligne.tarif) || 0) * (Number(ligne.quantite) || 0),
				0,
			);
		}
		return lignes.reduce((somme, ligne) => {
			const apercu = apercuTotalLignePoids(
				ligne.poidsKg,
				tarifKgQuery.data?.prix_kg,
			);
			return somme + (apercu ?? 0);
		}, 0);
	}, [lignes, mode, tarifKgQuery.data]);

	const aucunTarifKgConfigure =
		mode === "POIDS" && !tarifKgQuery.isLoading && tarifKgQuery.data === null;

	// Référentiel des libellés : les entrées actives alimentent les
	// suggestions (datalist) ; les inactives servent à proposer une
	// réactivation. Toute saisie hors liste part `hors_catalogue`.
	const typesVetementEntrees = useMemo<EntreeCatalogue[]>(
		() =>
			(catalogueQuery.data?.typesVetement ?? []).map((type) => ({
				id: type.id_type_vetement,
				libelle: type.libelle,
				actif: type.actif,
			})),
		[catalogueQuery.data],
	);
	const prestationsEntrees = useMemo<EntreeCatalogue[]>(
		() =>
			(catalogueQuery.data?.prestations ?? []).map((prestation) => ({
				id: prestation.id_prestation,
				libelle: prestation.libelle,
				actif: prestation.actif,
			})),
		[catalogueQuery.data],
	);
	const typesConnus = useMemo(
		() =>
			new Set(
				typesVetementEntrees
					.filter((entree) => entree.actif)
					.map((entree) => entree.libelle),
			),
		[typesVetementEntrees],
	);
	const prestationsConnues = useMemo(
		() =>
			new Set(
				prestationsEntrees
					.filter((entree) => entree.actif)
					.map((entree) => entree.libelle),
			),
		[prestationsEntrees],
	);

	// Corps des lignes partagé entre la prévisualisation d'abonnement et le
	// submit — même normalisation pour que l'aperçu reflète exactement ce qui
	// partira au backend.
	const lignesCorps = useMemo<LigneCommandeBody[]>(
		() =>
			lignes.map((ligne) => ({
				typeVetement: ligne.typeVetement.trim(),
				quantite: ligne.quantite.trim(),
				prestation: ligne.prestation.trim(),
				// « Catalogue » seulement si les DEUX libellés sont dans le
				// référentiel actif — le backend vérifie l'appartenance quand
				// `hors_catalogue` est faux.
				horsCatalogue:
					!typesConnus.has(ligne.typeVetement.trim()) ||
					!prestationsConnues.has(ligne.prestation.trim()),
				...(mode === "UNITAIRE"
					? { tarif: ligne.tarif.trim() }
					: { poidsKg: ligne.poidsKg.trim() }),
			})),
		[lignes, mode, typesConnus, prestationsConnues],
	);

	// Aperçu appelé uniquement sur des lignes complètes (mêmes exigences que
	// `validerLignePressing` — sinon le backend rejetterait la simulation).
	const lignesCompletes = lignesCorps.every(
		(ligne) =>
			ligne.typeVetement !== "" &&
			ligne.prestation !== "" &&
			Number(ligne.quantite) > 0 &&
			(mode === "UNITAIRE"
				? Number(ligne.tarif) > 0
				: Number(ligne.poidsKg) > 0),
	);
	const apercuRequest =
		idClient && lignesCompletes && !ignorerAbonnement
			? {
					idClient,
					modeTarification: mode,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
				}
			: null;
	const apercu = useApercuDebounced(apercuAbonnementCommande, apercuRequest);

	const valider = (): string | null => {
		if (!commande && !idClient) return "Sélectionnez un client.";
		if (lignes.length === 0) return "Ajoutez au moins un article.";
		if (aucunTarifKgConfigure) {
			return "Aucun tarif au kilo n'est configuré — impossible de créer une commande au kilo.";
		}
		for (const ligne of lignes) {
			const erreur = validerLignePressing(
				{
					typeVetement: ligne.typeVetement,
					quantite: ligne.quantite,
					prestation: ligne.prestation,
					tarif: mode === "UNITAIRE" ? ligne.tarif : undefined,
					poidsKg: mode === "POIDS" ? ligne.poidsKg : undefined,
				},
				mode,
			);
			if (erreur) return erreur;
		}
		if (!dateRetrait.trim()) return "Saisissez la date de retrait prévue.";
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		const flagsAbonnement = {
			utiliserAbonnement: !ignorerAbonnement,
			// L'aperçu affiché « dépassement » vaut confirmation par le staff
			// (il a vu le panneau avant de cliquer) ; le 409 reçu à la soumission
			// précédente arme aussi `excedentConfirme`.
			accepterExcedent: excedentConfirme || apercu.data?.excedent === true,
		};
		try {
			if (commande) {
				await editMutation.mutateAsync({
					id: commande.id,
					idClient,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
					...flagsAbonnement,
				});
			} else {
				await createMutation.mutateAsync({
					idClient,
					modeTarification: mode,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
					...flagsAbonnement,
				});
			}
			onSaved();
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 409 && apiError.code === CODE_EXCEDENT) {
				// « Refuser puis confirmer » : le message du serveur est affiché
				// tel quel ; le prochain submit partira avec accepter_excedent.
				setExcedentConfirme(true);
				setGlobalError(apiError.message || "Dépassement de quota abonnement.");
			} else {
				setGlobalError("Une erreur est survenue lors de l'enregistrement.");
			}
		}
	};

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void soumettre();
			}}
		>
			{!commande ? (
				<ClientRechercheField
					value={idClient}
					onChange={(id) => setIdClient(id)}
				/>
			) : null}

			<div className="space-y-2">
				<Label>Tarification</Label>
				{commande ? (
					<p className="text-sm text-foreground">
						{MODE_TARIFICATION_LABELS[mode]}
						<span className="ml-2 text-xs text-muted-foreground">
							(fixée à la création, non modifiable)
						</span>
					</p>
				) : (
					<div className="flex gap-4">
						{(
							Object.keys(
								MODE_TARIFICATION_LABELS,
							) as ModeTarificationPressing[]
						).map((valeur) => (
							<label
								key={valeur}
								className="flex items-center gap-2 text-sm text-foreground"
							>
								<input
									type="radio"
									name="mode-tarification"
									checked={mode === valeur}
									onChange={() => changerMode(valeur)}
								/>
								{MODE_TARIFICATION_LABELS[valeur]}
							</label>
						))}
					</div>
				)}
				{aucunTarifKgConfigure ? (
					<div
						role="alert"
						className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
					>
						<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
						<span>
							Aucun tarif au kilo n'est encore configuré.
							{canGererTarifs
								? " Définissez-en un dans « Tarif au kilo » avant de continuer."
								: " Demandez à un responsable pressing d'en définir un."}
						</span>
					</div>
				) : null}
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>Articles</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={ajouterLigne}
					>
						<Plus className="size-4" aria-hidden />
						Ajouter un article
					</Button>
				</div>

				{lignes.map((ligne) => (
					<div
						key={ligne.cle}
						className="space-y-3 rounded-md border border-border p-3"
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<ChampLibelleCatalogue
								ariaLabel="Type de vêtement"
								placeholder="Type de vêtement (ex : Chemise)"
								valeur={ligne.typeVetement}
								libre={ligne.typeLibre}
								entrees={typesVetementEntrees}
								peutGerer={peutGererCatalogue}
								onPatch={(patch) =>
									majLigne(ligne.cle, {
										...(patch.valeur !== undefined
											? { typeVetement: patch.valeur }
											: {}),
										...(patch.libre !== undefined
											? { typeLibre: patch.libre }
											: {}),
									})
								}
								onCreer={(libelle) => creerTypeMutation.mutateAsync(libelle)}
								onReactiver={(id) =>
									majTypeMutation.mutateAsync({ id, actif: true })
								}
							/>
							<ChampLibelleCatalogue
								ariaLabel="Prestation"
								placeholder="Prestation (ex : Repassage)"
								valeur={ligne.prestation}
								libre={ligne.prestationLibre}
								entrees={prestationsEntrees}
								peutGerer={peutGererCatalogue}
								onPatch={(patch) =>
									majLigne(ligne.cle, {
										...(patch.valeur !== undefined
											? { prestation: patch.valeur }
											: {}),
										...(patch.libre !== undefined
											? { prestationLibre: patch.libre }
											: {}),
									})
								}
								onCreer={(libelle) =>
									creerPrestationMutation.mutateAsync(libelle)
								}
								onReactiver={(id) =>
									majPrestationMutation.mutateAsync({ id, actif: true })
								}
							/>
							{mode === "UNITAIRE" ? (
								<>
									<InputField
										aria-label="Quantité"
										type="number"
										min="1"
										value={ligne.quantite}
										onChange={(event) =>
											majLigne(ligne.cle, { quantite: event.target.value })
										}
									/>
									<InputField
										aria-label="Tarif"
										placeholder="Tarif (FCFA)"
										inputMode="numeric"
										value={ligne.tarif}
										onChange={(event) =>
											majLigne(ligne.cle, { tarif: event.target.value })
										}
									/>
								</>
							) : (
								<InputField
									aria-label="Poids (kg)"
									placeholder="Poids (kg, ex : 4.500)"
									inputMode="decimal"
									value={ligne.poidsKg}
									onChange={(event) =>
										majLigne(ligne.cle, { poidsKg: event.target.value })
									}
								/>
							)}
						</div>
						{mode === "POIDS" && tarifKgQuery.data ? (
							<p className="text-xs text-muted-foreground">
								Aperçu :{" "}
								{formatMontantFCFA(
									String(
										apercuTotalLignePoids(
											ligne.poidsKg,
											tarifKgQuery.data.prix_kg,
										) ?? 0,
									),
								)}{" "}
								({formatMontantFCFA(tarifKgQuery.data.prix_kg)}/kg)
							</p>
						) : null}
						<div className="flex justify-end">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={lignes.length === 1}
								onClick={() => retirerLigne(ligne.cle)}
							>
								<Trash2 className="size-4 text-destructive" aria-hidden />
								Retirer
							</Button>
						</div>
					</div>
				))}
			</div>

			<div>
				<Label htmlFor="commande-retrait">Date de retrait prévue</Label>
				<input
					id="commande-retrait"
					className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
					type="date"
					value={dateRetrait}
					onChange={(event) => setDateRetrait(event.target.value)}
				/>
			</div>

			<div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3 text-sm">
				<span className="text-muted-foreground">
					Total {mode === "POIDS" ? "(aperçu)" : ""} :{" "}
					{formatMontantFCFA(String(total))}
				</span>
				{apercu.data && !ignorerAbonnement ? (
					<span className="font-semibold text-foreground">
						À payer : {formatMontantFCFA(apercu.data.total_du)}
					</span>
				) : null}
			</div>

			{idClient ? (
				<>
					<ApercuAbonnementPanel
						apercu={apercu.data}
						pending={apercu.pending}
						error={apercu.error}
						visible={!ignorerAbonnement}
					/>
					{apercu.data && apercu.data.abonnements.length > 0 ? (
						<label className="flex items-center gap-2 text-sm text-muted-foreground">
							<input
								type="checkbox"
								checked={ignorerAbonnement}
								onChange={(event) => setIgnorerAbonnement(event.target.checked)}
							/>
							Ne pas utiliser l'abonnement — facturer plein tarif
						</label>
					) : null}
				</>
			) : null}

			{excedentConfirme ? (
				<p
					role="alert"
					className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
				>
					Excédent confirmé — cliquez à nouveau pour enregistrer la commande en
					facturant le dépassement au client.
				</p>
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
					disabled={createMutation.isPending || editMutation.isPending}
					onClick={onCancel}
				>
					Annuler
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending || editMutation.isPending}
				>
					{createMutation.isPending || editMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{createMutation.isPending || editMutation.isPending
						? "Enregistrement…"
						: "Enregistrer"}
				</Button>
			</div>
		</form>
	);
}
