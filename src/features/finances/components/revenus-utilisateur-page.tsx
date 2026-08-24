import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Breadcrumb } from "#/components/ui/breadcrumb";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { obtenirRevenusParUtilisateur } from "../api/caisses";
import { listerCaisses } from "../api/caisses";
import { useCurrentCaisse } from "../hooks/use-current-caisse";

/**
 * Page "Revenus par utilisateur" — agrégation des montants encaissés par chaque
 * employé, filtrée optionnellement par caisse et période.
 */
export function RevenusUtilisateurPage() {
	const userCaisse = useCurrentCaisse();
	const [du, setDu] = useState("");
	const [au, setAu] = useState("");
	const [idCaisse, setIdCaisse] = useState(userCaisse ?? "");

	const { data: caisses = [] } = useQuery({
		queryKey: ["caisses"],
		queryFn: () => listerCaisses(),
	});

	const { data: revenus = [], isLoading } = useQuery({
		queryKey: ["revenus-utilisateur", idCaisse || userCaisse, du, au],
		queryFn: () =>
			obtenirRevenusParUtilisateur(idCaisse || userCaisse || "", du, au),
		enabled: !!(idCaisse || userCaisse),
	});

	const totalMontant = revenus.reduce(
		(sum, rev) => sum + Number(rev.montant_total),
		0,
	);
	const totalPaiements = revenus.reduce(
		(sum, rev) => sum + rev.nombre_paiements,
		0,
	);

	return (
		<div className="space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Finances", to: "/finances/tableau-de-bord" },
					{ label: "Revenus par employé" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Revenus par employé
				</h1>
				<p className="text-muted-foreground">
					Montant total encaissé par chaque utilisateur
				</p>
			</section>

			{/* Filtres */}
			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				{!userCaisse && (
					<select
						value={idCaisse}
						onChange={(e) => setIdCaisse(e.target.value)}
						className="h-9 rounded-md border border-input bg-background px-3 text-sm"
					>
						<option value="">Toutes les caisses</option>
						{caisses.map((c) => (
							<option key={c.id_caisse} value={c.id_caisse}>
								{c.libelle}
							</option>
						))}
					</select>
				)}

				<Input
					type="date"
					value={du}
					onChange={(e) => setDu(e.target.value)}
					aria-label="Début de période"
					className="w-40"
					placeholder="Du"
				/>
				<Input
					type="date"
					value={au}
					onChange={(e) => setAu(e.target.value)}
					aria-label="Fin de période"
					className="w-40"
					placeholder="Au"
				/>
			</div>

			{/* Résumé */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Montant total
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-foreground">
							{formatMontantFCFA(totalMontant)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{revenus.length} employé(s)
						</p>
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
							{totalPaiements}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							paiements effectués
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Tableau */}
			<Card>
				<CardHeader>
					<CardTitle>Détail par employé</CardTitle>
					<CardDescription>
						Montant total et nombre de paiements par utilisateur
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Chargement…
						</div>
					) : revenus.length > 0 ? (
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
									<TableHead className="text-right">
										Montant moyen
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{revenus
									.sort(
										(a, b) =>
											Number(b.montant_total) -
											Number(a.montant_total),
									)
									.map((rev) => (
										<TableRow key={rev.id_utilisateur}>
											<TableCell className="font-medium">
												{rev.login}
											</TableCell>
											<TableCell className="text-right">
												{formatMontantFCFA(
													rev.montant_total,
												)}
											</TableCell>
											<TableCell className="text-right">
												{rev.nombre_paiements}
											</TableCell>
											<TableCell className="text-right text-muted-foreground">
												{formatMontantFCFA(
													Number(rev.montant_total) /
														rev.nombre_paiements,
												)}
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							Aucun paiement trouvé pour ces critères.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
