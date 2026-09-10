import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Unlock, Users } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

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
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Caisses", to: "/finances/caisses" },
					{ label: dashboard.libelle },
				]}
			/>
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button asChild variant="ghost" size="sm">
						<Link to="/finances/caisses">
							<ArrowLeft className="size-4 mr-2" />
							Retour aux caisses
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-foreground">
							{dashboard.libelle}
						</h1>
						<p className="text-sm text-muted-foreground">
							Activité: {dashboard.id_activite}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
							etatCaisse === "ouverte"
								? "bg-[#27AE60]/20 text-[#27AE60]"
								: etatCaisse === "fermee"
									? "bg-[#95A5A6]/20 text-[#95A5A6]"
									: "bg-muted text-muted-foreground",
						)}
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
					</span>
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
			</div>

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
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											EMPLOYÉ
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right font-medium"
										>
											MONTANT TOTAL
										</th>
										<th
											scope="col"
											className="px-4 py-3 text-right font-medium"
										>
											NB PAIEMENTS
										</th>
									</tr>
								</thead>
								<tbody>
									{revenusParUser.map((rev) => (
										<tr
											key={rev.id_utilisateur}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-4 py-3 font-medium text-foreground">
												{rev.login}
											</td>
											<td className="px-4 py-3 text-right font-semibold text-foreground">
												{formatMontantFCFA(String(rev.montant_total))}
											</td>
											<td className="px-4 py-3 text-right text-muted-foreground">
												{rev.nombre_paiements}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							Aucun paiement pour cette caisse
						</div>
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
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-sm">
								<thead className="bg-sea-ink text-left text-white">
									<tr>
										<th scope="col" className="px-4 py-3 font-medium">
											DATE
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											RÉFÉRENCE
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											MONTANT
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											TYPE
										</th>
										<th scope="col" className="px-4 py-3 font-medium">
											MOTIF
										</th>
									</tr>
								</thead>
								<tbody>
									{dashboard.paiements_details.map((paiement) => (
										<tr
											key={paiement.id}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-4 py-3 text-muted-foreground">
												{formatDateHeureISO(paiement.date)}
											</td>
											<td className="px-4 py-3 font-medium">
												{paiement.reference ?? "—"}
											</td>
											<td className="px-4 py-3 font-semibold text-foreground">
												{formatMontantFCFA(String(paiement.montant))}
											</td>
											<td className="px-4 py-3">
												<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
													{paiement.type}
												</span>
											</td>
											<td className="px-4 py-3 text-muted-foreground">
												{paiement.motif ?? "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							Aucun paiement trouvé
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
