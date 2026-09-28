import { Link } from "@tanstack/react-router";
import { DoorClosed, DoorOpen } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
import { useCan } from "#/core/auth";
import {
	formatDateHeureUTC,
	formatDateISO,
} from "#/features/residence/models/format";

import { useEmployes } from "../hooks/use-employes";
import {
	usePointages,
	usePointerArrivee,
	usePointerDepart,
} from "../hooks/use-pointages";
import {
	nomCompletPointage,
	POINTAGE_STATUT_LABELS,
	pointageStatutVariant,
} from "../models/pointages";

function aujourdhuiISO(): string {
	const maintenant = new Date();
	return `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}-${String(maintenant.getDate()).padStart(2, "0")}`;
}

/**
 * Page « Pointage » (M9.2) : pointer l'arrivée / le départ d'un employé
 * (heure auto) et consulter le pointage du jour.
 */
export function PointagePage() {
	const canVoir = useCan("RH.VOIR");
	const canCreer = useCan("RH.CREER");

	const [idEmploye, setIdEmploye] = useState("");
	const jour = aujourdhuiISO();
	const employesQuery = useEmployes();
	const pointagesQuery = usePointages(jour, jour);
	const arriveeMutation = usePointerArrivee();
	const departMutation = usePointerDepart();

	const pointagesJour = pointagesQuery.data ?? [];
	const pointageDuJour = useMemo(
		() => pointagesJour.find((pointage) => pointage.id_employe === idEmploye),
		[pointagesJour, idEmploye],
	);
	const employes = employesQuery.data ?? [];

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès au pointage.
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Pointage" }]}
				title="Pointage"
				description={`Arrivée / départ de ${formatDateISO(jour)} — heure enregistrée automatiquement.`}
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link to="/rh/pointage/consultation">Consulter les pointages</Link>
					</Button>
				}
			/>

			<section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="max-w-md space-y-1.5">
					<Select value={idEmploye} onValueChange={setIdEmploye}>
						<SelectTrigger aria-label="Employé" className="w-full">
							<SelectValue placeholder="Sélectionner un employé" />
						</SelectTrigger>
						<SelectContent>
							{employes.map((employe) => (
								<SelectItem key={employe.id} value={employe.id}>
									{employe.prenom} {employe.nom} — {employe.fonction}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{pointageDuJour ? (
					<div className="space-y-3">
						<div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-sea-ink/5 p-4 text-sm">
							<span className="text-muted-foreground">
								Arrivée :{" "}
								<span className="font-medium text-foreground">
									{formatDateHeureUTC(pointageDuJour.heure_arrivee)}
								</span>
							</span>
							<span className="text-muted-foreground">
								Départ :{" "}
								<span className="font-medium text-foreground">
									{formatDateHeureUTC(pointageDuJour.heure_depart)}
								</span>
							</span>
							<Badge variant={pointageStatutVariant(pointageDuJour.statut)}>
								{POINTAGE_STATUT_LABELS[pointageDuJour.statut] ??
									pointageDuJour.statut}
							</Badge>
						</div>
						{!pointageDuJour.heure_depart && canCreer ? (
							<Button
								onClick={() => departMutation.mutate(pointageDuJour.id)}
								disabled={departMutation.isPending}
							>
								<DoorClosed className="size-4" aria-hidden />
								Pointer le départ
							</Button>
						) : null}
					</div>
				) : (
					<div className="flex items-center gap-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
						{idEmploye
							? "Aucun pointage aujourd'hui pour cet employé."
							: "Sélectionnez un employé pour pointer son arrivée."}
					</div>
				)}

				{idEmploye && !pointageDuJour && canCreer ? (
					<Button
						onClick={() => arriveeMutation.mutate({ idEmploye, date: jour })}
						disabled={arriveeMutation.isPending}
					>
						<DoorOpen className="size-4" aria-hidden />
						Pointer l'arrivée
					</Button>
				) : null}

				{arriveeMutation.isError || departMutation.isError ? (
					<p role="alert" className="text-sm font-medium text-destructive">
						Impossible d'enregistrer le pointage.
					</p>
				) : null}
			</section>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-foreground">
					Pointage du jour
				</h2>
				{pointagesQuery.isLoading ? (
					<p className="text-sm text-muted-foreground">Chargement…</p>
				) : pointagesJour.length === 0 ? (
					<EmptyState title="Aucun pointage enregistré aujourd'hui." />
				) : (
					<div className="overflow-x-auto">
						<DataTable>
							<DataTableHead>
								<tr>
									<Th>EMPLOYÉ</Th>
									<Th>ARRIVÉE</Th>
									<Th>DÉPART</Th>
									<Th>STATUT</Th>
								</tr>
							</DataTableHead>
							<tbody>
								{pointagesJour.map((pointage) => (
									<Tr key={pointage.id}>
										<Td className="font-medium text-foreground">
											{nomCompletPointage(pointage)}
										</Td>
										<Td className="text-muted-foreground">
											{formatDateHeureUTC(pointage.heure_arrivee)}
										</Td>
										<Td className="text-muted-foreground">
											{formatDateHeureUTC(pointage.heure_depart)}
										</Td>
										<Td>
											<Badge variant={pointageStatutVariant(pointage.statut)}>
												{POINTAGE_STATUT_LABELS[pointage.statut] ??
													pointage.statut}
											</Badge>
										</Td>
									</Tr>
								))}
							</tbody>
						</DataTable>
					</div>
				)}
			</section>
		</div>
	);
}
