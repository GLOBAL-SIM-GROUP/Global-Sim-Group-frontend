import { Save } from "lucide-react";

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
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";

import {
	useConfigurationSauvegardes,
	useCreerSauvegardeManuelle,
	useMajConfigurationSauvegardes,
	useSauvegardes,
} from "../hooks/use-sauvegardes";
import {
	formatDateSauvegarde,
	formatTailleSauvegarde,
	SAUVEGARDE_STATUT_LABELS,
	SAUVEGARDE_STATUT_VARIANT,
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Administration", to: "/admin/utilisateurs" },
					{ label: "Sauvegardes" },
				]}
				title="Sauvegardes"
				description="Gestion des sauvegardes de la base de données : consultation de l'historique, déclenchement manuel et planification."
			/>

			<div className="grid gap-6">
				{/* Configuration automatique */}
				{config && (
					<div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
						<h2 className="text-lg font-semibold">Sauvegardes automatiques</h2>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">État :</span>
								<Badge variant={config.activee ? "success" : "neutral"}>
									{config.activee ? "Activée" : "Désactivée"}
								</Badge>
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
											heure: config.heure,
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

							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Heure :</span>
								<input
									type="time"
									value={config.heure}
									onChange={(e) =>
										majConfigMutation.mutate({
											frequence: config.frequence,
											heure: e.target.value,
											activee: config.activee,
										})
									}
									disabled={!canModifier || majConfigMutation.isPending}
									className="rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>

							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={config.activee}
									onChange={(e) =>
										majConfigMutation.mutate({
											frequence: config.frequence,
											heure: config.heure,
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

							{majConfigMutation.isError ? (
								<p
									role="alert"
									className="text-sm font-medium text-destructive"
								>
									{getErrorMessageForCode(
										toApiError(majConfigMutation.error).code,
									) ??
										(toApiError(majConfigMutation.error).message ||
											"Impossible de mettre à jour la planification.")}
								</p>
							) : null}
						</div>
					</div>
				)}

				{/* Actions manuelles */}
				{canModifier ? (
					<div className="space-y-2">
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
						{creerMutation.isError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{getErrorMessageForCode(toApiError(creerMutation.error).code) ??
									(toApiError(creerMutation.error).message ||
										"Impossible de déclencher la sauvegarde.")}
							</p>
						) : null}
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
						<EmptyState title="Aucune sauvegarde enregistrée." />
					) : (
						<TableShell>
							<DataTable>
								<DataTableHead>
									<tr>
										<Th>Date</Th>
										<Th>Type</Th>
										<Th>Taille</Th>
										<Th>Statut</Th>
									</tr>
								</DataTableHead>
								<tbody>
									{sauvegardes.map((sauvegarde) => (
										<Tr key={sauvegarde.id}>
											<Td>{formatDateSauvegarde(sauvegarde.date)}</Td>
											<Td>{SAUVEGARDE_TYPE_LABELS[sauvegarde.type]}</Td>
											<Td>{formatTailleSauvegarde(sauvegarde.taille)}</Td>
											<Td>
												<Badge
													variant={SAUVEGARDE_STATUT_VARIANT[sauvegarde.statut]}
												>
													{SAUVEGARDE_STATUT_LABELS[sauvegarde.statut]}
												</Badge>
											</Td>
										</Tr>
									))}
								</tbody>
							</DataTable>
						</TableShell>
					)}
				</div>
			</div>
		</div>
	);
}
