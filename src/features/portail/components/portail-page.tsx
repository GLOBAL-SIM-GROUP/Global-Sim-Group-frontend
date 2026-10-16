import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	BedDouble,
	CalendarDays,
	Camera,
	ChevronRight,
	ClipboardList,
	CreditCard,
	Flag,
	type LucideIcon,
	PartyPopper,
	ReceiptText,
	ShieldCheck,
	Shirt,
	ShoppingBag,
	ShoppingCart,
	Tickets,
	UtensilsCrossed,
} from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { PageHeader } from "#/components/ui/page-header";
import { useCan, useCurrentUser } from "#/core/auth";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useDemandesEnCours } from "../hooks/use-demandes-en-cours";
import { useNombreArticlesPaniers } from "../hooks/use-panier-articles";
import { usePortailResume } from "../hooks/use-portail";
import {
	ECHEANCE_STATUT_LABELS,
	echeancePortailStatutVariant,
	libelleMoisAnnee,
} from "../models/portail";
import {
	PRESSING_STATUT_LABELS,
	PRESSING_STATUT_VARIANT,
} from "../models/pressing";
import { ServiceTile, type TuileBadgeVariant } from "./service-tile";

/** Vignette « en direct » mise en avant à côté de la salutation. */
interface ItemActif {
	icon: LucideIcon;
	service: string;
	titre: string;
	statutLabel: string;
	variant: TuileBadgeVariant;
	to: string;
	params?: Record<string, string>;
}

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

/** Tuiles locatives — résident uniquement (`RESIDENT.VOIR`). */
const RESIDENCE = [
	{
		to: "/residence/portail/echeances",
		icon: CalendarDays,
		label: "Mes échéances",
		description: "Suivi de vos loyers, dus et payés.",
	},
	{
		to: "/residence/portail/paiements",
		icon: CreditCard,
		label: "Mon historique",
		description: "Historique de vos paiements et reçus.",
	},
	{
		to: "/residence/portail/caution",
		icon: ShieldCheck,
		label: "Ma caution",
		description: "Montant versé et statut de restitution.",
	},
	{
		to: "/residence/portail/etat-des-lieux",
		icon: Camera,
		label: "Mes états des lieux",
		description: "Photos d'entrée et de sortie de vos logements.",
	},
] as const;

/**
 * Accueil des espaces personnels — même page pour le portail résident
 * (`/residence/portail`, `variant="resident"`) et l'espace client
 * (`/espace-client`, `variant="client"`) : salutation + vignette « en
 * direct » (première demande pressing active), bento des services, « Mes
 * demandes » / « Mes factures » / « Mon panier ». `variant` fixe le
 * conteneur (`p-6` résident, `pt-6 pb-16` client), le fil d'Ariane, les
 * préfixes de routes et l'entrée signalement. Le bloc locatif (tuiles
 * « Ma résidence », contrat en cours, prochaine échéance) n'existe qu'en
 * résident — `usePortailResume` est désactivé côté client (`RESIDENT.VOIR`
 * requis, 403 sinon). Aucune donnée inventée : les compteurs agrègent les
 * demandes réellement en cours.
 */
export function PortailPage({ variant }: { variant: "client" | "resident" }) {
	const estClient = variant === "client";
	const base = estClient ? "/espace-client" : "/residence/portail";

	const user = useCurrentUser();
	const resumeQuery = usePortailResume(!estClient);
	const canVoirSignalements = useCan("SIGNALEMENT.VOIR");
	const canPortail = useCan("PORTAIL.VOIR");
	const { pressingEnCours, totalEnCours } = useDemandesEnCours();
	const nombreArticlesPanier = useNombreArticlesPaniers();

	const resume = resumeQuery.data;
	const prenom = estClient
		? user?.login
		: resume?.client.prenoms || user?.login;

	const services = [
		{
			to: `${base}/restaurant`,
			icon: UtensilsCrossed,
			label: "Restaurant",
			description: "Consultez la carte et composez votre commande.",
		},
		{
			to: `${base}/boutique`,
			icon: ShoppingBag,
			label: "Boutique",
			description: "Parcourez les articles disponibles en boutique.",
		},
		{
			to: `${base}/pressing`,
			icon: Shirt,
			label: "Pressing",
			description: "Suivez l'avancement de vos dépôts de linge.",
		},
		{
			to: `${base}/salle-fete`,
			icon: PartyPopper,
			label: "Salle de fête",
			description: "Demandez la réservation de la salle pour vos événements.",
		},
		estClient
			? {
					to: "/espace-client/residence",
					icon: BedDouble,
					label: "Résidence",
					description:
						"Formulez une demande de séjour court, chambre ou studio.",
				}
			: {
					to: "/residence/portail/sejours",
					icon: BedDouble,
					label: "Séjours courts",
					description: "Formulez une demande de séjour, chambre ou studio.",
				},
		{
			to: `${base}/abonnements`,
			icon: Tickets,
			label: "Mes abonnements",
			description: "Suivez vos quotas prépayés pressing et restaurant.",
		},
	] as const;

	// La demande pressing est historiquement la plus fréquente à suivre au
	// jour le jour : mise en avant en priorité si une commande est active.
	const commandePressingActive = pressingEnCours[0];
	const itemActif: ItemActif | null = commandePressingActive
		? {
				icon: Shirt,
				service: "Pressing",
				titre: commandePressingActive.numero_commande,
				statutLabel:
					PRESSING_STATUT_LABELS[commandePressingActive.statut] ??
					commandePressingActive.statut,
				variant: PRESSING_STATUT_VARIANT[commandePressingActive.statut],
				to: `${base}/pressing/$id`,
				params: { id: commandePressingActive.id },
			}
		: null;

	return (
		<div
			className={
				estClient ? "w-full space-y-8 pt-6 pb-16" : "w-full space-y-8 p-6"
			}
		>
			<PageHeader
				breadcrumb={
					estClient
						? [{ label: "Espace client" }]
						: [{ label: "Accueil", to: "/" }, { label: "Espace résident" }]
				}
				title={`Bonjour${prenom ? ` ${prenom}` : ""}`}
				titleClassName="display-title"
				description={
					estClient
						? "Tous les services GLOBAL SIM GROUP depuis votre espace."
						: "Tous les services GLOBAL SIM GROUP depuis votre espace résident."
				}
			/>

			<div className={`grid gap-4 ${itemActif ? "lg:grid-cols-3" : ""}`}>
				<div
					className={`relative overflow-hidden rounded-2xl bg-sea-ink p-8 ${
						itemActif ? "lg:col-span-2" : ""
					}`}
				>
					<div
						aria-hidden
						className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full bg-lagoon/30 blur-3xl"
					/>
					<div className="relative space-y-3">
						<p className="text-xs font-semibold tracking-wide text-lagoon uppercase">
							{new Date().toLocaleDateString("fr-FR", {
								weekday: "long",
								day: "numeric",
								month: "long",
							})}
						</p>
						<h2 className="display-title text-3xl font-semibold text-white sm:text-4xl">
							Bienvenue{prenom ? `, ${prenom}` : ""}
						</h2>
						<p className="max-w-md text-sm text-white/70">
							{totalEnCours > 0
								? `Vous avez ${totalEnCours} demande${totalEnCours > 1 ? "s" : ""} en cours — retrouvez leur suivi ci-dessous.`
								: "Composez une commande, réservez la salle de fête ou déposez du linge en quelques clics."}
						</p>
						<Link
							to={`${base}/restaurant`}
							className="mt-2 inline-flex items-center gap-2 rounded-full bg-lagoon px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lagoon/90"
						>
							Commander au restaurant
							<ChevronRight className="size-4" aria-hidden />
						</Link>
					</div>
				</div>

				{itemActif ? (
					<Link
						to={itemActif.to}
						params={itemActif.params}
						className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-lagoon/50"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
								Suivi en direct
							</span>
							<span className="relative flex size-2.5">
								<span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-lagoon opacity-75" />
								<span className="relative inline-flex size-2.5 rounded-full bg-lagoon" />
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="grid size-11 shrink-0 place-items-center rounded-full bg-lagoon/15">
								<itemActif.icon className="size-5 text-lagoon" aria-hidden />
							</span>
							<div className="min-w-0 space-y-1">
								<p className="truncate font-semibold text-foreground">
									{itemActif.service} · {itemActif.titre}
								</p>
								<Badge variant={itemActif.variant}>
									{itemActif.statutLabel}
								</Badge>
							</div>
						</div>
						<span className="inline-flex items-center gap-1 text-sm font-semibold text-lagoon">
							Voir le détail
							<ChevronRight className="size-4" aria-hidden />
						</span>
					</Link>
				) : null}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{services.map((service, index) => (
					<ServiceTile
						key={service.to}
						{...service}
						large={index === 0}
						badge={
							service.to === `${base}/pressing` && pressingEnCours.length > 0
								? {
										label: `${pressingEnCours.length} en cours`,
										variant: "warning",
									}
								: undefined
						}
					/>
				))}

				<ServiceTile
					to={estClient ? "/espace-client/mes-demandes" : `${base}/demandes`}
					icon={ClipboardList}
					label="Mes demandes"
					description="Suivez toutes vos demandes envoyées, tous services confondus."
					badge={
						totalEnCours > 0
							? { label: String(totalEnCours), variant: "lagoon" }
							: undefined
					}
				/>

				<ServiceTile
					to={`${base}/factures`}
					icon={ReceiptText}
					label="Mes factures"
					description="Téléchargez factures, reçus et tickets de tous vos services."
				/>

				<ServiceTile
					to={`${base}/panier`}
					icon={ShoppingCart}
					label="Mon panier"
					description="Vérifiez vos articles restaurant et boutique puis envoyez votre demande."
					badge={
						nombreArticlesPanier > 0
							? { label: String(nombreArticlesPanier), variant: "neutral" }
							: undefined
					}
				/>

				{estClient ? (
					<ServiceTile
						to="/espace-client/signalement"
						icon={Flag}
						label="Signaler un problème"
						description="Décrivez un souci dans nos locaux ou services."
					/>
				) : (
					<>
						{canPortail ? (
							<ServiceTile
								to="/residence/portail/signalements"
								icon={Flag}
								label="Mes signalements"
								description="Signalez un problème et suivez son traitement."
							/>
						) : null}
						{canVoirSignalements ? (
							<ServiceTile
								to="/signalements"
								icon={AlertCircle}
								label="Signalements"
								description="Vos signalements et leur suivi."
							/>
						) : null}
					</>
				)}
			</div>

			{!estClient ? (
				<>
					<section className="space-y-4">
						<h2 className="text-lg font-semibold text-foreground">
							Ma résidence
						</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{RESIDENCE.map((lien) => (
								<ServiceTile key={lien.to} {...lien} />
							))}
						</div>
					</section>

					{resumeQuery.isError ? (
						<div
							role="alert"
							className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
						>
							<p>
								Impossible de charger le récapitulatif de votre situation
								locative.
							</p>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full"
								onClick={() => void resumeQuery.refetch()}
							>
								Réessayer
							</Button>
						</div>
					) : null}

					{resume?.contrat_en_cours || resume?.prochaine_echeance ? (
						<div className="grid gap-4">
							{resume.contrat_en_cours ? (
								<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
									<h2 className="text-lg font-semibold text-foreground">
										Contrat en cours
									</h2>
									<dl className="mt-3 grid gap-4 lg:grid-cols-2">
										<Ligne
											label="Numéro"
											valeur={resume.contrat_en_cours.numero_contrat}
										/>
										<Ligne
											label="Logement"
											valeur={`${resume.contrat_en_cours.logement.numero} — ${resume.contrat_en_cours.logement.nom} (bât. ${resume.contrat_en_cours.logement.batiment})`}
										/>
										<Ligne
											label="Montant du loyer"
											valeur={formatMontantFCFA(
												resume.contrat_en_cours.montant_loyer,
											)}
										/>
										<Ligne
											label="Périodicité"
											valeur={resume.contrat_en_cours.periodicite ?? "—"}
										/>
										<Ligne
											label="Début"
											valeur={formatDateISO(resume.contrat_en_cours.date_debut)}
										/>
										<Ligne
											label="Fin prévue"
											valeur={formatDateISO(
												resume.contrat_en_cours.date_fin_prevue,
											)}
										/>
									</dl>
								</section>
							) : null}

							{resume.prochaine_echeance ? (
								<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
									<h2 className="text-lg font-semibold text-foreground">
										Prochaine échéance
									</h2>
									<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
										<p className="text-sm text-muted-foreground">
											{libelleMoisAnnee(
												resume.prochaine_echeance.mois,
												resume.prochaine_echeance.annee,
											)}{" "}
											—{" "}
											<span className="font-semibold text-foreground">
												{formatMontantFCFA(resume.prochaine_echeance.montant)}
											</span>
										</p>
										<Badge
											variant={echeancePortailStatutVariant(
												resume.prochaine_echeance.statut,
											)}
										>
											{ECHEANCE_STATUT_LABELS[
												resume.prochaine_echeance.statut
											] ?? resume.prochaine_echeance.statut}
										</Badge>
									</div>
								</section>
							) : null}
						</div>
					) : null}
				</>
			) : null}
		</div>
	);
}
