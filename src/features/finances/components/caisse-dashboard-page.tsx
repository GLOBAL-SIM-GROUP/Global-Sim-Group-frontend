import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import {
	obtenirDashboardCaisse,
	obtenirRevenusParUtilisateur,
} from "../api/caisses";
import { useCreerTirage, useTirages } from "../hooks/use-tirages";
import type { CreerTirageDto } from "../models/tirages";

interface CaisseDashboardPageProps {
	id: string;
}

/**
 * Tableau de bord d'une caisse spécifique.
 * Affiche: revenus du jour, total, paiements bruts, revenus par utilisateur, tirages.
 */
export function CaisseDashboardPage({ id }: CaisseDashboardPageProps) {
	const [openTirage, setOpenTirage] = useState(false);
	const [tirageForms, setTirageForms] = useState<CreerTirageDto>({
		montant_compte: "",
		date: new Date().toISOString().split("T")[0],
		id_caisse: id,
		note: "",
	});

	const { data: dashboard, isLoading } = useQuery({
		queryKey: ["caisse-dashboard", id],
		queryFn: () => obtenirDashboardCaisse(id),
	});

	const { data: revenusParUser = [] } = useQuery({
		queryKey: ["revenus-utilisateur", id],
		queryFn: () => obtenirRevenusParUtilisateur(id),
		enabled: !!dashboard,
	});

	const { data: tirages = [] } = useTirages({ id_caisse: id });
	const creerTirageMut = useCreerTirage();

	const handleCreerTirage = () => {
		if (!tirageForms.montant_compte || !tirageForms.date) return;
		creerTirageMut.mutate(
			{
				...tirageForms,
				montant_compte: Number(tirageForms.montant_compte),
			},
			{
				onSuccess: () => {
					setTirageForms({
						montant_compte: "",
						date: new Date().toISOString().split("T")[0],
						id_caisse: id,
						note: "",
					});
					setOpenTirage(false);
				},
			},
		);
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
		<>
			{/* Dialog Tirage */}
			<Dialog.Root open={openTirage} onOpenChange={setOpenTirage}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
						<Dialog.Title className="text-base font-semibold text-foreground">
							Fermer la caisse (Tirage)
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-muted-foreground">
							Enregistrez le montant compté et l'écart sera calculé
							automatiquement.
						</Dialog.Description>
						<div className="mt-6 space-y-4">
							<div>
								<label className="text-sm font-medium">Date</label>
								<Input
									type="date"
									value={tirageForms.date}
									onChange={(e) =>
										setTirageForms({ ...tirageForms, date: e.target.value })
									}
								/>
							</div>
							<div>
								<label className="text-sm font-medium">Montant compté</label>
								<Input
									type="number"
									step="0.01"
									value={tirageForms.montant_compte}
									onChange={(e) =>
										setTirageForms({
											...tirageForms,
											montant_compte: e.target.value,
										})
									}
									placeholder="0.00"
								/>
							</div>
							<div>
								<label className="text-sm font-medium">Note (optionnel)</label>
								<Input
									value={tirageForms.note || ""}
									onChange={(e) =>
										setTirageForms({
											...tirageForms,
											note: e.target.value || null,
										})
									}
									placeholder="ex. Versement en banque"
								/>
							</div>
							<div className="flex gap-2 justify-end pt-2">
								<Button variant="outline" onClick={() => setOpenTirage(false)}>
									Annuler
								</Button>
								<Button
									onClick={handleCreerTirage}
									disabled={creerTirageMut.isPending}
								>
									{creerTirageMut.isPending ? "Enregistrement…" : "Enregistrer"}
								</Button>
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
				{/* Header */}
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

				{/* Tirages */}
				<div className="rounded-lg border border-border bg-card shadow-sm">
					<div className="border-b border-border px-6 py-4 flex items-center justify-between">
						<div>
							<h2 className="text-base font-semibold text-foreground">
								Fermetures de caisse (Tirages)
							</h2>
							<p className="text-sm text-muted-foreground mt-1">
								Historique des fermetures avec montant compté vs attendu
							</p>
						</div>
						<Button size="sm" onClick={() => setOpenTirage(true)}>
							<Plus className="size-4 mr-2" />
							Nouveau tirage
						</Button>
					</div>
					<div className="px-6 py-4">
						{tirages.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse text-sm">
									<thead className="bg-sea-ink text-left text-white">
										<tr>
											<th scope="col" className="px-4 py-3 font-medium">
												DATE
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-right font-medium"
											>
												MONTANT COMPTÉ
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-right font-medium"
											>
												MONTANT ATTENDU
											</th>
											<th
												scope="col"
												className="px-4 py-3 text-right font-medium"
											>
												ÉCART
											</th>
											<th scope="col" className="px-4 py-3 font-medium">
												NOTE
											</th>
										</tr>
									</thead>
									<tbody>
										{tirages.map((tirage) => (
											<tr
												key={tirage.id}
												className="border-t border-border transition-colors hover:bg-accent/40"
											>
												<td className="px-4 py-3 text-muted-foreground">
													{formatDateHeureISO(tirage.date)}
												</td>
												<td className="px-4 py-3 text-right font-semibold text-foreground">
													{formatMontantFCFA(String(tirage.montant_compte))}
												</td>
												<td className="px-4 py-3 text-right text-muted-foreground">
													{tirage.montant_attendu
														? formatMontantFCFA(String(tirage.montant_attendu))
														: "—"}
												</td>
												<td className="px-4 py-3 text-right">
													{tirage.ecart !== undefined ? (
														<span
															className={
																tirage.ecart === 0
																	? "text-green-600 dark:text-green-400 font-semibold"
																	: "text-orange-600 dark:text-orange-400 font-semibold"
															}
														>
															{tirage.ecart >= 0 ? "+" : ""}
															{formatMontantFCFA(String(tirage.ecart))}
														</span>
													) : (
														"—"
													)}
												</td>
												<td className="px-4 py-3 text-muted-foreground text-xs">
													{tirage.note ?? "—"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								Aucun tirage enregistré pour cette caisse
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
