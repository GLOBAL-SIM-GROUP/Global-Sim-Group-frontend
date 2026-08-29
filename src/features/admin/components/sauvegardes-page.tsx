import { Save } from "lucide-react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useConfigurationSauvegardes,
	useCreerSauvegardeManuelle,
	useMajConfigurationSauvegardes,
	useSauvegardes,
} from "../hooks/use-sauvegardes";
import {
	formatDateSauvegarde,
	formatTailleSauvegarde,
	SAUVEGARDE_STATUT_COULEURS,
	SAUVEGARDE_STATUT_LABELS,
	SAUVEGARDE_TYPE_LABELS,
} from "../models/sauvegardes";

/**
 * Page « Sauvegardes — Administration » (M11) : gestion des sauvegardes de
 * la base de données. Affiche l'historique, permet de déclencher une sauvegarde
 * manuelle, et de configurer la fréquence automatique. Actions sensibles
 * réservées à l'administrateur.
 */
export function SauvegardesPage() {
	const canModifier = useCan("ADMIN.MODIFIER");
	const sauvegardesQuery = useSauvegardes();
	const configQuery = useConfigurationSauvegardes();
	const creerMutation = useCreerSauvegardeManuelle();
	const majConfigMutation = useMajConfigurationSauvegardes();

	const sauvegardes = sauvegardesQuery.data ?? [];
	const config = configQuery.data;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Administration", to: "/admin/utilisateurs" },
					{ label: "Sauvegardes" },
				]}
			/>

			<section className="space-y-2">
				<h1 className="text-2xl font-semibold text-foreground">Sauvegardes</h1>
				<p className="text-muted-foreground">
					Gestion des sauvegardes de la base de données : consultation de
					l'historique, déclenchement manuel et planification.
				</p>
			</section>

			<div className="grid gap-6">
				{/* Configuration automatique */}
				{config && (
					<div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
						<h2 className="text-lg font-semibold">Sauvegardes automatiques</h2>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">État :</span>
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
										config.activee
											? "bg-[#27AE60]/20 text-[#27AE60]"
											: "bg-gray-500/20 text-gray-500",
									)}
								>
									{config.activee ? "Activée" : "Désactivée"}
								</span>
							</div>

							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Fréquence :
								</span>
								<select
									value={config.frequence}
									onChange={(e) =>
										majConfigMutation.mutate({
											frequence: e.target.value as
												| "quotidienne"
												| "hebdomadaire",
											activee: config.activee,
										})
									}
									disabled={!canModifier || majConfigMutation.isPending}
									className="rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								>
									<option value="quotidienne">Quotidienne</option>
									<option value="hebdomadaire">Hebdomadaire</option>
								</select>
							</div>

							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={config.activee}
									onChange={(e) =>
										majConfigMutation.mutate({
											frequence: config.frequence,
											activee: e.target.checked,
										})
									}
									disabled={!canModifier || majConfigMutation.isPending}
									className="h-4 w-4 rounded border-gray-300"
								/>
								<span className="text-sm">
									Activer les sauvegardes automatiques
								</span>
							</label>
						</div>
					</div>
				)}

				{/* Actions manuelles */}
				{canModifier ? (
					<div className="flex gap-2">
						<Button
							onClick={() => creerMutation.mutate()}
							disabled={creerMutation.isPending}
						>
							<Save className="mr-2 size-4" aria-hidden />
							{creerMutation.isPending
								? "Sauvegarde en cours…"
								: "Sauvegarder maintenant"}
						</Button>
					</div>
				) : null}

				{/* Historique */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">Historique</h2>

					{sauvegardesQuery.isLoading ? (
						<p className="text-sm text-muted-foreground">Chargement…</p>
					) : sauvegardesQuery.isError ? (
						<div
							role="alert"
							className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
						>
							<p>Impossible de charger l'historique.</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => sauvegardesQuery.refetch()}
							>
								Réessayer
							</Button>
						</div>
					) : sauvegardes.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Aucune sauvegarde enregistrée.
						</p>
					) : (
						<div className="overflow-x-auto rounded-lg border border-border">
							<table className="w-full text-sm">
								<thead className="bg-muted">
									<tr>
										<th className="px-4 py-3 text-left font-semibold">Date</th>
										<th className="px-4 py-3 text-left font-semibold">Type</th>
										<th className="px-4 py-3 text-left font-semibold">
											Taille
										</th>
										<th className="px-4 py-3 text-left font-semibold">
											Statut
										</th>
									</tr>
								</thead>
								<tbody>
									{sauvegardes.map((sauvegarde) => (
										<tr
											key={sauvegarde.id}
											className="border-t border-border hover:bg-muted/50"
										>
											<td className="px-4 py-3">
												{formatDateSauvegarde(sauvegarde.date)}
											</td>
											<td className="px-4 py-3">
												{SAUVEGARDE_TYPE_LABELS[sauvegarde.type]}
											</td>
											<td className="px-4 py-3">
												{formatTailleSauvegarde(sauvegarde.taille)}
											</td>
											<td className="px-4 py-3">
												<span
													className={cn(
														"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
														SAUVEGARDE_STATUT_COULEURS[sauvegarde.statut],
													)}
												>
													{SAUVEGARDE_STATUT_LABELS[sauvegarde.statut]}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
