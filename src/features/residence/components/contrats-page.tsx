import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import type { ContratCree } from "../api/contrats";
import { useClientsDetails } from "../hooks/use-clients";
import { useActiverContrat, useContrats } from "../hooks/use-contrats";
import { useLogementsParId } from "../hooks/use-logements";
import { nomComplet } from "../models/clients";
import {
	type ContratJoin,
	type ContratStatutFiltre,
	filtrerContrats,
	paginerContrats,
} from "../models/contrats";
import { CONTRATS_PAGE_SIZE } from "../permissions";
import { ConfirmDialog } from "./confirm-dialog";
import { ContratFilters } from "./contrat-filters";
import { ContratFormDialog } from "./contrat-form-dialog";
import { ContratTable } from "./contrat-table";

/** Filtres/pagination reflétés dans l'URL (liens partageables). */
export interface ContratsSearch {
	statut?: ContratStatutFiltre;
	locataire?: string;
	logement?: string;
	du?: string;
	au?: string;
	page?: number;
}

interface ContratsPageProps {
	/** Valeurs initiales lues depuis l'URL (validateSearch de la route). */
	initialSearch: ContratsSearch;
	/**
	 * Réécrit la search de la route à partir de l'URL actuelle. La feature ne
	 * connaît pas la route : la navigation est injectée par la colle (route).
	 */
	onSearchChange: (maj: (prev: ContratsSearch) => ContratsSearch) => void;
}

/**
 * Page « Contrats de location » (module Résidence, M2.2) : liste de tous les
 * contrats longue durée. Les noms des locataires et les numéros de logement
 * sont résolus par id via les caches (le lister ne les embarque pas). Filtres
 * et pagination côté client. Action réelle : « Voir la fiche » et « Activer »
 * (EN_ATTENTE) — pas de Modifier/Résilier/Générer les échéances (aucun endpoint).
 */
export function ContratsPage({
	initialSearch,
	onSearchChange,
}: ContratsPageProps) {
	const canCreer = useCan("RESIDENCE.CREER");
	const canModifier = useCan("RESIDENCE.MODIFIER");

	const contratsQuery = useContrats();
	const activerMutation = useActiverContrat();

	const [statut, setStatut] = useState<ContratStatutFiltre>(
		initialSearch.statut ?? "tous",
	);
	const [locataire, setLocataire] = useState(initialSearch.locataire ?? "");
	const [logement, setLogement] = useState(initialSearch.logement ?? "");
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [aActiver, setAActiver] = useState<ContratJoin | null>(null);
	// Modale de création d'un contrat (au-dessus de la liste, pas de route).
	const [formOuvert, setFormOuvert] = useState(false);
	// Encart affiché après création si un compte portail a été provisionné.
	const [compteResidentCree, setCompteResidentCree] =
		useState<ContratCree["compteResident"]>(null);

	const contrats = contratsQuery.data ?? [];
	const clientIds = useMemo(() => contrats.map((c) => c.id_client), [contrats]);
	const logementIds = useMemo(
		() => contrats.map((c) => c.id_logement),
		[contrats],
	);
	const clientsDetails = useClientsDetails(clientIds);
	const logementsDetails = useLogementsParId(logementIds);

	// Jointure des noms/numéros : « … » tant que les caches chargent.
	const joins: ContratJoin[] = useMemo(
		() =>
			contrats.map((contrat) => {
				const client = clientsDetails.data?.get(contrat.id_client);
				const logementObjet = logementsDetails.data?.get(contrat.id_logement);
				return {
					...contrat,
					clientNom: client
						? nomComplet(client)
						: clientsDetails.isLoading
							? "…"
							: "—",
					logementNumero:
						logementObjet?.numero ?? (logementsDetails.isLoading ? "…" : "—"),
				};
			}),
		[
			contrats,
			clientsDetails.data,
			clientsDetails.isLoading,
			logementsDetails.data,
			logementsDetails.isLoading,
		],
	);

	/** Met à jour un filtre, remet à la page 1 et reflète le tout dans l'URL. */
	const changerFiltre = (patch: {
		statut?: ContratStatutFiltre;
		locataire?: string;
		logement?: string;
		du?: string;
		au?: string;
	}) => {
		setStatut(patch.statut ?? statut);
		setLocataire(patch.locataire ?? locataire);
		setLogement(patch.logement ?? logement);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const filtres = filtrerContrats(joins, {
		statut,
		locataire,
		logement,
		du,
		au,
	});
	const pagination = paginerContrats(filtres, page, CONTRATS_PAGE_SIZE);

	// Feedback inline (aucun toast installé) : succès/erreur de l'activation.
	const feedback = activerMutation.isError
		? { type: "error" as const, texte: "Une erreur est survenue." }
		: activerMutation.isSuccess
			? { type: "success" as const, texte: "Contrat activé avec succès." }
			: null;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Contrats de location" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Contrats de location
					</h1>
					<p className="text-muted-foreground">
						Liste de tous les contrats de location longue durée (mensuels ou
						annuels).
					</p>
				</section>

				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Nouveau contrat
					</Button>
				) : null}
			</div>

			{feedback ? (
				<div
					role={feedback.type === "error" ? "alert" : "status"}
					className={cn(
						"flex items-center justify-between gap-3 rounded-md border px-4 py-2 text-sm",
						feedback.type === "error"
							? "border-destructive/40 bg-destructive/10 text-destructive"
							: "border-[#27AE60]/40 bg-[#27AE60]/10 text-[#27AE60]",
					)}
				>
					<span>{feedback.texte}</span>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Fermer"
						onClick={() => activerMutation.reset()}
					>
						<X className="size-4" aria-hidden />
					</Button>
				</div>
			) : null}

			{compteResidentCree ? (
				<output className="flex items-center justify-between gap-3 rounded-md border border-lagoon/40 bg-lagoon/10 px-4 py-2 text-sm text-lagoon">
					<span>
						{compteResidentCree.emailEnvoye ? (
							<>
								Compte résident créé (identifiant :{" "}
								<strong>{compteResidentCree.login}</strong>) — un email a été
								envoyé au client pour définir son mot de passe.
							</>
						) : (
							<>
								Compte résident créé (identifiant :{" "}
								<strong>{compteResidentCree.login}</strong>) mais aucun email
								n'est enregistré pour ce client — le compte reste inactif.
								Ajoutez un email au dossier client puis déclenchez une
								réinitialisation depuis l'écran d'administration pour l'activer.
							</>
						)}
					</span>
					<Button
						variant="ghost"
						size="sm"
						aria-label="Fermer"
						onClick={() => setCompteResidentCree(null)}
					>
						<X className="size-4" aria-hidden />
					</Button>
				</output>
			) : null}

			<ContratFilters
				statut={statut}
				locataire={locataire}
				logement={logement}
				du={du}
				au={au}
				onStatutChange={(valeur) => changerFiltre({ statut: valeur })}
				onLocataireChange={(valeur) => changerFiltre({ locataire: valeur })}
				onLogementChange={(valeur) => changerFiltre({ logement: valeur })}
				onDuChange={(valeur) => changerFiltre({ du: valeur })}
				onAuChange={(valeur) => changerFiltre({ au: valeur })}
			/>

			{contratsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : contratsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les contrats.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void contratsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : (
				<ContratTable
					contrats={pagination.items}
					onActiver={
						canModifier ? (contrat) => setAActiver(contrat) : undefined
					}
				/>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des contrats"
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<p className="text-sm text-muted-foreground">
						Affichage de {pagination.start} à {pagination.end} sur{" "}
						{pagination.total} résultats
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page <= 1}
							onClick={() => allerPage(pagination.page - 1)}
						>
							Précédent
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page >= pagination.totalPages}
							onClick={() => allerPage(pagination.page + 1)}
						>
							Suivant
						</Button>
					</div>
				</nav>
			) : null}

			<ConfirmDialog
				open={aActiver !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAActiver(null);
				}}
				title="Activer le contrat"
				message={`Voulez-vous vraiment activer le contrat ${aActiver?.numero_contrat ?? ""} ?`}
				confirmLabel="Activer"
				cancelLabel="Annuler"
				busy={activerMutation.isPending}
				onConfirm={() => {
					if (aActiver) {
						activerMutation.mutate(aActiver.id, {
							onSettled: () => setAActiver(null),
						});
					}
				}}
			/>

			<ContratFormDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={(contrat) => {
					setFormOuvert(false);
					setCompteResidentCree(contrat.compteResident);
				}}
			/>
		</div>
	);
}
