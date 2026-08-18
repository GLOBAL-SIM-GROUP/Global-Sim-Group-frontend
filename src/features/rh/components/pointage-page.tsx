import { Link } from "@tanstack/react-router";
import { DoorClosed, DoorOpen } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";
import {
	formatDateHeureISO,
	formatDateISO,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { useEmployes } from "../hooks/use-employes";
import {
	usePointages,
	usePointerArrivee,
	usePointerDepart,
} from "../hooks/use-pointages";
import {
	nomCompletPointage,
	POINTAGE_STATUT_BADGE,
	POINTAGE_STATUT_LABELS,
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
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Pointage" }]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">Pointage</h1>
					<p className="text-muted-foreground">
						Arrivée / départ de {formatDateISO(jour)} — heure enregistrée
						automatiquement.
					</p>
				</section>
				<Button variant="outline" size="sm" asChild>
					<Link to="/rh/pointage/consultation">Consulter les pointages</Link>
				</Button>
			</div>

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
									{formatDateHeureISO(pointageDuJour.heure_arrivee)}
								</span>
							</span>
							<span className="text-muted-foreground">
								Départ :{" "}
								<span className="font-medium text-foreground">
									{formatDateHeureISO(pointageDuJour.heure_depart)}
								</span>
							</span>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
									POINTAGE_STATUT_BADGE[pointageDuJour.statut] ??
										"bg-[#95A5A6] text-white",
								)}
							>
								{POINTAGE_STATUT_LABELS[pointageDuJour.statut] ??
									pointageDuJour.statut}
							</span>
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
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucun pointage enregistré aujourd'hui.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										EMPLOYÉ
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										ARRIVÉE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										DÉPART
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										STATUT
									</th>
								</tr>
							</thead>
							<tbody>
								{pointagesJour.map((pointage) => (
									<tr
										key={pointage.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{nomCompletPointage(pointage)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateHeureISO(pointage.heure_arrivee)}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{formatDateHeureISO(pointage.heure_depart)}
										</td>
										<td className="px-4 py-3">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
													POINTAGE_STATUT_BADGE[pointage.statut] ??
														"bg-[#95A5A6] text-white",
												)}
											>
												{POINTAGE_STATUT_LABELS[pointage.statut] ??
													pointage.statut}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	);
}
