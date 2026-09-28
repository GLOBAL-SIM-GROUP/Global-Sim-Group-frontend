import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Lock, Receipt, Unlock } from "lucide-react";
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
	formatDateInstantUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import {
	fermerCaisse,
	obtenirDashboardCaisse,
	ouvrirCaisse,
} from "../api/caisses";
import { useMesCaisses } from "../hooks/use-mes-caisses";

/**
 * État d'ouverture connu de la caisse dans CETTE session : pas de GET dédié
 * côté backend pour lire l'état courant au chargement de la page — `inconnu`
 * tant qu'aucun appel `ouvrir`/`fermer` n'a été fait ici. L'état est persisté
 * dans le cache TanStack Query (clé `["caisse-etat", id]`) pour survivre aux
 * navigations entre pages — un `useState` local serait réinitialisé à chaque
 * démontage du composant.
 */
type EtatCaisse = "inconnu" | "ouverte" | "fermee";

/**
 * Tableau de bord personnel du caissier (M8). `GET /finances/caisses` est
 * scopé côté backend : un utilisateur assigné voit uniquement sa caisse. Pas
 * d'ID dans l'URL — la caisse est résolue depuis cette liste, jamais depuis
 * `/auth/me` (qui n'expose pas d'`id_caisse`).
 */
export function CaissierDashboardPage() {
	const canVoir = useCan("FINANCES.VOIR");
	const canCreer = useCan("FINANCES.CREER");
	const queryClient = useQueryClient();
	const { data: caisses, isLoading: caissesLoading } = useMesCaisses();
	const [idChoisi, setIdChoisi] = useState<string | null>(null);
	const [caisseActionPending, setCaisseActionPending] = useState(false);
	const [caisseActionError, setCaisseActionError] = useState<string | null>(
		null,
	);

	const idCaisse = caisses?.length === 1 ? caisses[0].id_caisse : idChoisi;

	// État d'ouverture persisté dans le cache Query (survit aux navigations).
	const etatCaisse: EtatCaisse =
		(idCaisse
			? queryClient.getQueryData<EtatCaisse>(["caisse-etat", idCaisse])
			: null) ?? "inconnu";

	const setEtatCaisse = (etat: EtatCaisse) => {
		if (idCaisse) queryClient.setQueryData(["caisse-etat", idCaisse], etat);
	};

	const { data: dashboard, isLoading: dashboardLoading } = useQuery({
		queryKey: ["finances", "caisse-dashboard", idCaisse],
		queryFn: () => {
			if (!idCaisse) throw new Error("idCaisse manquant");
			return obtenirDashboardCaisse(idCaisse);
		},
		enabled: !!idCaisse,
	});

	const handleOuvrir = async () => {
		if (!idCaisse) return;
		setCaisseActionError(null);
		setCaisseActionPending(true);
		try {
			await ouvrirCaisse(idCaisse);
			setEtatCaisse("ouverte");
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 409) {
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
		if (!idCaisse) return;
		setCaisseActionError(null);
		setCaisseActionPending(true);
		try {
			await fermerCaisse(idCaisse);
			setEtatCaisse("fermee");
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 404) {
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

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux caisses.
			</div>
		);
	}

	if (caissesLoading) {
		return (
			<div className="p-6 text-center text-sm text-muted-foreground">
				Chargement…
			</div>
		);
	}

	if (!caisses || caisses.length === 0) {
		return (
			<div className="w-full space-y-6 p-6">
				<PageHeader
					breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Ma caisse" }]}
					title="Ma caisse"
				/>
				<EmptyState title="Aucune caisse ne vous est assignée." />
			</div>
		);
	}

	// Plusieurs caisses (ex. un admin consultant cette page) : choix explicite.
	if (caisses.length > 1 && !idCaisse) {
		return (
			<div className="w-full space-y-6 p-6">
				<PageHeader
					breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Ma caisse" }]}
					title="Ma caisse"
					description="Plusieurs caisses accessibles — choisissez-en une."
				/>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{caisses.map((c) => (
						<button
							key={c.id_caisse}
							type="button"
							onClick={() => setIdChoisi(c.id_caisse)}
							className="rounded-lg border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent/40"
						>
							<div className="font-medium text-foreground">{c.libelle}</div>
							<div className="text-sm text-muted-foreground">
								{c.activite_libelle || c.id_activite}
							</div>
						</button>
					))}
				</div>
			</div>
		);
	}

	if (dashboardLoading || !dashboard) {
		return (
			<div className="p-6 text-center text-sm text-muted-foreground">
				Chargement du tableau de bord…
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Ma caisse" }]}
				title={dashboard.libelle}
				description={
					dashboard.activite_libelle || `Activité ${dashboard.id_activite}`
				}
				actions={
					<div className="flex items-center gap-2">
						<Badge variant={etatCaisse === "ouverte" ? "success" : "neutral"}>
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

			{canCreer ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<Button asChild variant="outline" className="justify-start">
						<Link to="/residence/echeances">
							<CalendarClock className="size-4" aria-hidden />
							Encaisser une échéance
						</Link>
					</Button>
					<Button asChild variant="outline" className="justify-start">
						<Link to="/residence/sejours-courts">
							<Receipt className="size-4" aria-hidden />
							Paiement séjour court
						</Link>
					</Button>
					<Button asChild variant="outline" className="justify-start">
						<Link to="/finances/encaissements">
							<Receipt className="size-4" aria-hidden />
							Voir les encaissements
						</Link>
					</Button>
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Revenus du jour
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(dashboard.revenus_jour.toString())}
					</div>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total paiements
					</div>
					<div className="text-2xl font-bold text-foreground">
						{formatMontantFCFA(dashboard.total_paiements.toString())}
					</div>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Total dépenses
					</div>
					<div className="text-2xl font-bold text-destructive">
						{formatMontantFCFA(dashboard.total_depenses.toString())}
					</div>
				</div>
			</div>

			{dashboard.paiements_details && dashboard.paiements_details.length > 0 ? (
				<div className="rounded-lg border border-border bg-card shadow-sm">
					<div className="border-b border-border px-6 py-4">
						<h2 className="text-base font-semibold text-foreground">
							Paiements du jour
						</h2>
					</div>
					<TableShell>
						<DataTable>
							<DataTableHead>
								<tr>
									<Th>DATE</Th>
									<Th>TYPE</Th>
									<Th>MOTIF</Th>
									<Th className="text-right">MONTANT</Th>
								</tr>
							</DataTableHead>
							<tbody>
								{dashboard.paiements_details.map((p) => (
									<Tr key={p.id}>
										<Td className="text-muted-foreground">
											{formatDateInstantUTC(p.date)}
										</Td>
										<Td>
											<Badge
												variant={
													p.type === "ENCAISSEMENT" ? "success" : "danger"
												}
											>
												{p.type}
											</Badge>
										</Td>
										<Td className="text-muted-foreground">{p.motif || "—"}</Td>
										<Td className="text-right font-semibold">
											{formatMontantFCFA(p.montant.toString())}
										</Td>
									</Tr>
								))}
							</tbody>
						</DataTable>
					</TableShell>
				</div>
			) : (
				<EmptyState title="Aucun paiement enregistré aujourd'hui." />
			)}
		</div>
	);
}
