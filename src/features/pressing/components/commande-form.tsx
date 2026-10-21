import { AlertTriangle, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { messageErreurPaiement, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ApercuAbonnementPanel } from "#/features/abonnement/components/apercu-panel";
import { useApercuDebounced } from "#/features/abonnement/hooks/use-apercu";
import { useExcedentConfirmation } from "#/features/abonnement/hooks/use-excedent-confirmation";
import { CaissePicker } from "#/features/finances/components/caisse-picker";
import { useCaissesAccessibles } from "#/features/finances/hooks/use-caisses-accessibles";
import {
	erreurCaisseRequise,
	idCaisseAEnvoyer,
} from "#/features/finances/models/caisses";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
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
	type CompositionVetement,
	composerDescription,
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

/** Entrée « type × nombre » de la composition du dépôt (→ `description`). */
interface CompositionSaisie extends CompositionVetement {
	cle: number;
}

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

	// Tri alphabétique français des options du dropdown (ordre serveur
	// arbitraire) — `filter` copie déjà, `sort` ne mute pas `entrees`.
	const actives = entrees
		.filter((entree) => entree.actif)
		.sort((a, b) =>
			a.libelle.localeCompare(b.libelle, "fr", { sensitivity: "base" }),
		);
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
 * édition), articles (adaptés au mode), date de retrait prévue et acompte
 * éventuel encaissé au dépôt. Total calculé automatiquement (aperçu client
 * pour les lignes au kilo — le total réel reste toujours calculé par le
 * backend). En édition : articles + date de retrait (client, mode et
 * acompte conservés).
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
	// `ignorerAbonnement` force le plein tarif ; le protocole de confirmation
	// du dépassement de quota (409 `ABONNEMENT_EXCEDENT`) est partagé avec les
	// 3 autres formulaires pressing/restaurant concernés par la couverture
	// abonnement, voir `useExcedentConfirmation`.
	const [ignorerAbonnement, setIgnorerAbonnement] = useState(false);
	const excedent = useExcedentConfirmation();

	// Acompte encaissé au dépôt (création uniquement — l'édition ne touche
	// pas aux paiements, le solde se règle au retrait).
	const [acompte, setAcompte] = useState("");
	const [idMoyen, setIdMoyen] = useState("");
	const moyensQuery = useMoyensPaiement();
	const moyens = moyensQuery.data ?? [];
	const idMoyenEffectif = idMoyen || (moyens[0]?.id ?? "");

	// Caisse de destination de l'acompte (sélection responsable quand le
	// backend expose plusieurs caisses accessibles ; forcée sinon).
	const caissesQuery = useCaissesAccessibles();
	const [idCaisse, setIdCaisse] = useState("");

	// Contenu du dépôt (types de vêtement × nombre) composant la
	// `description` imprimée sur le reçu — tant que le texte n'est pas
	// retouché à la main (`descriptionManuelle`), il suit les entrées ;
	// en édition, la description existante est préservée telle quelle.
	const [compositions, setCompositions] = useState<CompositionSaisie[]>([]);
	const [prochaineCleCompo, setProchaineCleCompo] = useState(0);
	const [description, setDescription] = useState(commande?.description ?? "");
	const [descriptionManuelle, setDescriptionManuelle] = useState(
		(commande?.description ?? "").trim() !== "",
	);
	const descriptionComposee = composerDescription(compositions);
	useEffect(() => {
		if (!descriptionManuelle) setDescription(descriptionComposee);
	}, [descriptionComposee, descriptionManuelle]);

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

	const majComposition = (cle: number, patch: Partial<CompositionSaisie>) =>
		setCompositions((current) =>
			current.map((compo) =>
				compo.cle === cle ? { ...compo, ...patch } : compo,
			),
		);
	const retirerComposition = (cle: number) =>
		setCompositions((current) => current.filter((compo) => compo.cle !== cle));
	// Chips catalogue (pattern équipements du formulaire logement) : un clic
	// ajoute le type à la composition, les compteurs −/+ ajustent le nombre,
	// retomber à 0 retire l'entrée. Les types hors catalogue se saisissent
	// directement dans la description (texte libre).
	const nombreDeType = (libelle: string) =>
		compositions.find((compo) => compo.typeVetement === libelle);
	const incrementerType = (libelle: string) => {
		const existante = nombreDeType(libelle);
		if (existante) {
			majComposition(existante.cle, {
				nombre: String(Number(existante.nombre) + 1),
			});
		} else {
			setCompositions((current) => [
				...current,
				{ cle: prochaineCleCompo, typeVetement: libelle, nombre: "1" },
			]);
			setProchaineCleCompo((valeur) => valeur + 1);
		}
	};
	const decrementerType = (cle: number) => {
		const compo = compositions.find((entree) => entree.cle === cle);
		if (!compo) return;
		const nombre = Number(compo.nombre);
		if (nombre <= 1) {
			retirerComposition(cle);
		} else {
			majComposition(cle, { nombre: String(nombre - 1) });
		}
	};

	// Changer de mode (création seulement) réinitialise les champs propres à
	// l'autre mode — évite d'envoyer un `tarif`/`poids_kg` résiduel de l'ancien
	// mode, que le backend rejetterait (mutuelle exclusivité). La tarification
	// au kilo est une rubrique unique : les lignes en trop sont retirées.
	const changerMode = (nouveauMode: ModeTarificationPressing) => {
		setMode(nouveauMode);
		setLignes((current) =>
			current
				.map((ligne) => ({
					...ligne,
					tarif: "",
					poidsKg: "",
					quantite: "1",
				}))
				.slice(0, nouveauMode === "POIDS" ? 1 : current.length),
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
	// Chips du contenu du dépôt : types actifs triés alphabétiquement.
	const typesVetementChips = useMemo(
		() =>
			typesVetementEntrees
				.filter((entree) => entree.actif)
				.sort((a, b) =>
					a.libelle.localeCompare(b.libelle, "fr", { sensitivity: "base" }),
				),
		[typesVetementEntrees],
	);
	// Quand le contenu du dépôt est déclaré, le type de chaque ligne est
	// déduit : un seul type → celui-ci ; plusieurs → « MIXTE ». Le champ
	// « Type de vêtement » des lignes devient alors inutile et n'est pas
	// affiché. `null` = pas de contenu déclaré → saisie manuelle du type.
	const typeVetementDerive = useMemo(() => {
		const types = [
			...new Set(
				compositions
					.map((compo) => compo.typeVetement.trim())
					.filter((libelle) => libelle !== ""),
			),
		];
		return types.length === 0 ? null : types.length === 1 ? types[0] : "MIXTE";
	}, [compositions]);

	// Corps des lignes partagé entre la prévisualisation d'abonnement et le
	// submit — même normalisation pour que l'aperçu reflète exactement ce qui
	// partira au backend.
	const lignesCorps = useMemo<LigneCommandeBody[]>(
		() =>
			lignes.map((ligne) => {
				// Priorité : type déduit du contenu du dépôt → saisie manuelle →
				// en tarification au kilo (rubrique unique), « MIXTE » quand
				// rien n'est déclaré — le champ n'est jamais affiché en POIDS.
				const typeVetement =
					typeVetementDerive ??
					(ligne.typeVetement.trim() || (mode === "POIDS" ? "MIXTE" : ""));
				return {
					typeVetement,
					quantite: ligne.quantite.trim(),
					prestation: ligne.prestation.trim(),
					// « Catalogue » seulement si les DEUX libellés sont dans le
					// référentiel actif — le backend vérifie l'appartenance quand
					// `hors_catalogue` est faux.
					horsCatalogue:
						!typesConnus.has(typeVetement) ||
						!prestationsConnues.has(ligne.prestation.trim()),
					...(mode === "UNITAIRE"
						? { tarif: ligne.tarif.trim() }
						: { poidsKg: ligne.poidsKg.trim() }),
				};
			}),
		[lignes, mode, typesConnus, prestationsConnues, typeVetementDerive],
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
	// « Ne pas utiliser l'abonnement » repart à zéro quand le client change —
	// sinon un opt-out coché pour un client s'appliquerait silencieusement au
	// suivant.
	// biome-ignore lint/correctness/useExhaustiveDependencies: déclencheur volontaire — reset au changement de client
	useEffect(() => {
		setIgnorerAbonnement(false);
	}, [idClient]);
	// Acompte inutile quand l'abonnement couvre la totalité.
	const totalDu =
		apercu.data && !ignorerAbonnement ? apercu.data.total_du : null;
	const couvertureComplete = totalDu !== null && Number(totalDu) === 0;

	const valider = (): string | null => {
		if (!commande && !idClient) return "Sélectionnez un client.";
		if (lignes.length === 0) return "Ajoutez au moins un article.";
		if (aucunTarifKgConfigure) {
			return "Aucun tarif au kilo n'est configuré — impossible de créer une commande au kilo.";
		}
		for (const ligne of lignes) {
			const erreur = validerLignePressing(
				{
					typeVetement:
						typeVetementDerive ??
						(ligne.typeVetement || (mode === "POIDS" ? "MIXTE" : "")),
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
		if (acompte.trim() && Number(acompte) <= 0) {
			return "L'acompte doit être un montant positif (ou vide).";
		}
		if (acompte.trim() && !idMoyenEffectif) {
			return "Sélectionnez le moyen de paiement de l'acompte.";
		}
		if (acompte.trim() && !couvertureComplete) {
			const erreurCaisse = erreurCaisseRequise(caissesQuery.data, idCaisse);
			if (erreurCaisse) return erreurCaisse;
		}
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
			accepterExcedent: excedent.accepterExcedent(apercu.data?.excedent),
		};
		try {
			if (commande) {
				await editMutation.mutateAsync({
					id: commande.id,
					idClient,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
					description,
					...flagsAbonnement,
				});
			} else {
				await createMutation.mutateAsync({
					idClient,
					modeTarification: mode,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
					description,
					...(acompte.trim() && !couvertureComplete
						? {
								paiement: {
									montant: acompte.trim(),
									idMoyen: idMoyenEffectif,
									idCaisse: idCaisseAEnvoyer(caissesQuery.data, idCaisse),
								},
							}
						: {}),
					...flagsAbonnement,
				});
			}
			onSaved();
		} catch (error) {
			const messageExcedent = excedent.detecter(error);
			if (messageExcedent) {
				setGlobalError(messageExcedent);
				return;
			}
			const apiError = toApiError(error);
			setGlobalError(messageErreurPaiement(apiError));
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
					{mode === "UNITAIRE" ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={ajouterLigne}
						>
							<Plus className="size-4" aria-hidden />
							Ajouter un article
						</Button>
					) : null}
				</div>

				{lignes.map((ligne) => (
					<div
						key={ligne.cle}
						className="space-y-3 rounded-md border border-border p-3"
					>
						<div className="grid gap-3 sm:grid-cols-2">
							{typeVetementDerive !== null || mode === "POIDS" ? (
								<div className="space-y-2">
									<Label>Type de vêtement</Label>
									<p className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
										{typeVetementDerive ?? "MIXTE"}{" "}
										<span className="text-xs">
											{typeVetementDerive !== null
												? "— déduit du contenu du dépôt"
												: "— automatique (tarification au kilo)"}
										</span>
									</p>
								</div>
							) : (
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
							)}
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
						{mode === "UNITAIRE" || lignes.length > 1 ? (
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
						) : null}
					</div>
				))}
			</div>

			<div className="space-y-3">
				<div className="space-y-1">
					<Label>Contenu du dépôt</Label>
					<p className="text-xs text-muted-foreground">
						Types de vêtement et quantités — imprimés sur le reçu de dépôt.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{typesVetementChips.map((type) => {
						const compo = nombreDeType(type.libelle);
						const nombre = compo ? Number(compo.nombre) : 0;
						return nombre > 0 && compo ? (
							<span
								key={type.id}
								className="inline-flex items-center gap-1 rounded-full border border-lagoon bg-lagoon/10 py-1 pl-3 pr-1 text-sm font-medium"
							>
								{type.libelle}
								<button
									type="button"
									aria-label={`Retirer un ${type.libelle}`}
									className="grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-lagoon/20 hover:text-foreground"
									onClick={() => decrementerType(compo.cle)}
								>
									<Minus className="size-3.5" aria-hidden />
								</button>
								<span className="min-w-5 text-center tabular-nums">
									{nombre}
								</span>
								<button
									type="button"
									aria-label={`Ajouter un ${type.libelle}`}
									className="grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-lagoon/20 hover:text-foreground"
									onClick={() => incrementerType(type.libelle)}
								>
									<Plus className="size-3.5" aria-hidden />
								</button>
							</span>
						) : (
							<button
								key={type.id}
								type="button"
								className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-lagoon/50 hover:text-foreground"
								onClick={() => incrementerType(type.libelle)}
							>
								{type.libelle}
							</button>
						);
					})}
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="commande-description">
						Description (imprimée sur le reçu)
					</Label>
					<textarea
						id="commande-description"
						rows={2}
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						placeholder="ex : 3 Chemise, 2 Pantalon, 1 Robe de soirée"
						value={description}
						onChange={(event) => {
							setDescription(event.target.value);
							// Vider le champ réactive la composition automatique.
							setDescriptionManuelle(event.target.value.trim() !== "");
						}}
					/>
					{descriptionManuelle && descriptionComposee ? (
						<Button
							type="button"
							variant="link"
							size="sm"
							className="h-auto px-0 text-xs"
							onClick={() => {
								setDescriptionManuelle(false);
								setDescription(descriptionComposee);
							}}
						>
							Reprendre le contenu déclaré
						</Button>
					) : null}
				</div>
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
					{/* `ignorerAbonnement ||` garde la case montée une fois cochée :
					    l'aperçu passe alors à null — sinon la case se démonterait
					    elle-même et deviendrait indécochable. */}
					{ignorerAbonnement ||
					(apercu.data && apercu.data.abonnements.length > 0) ? (
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

			{!commande ? (
				<div className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
					{couvertureComplete ? (
						<p className="text-xs text-success sm:col-span-2">
							Commande entièrement couverte par l'abonnement — aucun acompte à
							encaisser.
						</p>
					) : (
						<>
							<InputField
								id="commande-acompte"
								label="Acompte encaissé (FCFA, optionnel)"
								inputMode="numeric"
								value={acompte}
								onChange={(event) => setAcompte(event.target.value)}
							/>
							{acompte.trim() ? (
								<>
									<div className="space-y-2">
										<Label htmlFor="commande-moyen">Moyen de paiement</Label>
										<Select value={idMoyenEffectif} onValueChange={setIdMoyen}>
											<SelectTrigger id="commande-moyen" className="w-full">
												<SelectValue placeholder="Sélectionner un moyen" />
											</SelectTrigger>
											<SelectContent>
												{moyens.map((moyen) => (
													<SelectItem key={moyen.id} value={moyen.id}>
														{moyen.libelle}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="sm:col-span-2">
										<CaissePicker
											id="commande-caisse"
											caisses={caissesQuery.data}
											chargement={caissesQuery.isLoading}
											value={idCaisse}
											onChange={setIdCaisse}
											activiteCode="PRESSING"
										/>
									</div>
								</>
							) : null}
						</>
					)}
				</div>
			) : null}

			{excedent.confirme ? (
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
