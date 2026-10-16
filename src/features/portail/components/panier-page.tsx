import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Toast } from "radix-ui";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { useCan } from "#/core/auth";
import { listProduits } from "#/features/marchandise/api/produits";
import { estEpuise } from "#/features/marchandise/models/produits";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { listPlats } from "#/features/restaurant/api/plats";
import { cn } from "#/lib/utils";

import { useCreerVentePortail } from "../hooks/use-market";
import { usePanierArticles } from "../hooks/use-panier-articles";
import { useCreerCommandeRestaurant } from "../hooks/use-restaurant";
import {
	CLE_PANIER_BOUTIQUE,
	CLE_PANIER_RESTAURANT,
	type LigneArticlePanier,
} from "../models/panier-articles";
import type { TypeCommandePortail } from "../models/restaurant";
import { CommanderDialog } from "./commander-dialog";
import { DemanderBoutiqueDialog } from "./demander-boutique-dialog";

/** Liens propres à l'espace (client ou résident) utilisant la page. */
export interface PanierPageLiens {
	/** Catalogue restaurant (« la carte »). */
	restaurant: string;
	/** Catalogue boutique. */
	boutique: string;
	/** Vue agrégée des demandes (« Mes demandes »). */
	mesDemandes: string;
}

function LignePanierItem({
	ligne,
	onQuantite,
	disabled,
	indisponible = false,
}: {
	ligne: LigneArticlePanier;
	onQuantite: (quantite: number) => void;
	disabled: boolean;
	/** `true` → l'article a quitté le catalogue disponible depuis son ajout :
	 *  ligne estompée, quantités figées, seul le retrait reste possible. */
	indisponible?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border border-border bg-card p-3",
				indisponible && "border-amber-500/40 bg-amber-500/5",
			)}
		>
			{ligne.imageUrl ? (
				<img
					src={ligne.imageUrl}
					alt=""
					className={cn(
						"size-12 shrink-0 rounded-md object-cover",
						indisponible && "opacity-50",
					)}
				/>
			) : (
				<span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted">
					<ShoppingCart className="size-5 text-muted-foreground" aria-hidden />
				</span>
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-foreground">
					{ligne.nom}
				</p>
				{indisponible ? (
					<p className="text-xs font-medium text-amber-700 dark:text-amber-400">
						Plus disponible — retirez-le pour envoyer.
					</p>
				) : (
					<p className="text-xs text-muted-foreground">
						{formatMontantFCFA(ligne.prix)} / article
					</p>
				)}
			</div>
			{indisponible ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-full"
					disabled={disabled}
					onClick={() => onQuantite(0)}
				>
					<Trash2 className="size-4" aria-hidden />
					Retirer
				</Button>
			) : (
				<>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							className="rounded-full"
							aria-label={`Réduire la quantité de ${ligne.nom}`}
							disabled={disabled}
							onClick={() => onQuantite(ligne.quantite - 1)}
						>
							{ligne.quantite <= 1 ? (
								<Trash2 className="size-4" aria-hidden />
							) : (
								<Minus className="size-4" aria-hidden />
							)}
						</Button>
						<span className="w-8 text-center text-sm font-medium tabular-nums">
							{ligne.quantite}
						</span>
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							className="rounded-full"
							aria-label={`Augmenter la quantité de ${ligne.nom}`}
							disabled={disabled}
							onClick={() => onQuantite(ligne.quantite + 1)}
						>
							<Plus className="size-4" aria-hidden />
						</Button>
					</div>
					<span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
						{formatMontantFCFA(String(Number(ligne.prix) * ligne.quantite))}
					</span>
				</>
			)}
		</div>
	);
}

/** En-tête + liste des lignes d'un panier, partagés entre les sections. */
function ListePanier({
	panier,
	envoye,
	indisponibles,
}: {
	panier: ReturnType<typeof usePanierArticles>;
	envoye: boolean;
	indisponibles: ReadonlySet<string>;
}) {
	return (
		<div className="grid gap-2 lg:grid-cols-2">
			{panier.lignes.map((ligne) => (
				<LignePanierItem
					key={ligne.id}
					ligne={ligne}
					disabled={envoye}
					indisponible={indisponibles.has(ligne.id)}
					onQuantite={(quantite) => panier.definirQuantite(ligne.id, quantite)}
				/>
			))}
		</div>
	);
}

function PanierVide({
	catalogueTo,
	catalogueLabel,
}: {
	catalogueTo: string;
	catalogueLabel: string;
}) {
	return (
		<EmptyState
			icon={ShoppingCart}
			title="Panier vide"
			description={
				<>
					Ajoutez des articles depuis{" "}
					<Link
						to={catalogueTo as never}
						className="font-medium text-lagoon hover:underline"
					>
						{catalogueLabel}
					</Link>
					.
				</>
			}
		/>
	);
}

function DemandeEnvoyee({ mesDemandesTo }: { mesDemandesTo: string }) {
	return (
		<div className="rounded-lg border border-success/30 bg-success-bg p-6 text-sm text-foreground">
			Demande envoyée — nos équipes vous répondront prochainement. Retrouvez-la
			dans{" "}
			<Link
				to={mesDemandesTo as never}
				className="font-medium text-lagoon hover:underline"
			>
				Mes demandes
			</Link>
			.
		</div>
	);
}

/**
 * Section « Restaurant » du panier : envoi réel via
 * `POST /restaurant/portail/commandes` (RESTAURANT.COMMANDER) — le dialogue
 * collecte le type de commande, l'adresse si livraison et une note. Le
 * total affiché est indicatif (le serveur le recalcule).
 */
function SectionPanierRestaurant({
	liens,
	onDemandeEnvoyee,
}: {
	liens: PanierPageLiens;
	onDemandeEnvoyee: () => void;
}) {
	const panier = usePanierArticles(CLE_PANIER_RESTAURANT);
	const canCommander = useCan("RESTAURANT.COMMANDER");
	const creerCommande = useCreerCommandeRestaurant();
	const [dialogOuvert, setDialogOuvert] = useState(false);
	const [envoye, setEnvoye] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);
	// Revalidation des lignes contre le catalogue vivant : un plat passé
	// indisponible depuis son ajout est marqué et bloque l'envoi — le client
	// ou le résident ne peut commander que du disponible. Tant que le
	// catalogue n'a pas répondu, rien n'est marqué (pas de faux positif).
	const platsQuery = useQuery({
		queryKey: ["portail", "restaurant", "plats"],
		queryFn: () => listPlats(),
	});
	const indisponibles = useMemo(() => {
		const plats = platsQuery.data;
		if (!plats) return new Set<string>();
		const disponibleIds = new Set(
			plats.filter((plat) => plat.disponible).map((plat) => plat.id),
		);
		return new Set(
			panier.lignes
				.filter((ligne) => !disponibleIds.has(ligne.id))
				.map((ligne) => ligne.id),
		);
	}, [platsQuery.data, panier.lignes]);

	const envoyer = (valeurs: {
		type: TypeCommandePortail;
		adresseLivraison?: string;
		notes?: string;
	}) => {
		setErreur(null);
		creerCommande.mutate(
			{
				type: valeurs.type,
				lignes: panier.lignes.map((ligne) => ({
					id_plat: ligne.id,
					quantite: String(ligne.quantite),
				})),
				adresseLivraison: valeurs.adresseLivraison,
				notes: valeurs.notes,
			},
			{
				onSuccess: () => {
					panier.vider();
					setDialogOuvert(false);
					setEnvoye(true);
					onDemandeEnvoyee();
				},
				onError: (error) => {
					setErreur(
						error instanceof Error
							? error.message
							: "Impossible d'envoyer la commande.",
					);
				},
			},
		);
	};

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold text-foreground">Restaurant</h2>
				{panier.lignes.length > 0 ? (
					<span className="text-sm text-muted-foreground">
						{panier.nombreArticles} article
						{panier.nombreArticles > 1 ? "s" : ""} ·{" "}
						{formatMontantFCFA(String(panier.total))}
					</span>
				) : null}
			</div>

			{envoye ? (
				<DemandeEnvoyee mesDemandesTo={liens.mesDemandes} />
			) : panier.lignes.length === 0 ? (
				<PanierVide catalogueTo={liens.restaurant} catalogueLabel="la carte" />
			) : (
				<>
					<ListePanier
						panier={panier}
						envoye={envoye}
						indisponibles={indisponibles}
					/>

					{indisponibles.size > 0 ? (
						<p
							role="alert"
							className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
						>
							Des articles ne sont plus disponibles — retirez-les pour envoyer
							votre commande.
						</p>
					) : null}

					<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-base font-semibold text-foreground">
							Total : {formatMontantFCFA(String(panier.total))}
						</p>
						{canCommander ? (
							<Button
								type="button"
								className="rounded-full"
								disabled={indisponibles.size > 0}
								onClick={() => setDialogOuvert(true)}
							>
								Envoyer ma commande
							</Button>
						) : (
							<p className="text-sm text-muted-foreground">
								La commande en ligne n'est pas activée sur votre compte —
								présentez-vous au comptoir.
							</p>
						)}
					</div>
				</>
			)}

			<CommanderDialog
				open={dialogOuvert}
				lignes={panier.lignes}
				total={panier.total}
				isPending={creerCommande.isPending}
				erreur={erreur}
				onSubmit={envoyer}
				onOpenChange={setDialogOuvert}
			/>
		</section>
	);
}

/**
 * Section « Boutique » du panier : envoi réel via
 * `POST /market/portail/ventes` (MARCHANDISE.COMMANDER) — la vente naît
 * `EN_ATTENTE` avec `origine = "PORTAIL"`, visible dans le back-office
 * marchandise. Le dialogue collecte une note optionnelle ; le total affiché
 * est indicatif (le serveur fige les prix au `prix_vente` catalogue).
 */
function SectionPanierBoutique({
	liens,
	onDemandeEnvoyee,
}: {
	liens: PanierPageLiens;
	onDemandeEnvoyee: () => void;
}) {
	const panier = usePanierArticles(CLE_PANIER_BOUTIQUE);
	const canCommander = useCan("MARCHANDISE.COMMANDER");
	const creerVente = useCreerVentePortail();
	const [dialogOuvert, setDialogOuvert] = useState(false);
	const [envoye, setEnvoye] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

	// Même revalidation que la section restaurant : produit devenu inactif
	// ou épuisé depuis son ajout → marqué, envoi bloqué jusqu'au retrait.
	const produitsQuery = useQuery({
		queryKey: ["portail", "boutique", "produits"],
		queryFn: () => listProduits(),
	});
	const indisponibles = useMemo(() => {
		const produits = produitsQuery.data;
		if (!produits) return new Set<string>();
		const disponibleIds = new Set(
			produits
				.filter((produit) => produit.actif && !estEpuise(produit))
				.map((produit) => produit.id),
		);
		return new Set(
			panier.lignes
				.filter((ligne) => !disponibleIds.has(ligne.id))
				.map((ligne) => ligne.id),
		);
	}, [produitsQuery.data, panier.lignes]);

	const envoyer = (valeurs: { note?: string }) => {
		setErreur(null);
		creerVente.mutate(
			{
				lignes: panier.lignes.map((ligne) => ({
					id_produit: ligne.id,
					quantite: String(ligne.quantite),
				})),
				note: valeurs.note,
			},
			{
				onSuccess: () => {
					panier.vider();
					setDialogOuvert(false);
					setEnvoye(true);
					onDemandeEnvoyee();
				},
				onError: (error) => {
					setErreur(
						error instanceof Error
							? error.message
							: "Impossible d'envoyer la demande.",
					);
				},
			},
		);
	};

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold text-foreground">Boutique</h2>
				{panier.lignes.length > 0 ? (
					<span className="text-sm text-muted-foreground">
						{panier.nombreArticles} article
						{panier.nombreArticles > 1 ? "s" : ""} ·{" "}
						{formatMontantFCFA(String(panier.total))}
					</span>
				) : null}
			</div>

			{envoye ? (
				<DemandeEnvoyee mesDemandesTo={liens.mesDemandes} />
			) : panier.lignes.length === 0 ? (
				<PanierVide catalogueTo={liens.boutique} catalogueLabel="la boutique" />
			) : (
				<>
					<ListePanier
						panier={panier}
						envoye={envoye}
						indisponibles={indisponibles}
					/>

					{indisponibles.size > 0 ? (
						<p
							role="alert"
							className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
						>
							Des articles ne sont plus disponibles — retirez-les pour envoyer
							votre demande.
						</p>
					) : null}

					<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-base font-semibold text-foreground">
							Total : {formatMontantFCFA(String(panier.total))}
						</p>
						{canCommander ? (
							<Button
								type="button"
								className="rounded-full"
								disabled={indisponibles.size > 0}
								onClick={() => setDialogOuvert(true)}
							>
								Envoyer ma demande
							</Button>
						) : (
							<p className="text-sm text-muted-foreground">
								La commande en ligne n'est pas activée sur votre compte —
								présentez-vous à la boutique.
							</p>
						)}
					</div>
				</>
			)}

			<DemanderBoutiqueDialog
				open={dialogOuvert}
				lignes={panier.lignes}
				total={panier.total}
				isPending={creerVente.isPending}
				erreur={erreur}
				onSubmit={envoyer}
				onOpenChange={setDialogOuvert}
			/>
		</section>
	);
}

/**
 * « Mon panier » — récapitulatif des articles restaurant et boutique
 * (paniers indépendants par clé de stockage, partagés entre l'espace client
 * et le portail résident), ajustement des quantités puis envoi. Les deux
 * sections créent de vraies demandes portail `EN_ATTENTE` (restaurant
 * `/restaurant/portail/commandes`, boutique `/market/portail/ventes`),
 * suivies dans « Mes demandes ».
 *
 * `variant` : `client` = le shell espace client porte marges et largeur
 * (`pt-6 pb-16` suffit, `pb-16` dégage la tab bar mobile) ; `resident` =
 * `<main>` du shell `_authenticated` sans padding — la page porte son
 * `p-6` elle-même. Les deux sections passent côte à côte dès `xl` dans
 * les deux espaces (le shell résident est pleine largeur).
 */
export function PanierPage({
	breadcrumb,
	liens,
	variant,
}: {
	breadcrumb: { label: string; to?: string }[];
	liens: PanierPageLiens;
	variant: "client" | "resident";
}) {
	const [toastOuvert, setToastOuvert] = useState(false);
	const onDemandeEnvoyee = () => setToastOuvert(true);
	const conteneur =
		variant === "resident"
			? "w-full space-y-6 p-6"
			: "w-full space-y-8 pt-6 pb-16";

	return (
		<Toast.Provider swipeDirection="right">
			<div className={conteneur}>
				<PageHeader
					breadcrumb={breadcrumb}
					title="Mon panier"
					description="Vérifiez vos articles puis envoyez votre demande — nos équipes vous répondront pour confirmer et régler le paiement."
				/>

				<div className="grid gap-6 xl:grid-cols-2 xl:items-start">
					<SectionPanierRestaurant
						liens={liens}
						onDemandeEnvoyee={onDemandeEnvoyee}
					/>
					<SectionPanierBoutique
						liens={liens}
						onDemandeEnvoyee={onDemandeEnvoyee}
					/>
				</div>
			</div>

			<Toast.Root
				open={toastOuvert}
				onOpenChange={setToastOuvert}
				duration={4000}
				className="fixed right-6 bottom-6 z-50 rounded-lg border border-border bg-card px-4 py-3 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
			>
				<Toast.Title className="text-sm font-semibold text-foreground">
					Demande enregistrée
				</Toast.Title>
				<Toast.Description className="text-sm text-muted-foreground">
					Nos équipes vous répondront prochainement pour confirmer votre
					commande.
				</Toast.Description>
			</Toast.Root>
			<Toast.Viewport />
		</Toast.Provider>
	);
}
