import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Toast } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { useCreerVentePortail } from "#/features/portail/hooks/use-market";
import { useCreerCommandeRestaurant } from "#/features/portail/hooks/use-restaurant";
import type { TypeCommandePortail } from "#/features/portail/models/restaurant";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { usePanierArticles } from "../hooks/use-panier-articles";
import {
	CLE_PANIER_BOUTIQUE,
	CLE_PANIER_RESTAURANT,
	type LigneArticlePanier,
} from "../models/panier-articles";
import { CommanderDialog } from "./commander-dialog";
import { DemanderBoutiqueDialog } from "./demander-boutique-dialog";

function LignePanierItem({
	ligne,
	onQuantite,
	disabled,
}: {
	ligne: LigneArticlePanier;
	onQuantite: (quantite: number) => void;
	disabled: boolean;
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
			{ligne.imageUrl ? (
				<img
					src={ligne.imageUrl}
					alt=""
					className="size-12 shrink-0 rounded-md object-cover"
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
				<p className="text-xs text-muted-foreground">
					{formatMontantFCFA(ligne.prix)} / article
				</p>
			</div>
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
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
		</div>
	);
}

/** En-tête + liste des lignes d'un panier, partagés entre les sections. */
function ListePanier({
	panier,
	envoye,
}: {
	panier: ReturnType<typeof usePanierArticles>;
	envoye: boolean;
}) {
	return (
		<div className="space-y-2">
			{panier.lignes.map((ligne) => (
				<LignePanierItem
					key={ligne.id}
					ligne={ligne}
					disabled={envoye}
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
		<div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
			Panier vide — ajoutez des articles depuis{" "}
			<Link
				to={catalogueTo}
				className="font-medium text-lagoon hover:underline"
			>
				{catalogueLabel}
			</Link>
			.
		</div>
	);
}

function DemandeEnvoyee() {
	return (
		<div className="rounded-lg border border-lagoon/40 bg-lagoon/5 p-6 text-sm text-foreground">
			Demande envoyée — nos équipes vous répondront prochainement. Retrouvez-la
			dans{" "}
			<Link
				to="/espace-client/mes-demandes"
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
	onDemandeEnvoyee,
}: {
	onDemandeEnvoyee: () => void;
}) {
	const panier = usePanierArticles(CLE_PANIER_RESTAURANT);
	const canCommander = useCan("RESTAURANT.COMMANDER");
	const creerCommande = useCreerCommandeRestaurant();
	const [dialogOuvert, setDialogOuvert] = useState(false);
	const [envoye, setEnvoye] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

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
				<h2 className="text-lg font-semibold text-foreground">Restaurant</h2>
				{panier.lignes.length > 0 ? (
					<span className="text-sm text-muted-foreground">
						{panier.nombreArticles} article
						{panier.nombreArticles > 1 ? "s" : ""} ·{" "}
						{formatMontantFCFA(String(panier.total))}
					</span>
				) : null}
			</div>

			{envoye ? (
				<DemandeEnvoyee />
			) : panier.lignes.length === 0 ? (
				<PanierVide
					catalogueTo="/espace-client/restaurant"
					catalogueLabel="la carte"
				/>
			) : (
				<>
					<ListePanier panier={panier} envoye={envoye} />

					<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-base font-semibold text-foreground">
							Total : {formatMontantFCFA(String(panier.total))}
						</p>
						{canCommander ? (
							<Button
								type="button"
								className="bg-lagoon text-white hover:bg-lagoon/90"
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
	onDemandeEnvoyee,
}: {
	onDemandeEnvoyee: () => void;
}) {
	const panier = usePanierArticles(CLE_PANIER_BOUTIQUE);
	const canCommander = useCan("MARCHANDISE.COMMANDER");
	const creerVente = useCreerVentePortail();
	const [dialogOuvert, setDialogOuvert] = useState(false);
	const [envoye, setEnvoye] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);

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
				<h2 className="text-lg font-semibold text-foreground">Boutique</h2>
				{panier.lignes.length > 0 ? (
					<span className="text-sm text-muted-foreground">
						{panier.nombreArticles} article
						{panier.nombreArticles > 1 ? "s" : ""} ·{" "}
						{formatMontantFCFA(String(panier.total))}
					</span>
				) : null}
			</div>

			{envoye ? (
				<DemandeEnvoyee />
			) : panier.lignes.length === 0 ? (
				<PanierVide
					catalogueTo="/espace-client/boutique"
					catalogueLabel="la boutique"
				/>
			) : (
				<>
					<ListePanier panier={panier} envoye={envoye} />

					<div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-base font-semibold text-foreground">
							Total : {formatMontantFCFA(String(panier.total))}
						</p>
						{canCommander ? (
							<Button
								type="button"
								className="bg-lagoon text-white hover:bg-lagoon/90"
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
 * Panier de l'espace client (`/espace-client/panier`) : récapitulatif des
 * articles restaurant et boutique (paniers indépendants par clé de
 * stockage), ajustement des quantités puis envoi. Les deux sections créent
 * de vraies demandes portail `EN_ATTENTE` (restaurant `/restaurant/portail/
 * commandes`, boutique `/market/portail/ventes`), suivies dans « Mes
 * demandes ».
 */
export function PanierPage() {
	const [toastOuvert, setToastOuvert] = useState(false);
	const onDemandeEnvoyee = () => setToastOuvert(true);

	return (
		<Toast.Provider swipeDirection="right">
			<div className="mx-auto w-full max-w-4xl space-y-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<Breadcrumb
					items={[
						{ label: "Espace client", to: "/espace-client" },
						{ label: "Mon panier" },
					]}
				/>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Mon panier</h1>
					<p className="text-sm text-muted-foreground">
						Vérifiez vos articles puis envoyez votre demande — nos équipes vous
						répondront pour confirmer et régler le paiement.
					</p>
				</div>

				<SectionPanierRestaurant onDemandeEnvoyee={onDemandeEnvoyee} />
				<SectionPanierBoutique onDemandeEnvoyee={onDemandeEnvoyee} />
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
