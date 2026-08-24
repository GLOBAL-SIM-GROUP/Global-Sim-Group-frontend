import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import {
	obtenirDashboardCaisse,
	obtenirRevenusParUtilisateur,
} from "../api/caisses";

interface CaisseDashboardPageProps {
	id: string;
}

/**
 * Tableau de bord d'une caisse spécifique.
 * Affiche: revenus du jour, total, paiements bruts, revenus par utilisateur.
 */
export function CaisseDashboardPage({ id }: CaisseDashboardPageProps) {
	const { data: dashboard, isLoading } = useQuery({
		queryKey: ["caisse-dashboard", id],
		queryFn: () => obtenirDashboardCaisse(id),
	});

	const { data: revenusParUser = [] } = useQuery({
		queryKey: ["revenus-utilisateur", id],
		queryFn: () => obtenirRevenusParUtilisateur(id),
		enabled: !!dashboard,
	});

	if (isLoading) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				Chargement…
			</div>
		);
	}

	if (!dashboard) {
		return (
			<div className="p-6 text-center text-destructive">
				Caisse non trouvée
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					asChild
					variant="ghost"
					size="sm"
				>
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

			{/* KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Revenus aujourd'hui
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-foreground">
							{formatMontantFCFA(dashboard.revenus_jour)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total paiements
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-foreground">
							{formatMontantFCFA(dashboard.total_paiements)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total dépenses
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-destructive">
							{formatMontantFCFA(dashboard.total_depenses)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Revenus par utilisateur */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="size-5" />
						Revenus par employé
					</CardTitle>
					<CardDescription>
						Montant total encaissé par chaque utilisateur
					</CardDescription>
				</CardHeader>
				<CardContent>
					{revenusParUser.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employé</TableHead>
									<TableHead className="text-right">
										Montant total
									</TableHead>
									<TableHead className="text-right">
										Nombre de paiements
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{revenusParUser.map((rev) => (
									<TableRow key={rev.id_utilisateur}>
										<TableCell className="font-medium">
											{rev.login}
										</TableCell>
										<TableCell className="text-right">
											{formatMontantFCFA(rev.montant_total)}
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{rev.nombre_paiements}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							Aucun paiement pour cette caisse
						</div>
					)}
				</CardContent>
			</Card>

			{/* Paiements bruts */}
			<Card>
				<CardHeader>
					<CardTitle>Tous les paiements</CardTitle>
					<CardDescription>
						Liste détaillée de tous les paiements de cette caisse
					</CardDescription>
				</CardHeader>
				<CardContent>
					{dashboard.paiements_details && dashboard.paiements_details.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Référence</TableHead>
									<TableHead>Montant</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Motif</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dashboard.paiements_details.map((paiement) => (
									<TableRow key={paiement.id}>
										<TableCell className="text-sm">
											{formatDateHeureISO(paiement.date)}
										</TableCell>
										<TableCell>{paiement.reference ?? "—"}</TableCell>
										<TableCell className="font-medium">
											{formatMontantFCFA(paiement.montant)}
										</TableCell>
										<TableCell>
											<span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
												{paiement.type}
											</span>
										</TableCell>
										<TableCell>{paiement.motif ?? "—"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							Aucun paiement trouvé
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
