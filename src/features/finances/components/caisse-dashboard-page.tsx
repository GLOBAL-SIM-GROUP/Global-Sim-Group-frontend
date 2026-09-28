import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Unlock, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import {
	fermerCaisse,
	obtenirDashboardCaisse,
	obtenirRevenusParUtilisateur,
	ouvrirCaisse,
} from "../api/caisses";

/**
 * État d'ouverture connu de la caisse dans CETTE session : pas de GET dédié
 * côté backend pour lire l'état courant au chargement de la page — `inconnu`
 * tant qu'aucun appel `ouvrir`/`fermer` n'a été fait ici. L'état est persisté
 * dans le cache TanStack Query (clé `["caisse-etat", id]`) pour surviver aux
 * navigations entre pages.
 */
type EtatCaisse = "inconnu" | "ouverte" | "fermee";

interface CaisseDashboardPageProps {
	id: string;
}

/**
 * Tableau de bord d'une caisse spécifique.
 * Affiche: revenus du jour, total, paiements bruts, revenus par utilisateur.
 */
export function CaisseDashboardPage({ id }: CaisseDashboardPageProps) {
	const canCreer = useCan("FINANCES.CREER");
	const queryClient = useQueryClient();
	const etatCaisse: EtatCaisse =
		queryClient.getQueryData<EtatCaisse>(["caisse-etat", id]) ?? "inconnu";
	const setEtatCaisse = (etat: EtatCaisse) => {
		queryClient.setQueryData(["caisse-etat", id], etat);
	};
	const [caisseActionPending, setCaisseActionPending] = useState(false);
	const [caisseActionError, setCaisseActionError] = useState<string | null>(
		null,
	);

	const { data: dashboard, isLoading } = useQuery({
		queryKey: ["caisse-dashboard", id],
		queryFn: () => obtenirDashboardCaisse(id),
	});

	const { data: revenusParUser = [] } = useQuery({
		queryKey: ["revenus-utilisateur", id],
		queryFn: () => obtenirRevenusParUtilisateur(id),
		enabled: !!dashboard,
	});

	const handleOuvrir = async () => {
		setCaisseActionError(null);
		setCaisseActionPending(true);
		try {
			await ouvrirCaisse(id);
			setEtatCaisse("ouverte");
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 409) {
				// Déjà ouverte — pas un échec, juste un état qu'on ne connaissait pas.
				setEtatCaisse("ouverte");
			} else {
				setCaisseActionError(
					apiError.message || "Impossible d'ouvrir la caisse.",
				);
			}
		} finally {
			setCaisseActionPending(false);
		}
	};

	const handleFermer = async () => {
		setCaisseActionError(null);
		setCaisseActionPending(true);
		try {
			await fermerCaisse(id);
			setEtatCaisse("fermee");
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 404) {
				// Déjà fermée — pas un échec, juste un état qu'on ne connaissait pas.
				setEtatCaisse("fermee");
			} else {
				setCaisseActionError(
					apiError.message || "Impossible de fermer la caisse.",
				);
			}
		} finally {
			setCaisseActionPending(false);
		}
	};

	if (isLoading) {
		return (
			<div className="p-6 text-center text-muted-foreground">Chargement…</div>
		);
	}

	if (!dashboard) {
		return (
			<div className="p-6 text-center text-destructive">Caisse non trouvée</div>
		);
	}

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Caisses", to: "/finances/caisses" },
					{ label: dashboard.libelle },
				]}
				title={dashboard.libelle}
				description={`Activité: ${dashboard.id_activite}`}
				actions={
					<div className="flex items-center gap-2">
						<Button asChild variant="ghost" size="sm">
							<Link to="/finances/caisses">
								<ArrowLeft className="size-4 mr-2" />
								Retour aux caisses
							</Link>
						</Button>
						<Badge
							variant={
								etatCaisse === "ouverte"
									? "success"
									: etatCaisse === "fermee"
										? "neutral"
										: "neutral"
							}
						>
							{etatCaisse === "ouverte" ? (
								<Unlock className="size-3.5" aria-hidden />
							) : (
								<Lock className="size-3.5" aria-hidden />
							)}
							{etatCaisse === "ouverte"
								? "Caisse ouverte"
								: etatCaisse === "fermee"
									? "Caisse fermée"
									: "État inconnu"}
						</Badge>
						{canCreer ? (
							<>
								{etatCaisse !== "ouverte" ? (
									<Button
										size="sm"
										variant="outline"
										disabled={caisseActionPending}
										onClick={() => void handleOuvrir()}
									>
										<Unlock className="size-4" aria-hidden />
										Ouvrir la caisse
									</Button>
								) : null}
								{etatCaisse !== "fermee" ? (
									<Button
										size="sm"
										variant="outline"
										disabled={caisseActionPending}
										onClick={() => void handleFermer()}
									>
										<Lock className="size-4" aria-hidden />
										Fermer la caisse
									</Button>
								) : null}
							</>
						) : null}
					</div>
				}
			/>

			{caisseActionError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{caisseActionError}
				</p>
			) : null}

			{/* KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Revenus aujourd'hui
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(String(dashboard.revenus_jour))}
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total paiements
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(String(dashboard.total_paiements))}
					</div>
				</div>

				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total dépenses
					</div>
					<div className="text-2xl font-bold text-destructive">
						{formatMontantFCFA(String(dashboard.total_depenses))}
					</div>
				</div>
			</div>

			{/* Revenus par utilisateur */}
			<div className="rounded-lg border border-border bg-card shadow-sm">
				<div className="border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground flex items-center gap-2">
						<Users className="size-5" />
						Revenus par employé
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Montant total encaissé par chaque utilisateur
					</p>
				</div>
				<div className="px-6 py-4">
					{revenusParUser.length > 0 ? (
						<TableShell>
							<DataTable>
								<DataTableHead>
									<tr>
										<Th>EMPLOYÉ</Th>
										<Th className="text-right">MONTANT TOTAL</Th>
										<Th className="text-right">NB PAIEMENTS</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{revenusParUser.map((rev) => (
										<Tr key={rev.id_utilisateur}>
											<Td className="font-medium text-foreground">
												{rev.login}
											</Td>
											<Td className="text-right font-semibold text-foreground">
												{formatMontantFCFA(String(rev.montant_total))}
											</Td>
											<Td className="text-right text-muted-foreground">
												{rev.nombre_paiements}
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>
						</TableShell>
					) : (
						<EmptyState title="Aucun paiement pour cette caisse." />
					)}
				</div>
			</div>

			{/* Paiements bruts */}
			<div className="rounded-lg border border-border bg-card shadow-sm">
				<div className="border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						Tous les paiements
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Liste détaillée de tous les paiements de cette caisse
					</p>
				</div>
				<div className="px-6 py-4">
					{dashboard.paiements_details &&
					dashboard.paiements_details.length > 0 ? (
						<TableShell>
							<DataTable>
								<DataTableHead>
									<tr>
										<Th>DATE</Th>
										<Th>RÉFÉRENCE</Th>
										<Th>MONTANT</Th>
										<Th>TYPE</Th>
										<Th>MOTIF</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{dashboard.paiements_details.map((paiement) => (
										<Tr key={paiement.id}>
											<Td className="text-muted-foreground">
												{formatDateHeureISO(paiement.date)}
											</Td>
											<Td className="font-medium">
												{paiement.reference ?? "—"}
											</Td>
											<Td className="font-semibold text-foreground">
												{formatMontantFCFA(String(paiement.montant))}
											</Td>
											<Td>
												<Badge variant="info">{paiement.type}</Badge>
											</Td>
											<Td className="text-muted-foreground">
												{paiement.motif ?? "—"}
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>
						</TableShell>
					) : (
						<EmptyState title="Aucun paiement trouvé." />
					)}
				</div>
			</div>
		</div>
	);
}
