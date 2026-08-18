import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
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
import { useModifierPointage, usePointages } from "../hooks/use-pointages";
import { useServices } from "../hooks/use-services";
import {
	filtrerPointages,
	nomCompletPointage,
	POINTAGE_STATUT_BADGE,
	POINTAGE_STATUT_LABELS,
	type Pointage,
	paginerPointages,
} from "../models/pointages";
import { POINTAGES_PAGE_SIZE } from "../permissions";

/** Modale « Modifier un pointage » (statut, heures sup, note). */
function ModifierPointageDialog({
	pointage,
	onOpenChange,
}: {
	pointage: Pointage | null;
	onOpenChange: (open: boolean) => void;
}) {
	const modifierMutation = useModifierPointage();
	const form = useForm({
		defaultValues: {
			statut: pointage?.statut ?? "PRESENT",
			heuresSup: pointage?.heures_sup ?? "",
			note: pointage?.note ?? "",
		},
		onSubmit: async ({ value }) => {
			if (!pointage) return;
			await modifierMutation.mutateAsync({
				id: pointage.id,
				statut: value.statut,
				heuresSup: value.heuresSup.trim() || null,
				note: value.note.trim() || null,
			});
			onOpenChange(false);
		},
	});
	return (
		<Dialog.Root open={pointage !== null} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Modifier le pointage
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{pointage ? nomCompletPointage(pointage) : ""} —{" "}
						{pointage ? formatDateISO(pointage.date) : ""}
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="statut">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Statut</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Statut"
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.keys(POINTAGE_STATUT_LABELS).map((valeur) => (
												<SelectItem key={valeur} value={valeur}>
													{POINTAGE_STATUT_LABELS[valeur]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</form.Field>
						<form.Field name="heuresSup">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Heures supplémentaires"
									inputMode="numeric"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<form.Field name="note">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Note"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						{modifierMutation.isError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								Impossible de modifier le pointage.
							</p>
						) : null}
						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={modifierMutation.isPending}>
								{modifierMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Enregistrer
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** Filtres/pagination reflétés dans l'URL. */
export interface PointageConsultationSearch {
	employe?: string;
	service?: string;
	du?: string;
	au?: string;
	page?: number;
}

interface PointageConsultationPageProps {
	initialSearch: PointageConsultationSearch;
	onSearchChange: (
		maj: (prev: PointageConsultationSearch) => PointageConsultationSearch,
	) => void;
}

/**
 * Page « Pointage — Consultation » (M9.2) : pointages filtrés par employé,
 * service et période, avec modification d'un pointage (RH).
 */
export function PointageConsultationPage({
	initialSearch,
	onSearchChange,
}: PointageConsultationPageProps) {
	const canModifier = useCan("RH.MODIFIER");

	const [employe, setEmploye] = useState(initialSearch.employe ?? "tous");
	const [service, setService] = useState(initialSearch.service ?? "tous");
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [aModifier, setAModifier] = useState<Pointage | null>(null);

	const pointagesQuery = usePointages(du || undefined, au || undefined);
	const employesQuery = useEmployes();
	const servicesQuery = useServices();

	const employes = employesQuery.data ?? [];
	const services = servicesQuery.data ?? [];
	const employeParId = useMemo(
		() => new Map(employes.map((e) => [e.id, { id_service: e.id_service }])),
		[employes],
	);

	const changerFiltre = (patch: {
		employe?: string;
		service?: string;
		du?: string;
		au?: string;
	}) => {
		setEmploye(patch.employe ?? employe);
		setService(patch.service ?? service);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const pointages = pointagesQuery.data ?? [];
	const filtres = filtrerPointages(pointages, employeParId, {
		employe,
		service,
		du,
		au,
	});
	const pagination = paginerPointages(filtres, page, POINTAGES_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Pointage — Consultation" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Pointage — Consultation
				</h1>
				<p className="text-muted-foreground">
					Consultation des pointages par employé, service et période.
				</p>
			</section>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Select
					value={employe}
					onValueChange={(valeur) => changerFiltre({ employe: valeur })}
				>
					<SelectTrigger aria-label="Employé" className="w-56">
						<SelectValue placeholder="Employé" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les employés</SelectItem>
						{employes.map((e) => (
							<SelectItem key={e.id} value={e.id}>
								{e.prenom} {e.nom}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={service}
					onValueChange={(valeur) => changerFiltre({ service: valeur })}
				>
					<SelectTrigger aria-label="Service" className="w-52">
						<SelectValue placeholder="Service" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les services</SelectItem>
						{services.map((s) => (
							<SelectItem key={s.id} value={s.id}>
								{s.libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					type="date"
					value={du}
					onChange={(event) => changerFiltre({ du: event.target.value })}
					aria-label="Début de période"
					className="w-40"
				/>
				<Input
					type="date"
					value={au}
					onChange={(event) => changerFiltre({ au: event.target.value })}
					aria-label="Fin de période"
					className="w-40"
				/>
			</div>

			{pointagesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : pointagesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les pointages.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void pointagesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun pointage trouvé.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									EMPLOYÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DATE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ARRIVÉE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DÉPART
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DURÉE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									H. SUP
								</th>
								{canModifier ? (
									<th scope="col" className="px-4 py-3 text-right font-medium">
										ACTIONS
									</th>
								) : null}
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((pointage) => (
								<tr
									key={pointage.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{nomCompletPointage(pointage)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateISO(pointage.date)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(pointage.heure_arrivee)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(pointage.heure_depart)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{pointage.duree_travaillee
											? `${pointage.duree_travaillee} h`
											: "—"}
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
									<td className="px-4 py-3 text-right text-foreground">
										{pointage.heures_sup ?? "—"}
									</td>
									{canModifier ? (
										<td className="px-4 py-3">
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="icon-sm"
													title="Modifier"
													onClick={() => setAModifier(pointage)}
												>
													<Pencil className="size-4" aria-hidden />
													<span className="sr-only">Modifier</span>
												</Button>
											</div>
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des pointages"
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<p className="text-sm text-muted-foreground">
						Affichage de {pagination.start} à {pagination.end} sur{" "}
						{pagination.total} résultats
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page <= 1}
							onClick={() => allerPage(pagination.page - 1)}
						>
							Précédent
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page >= pagination.totalPages}
							onClick={() => allerPage(pagination.page + 1)}
						>
							Suivant
						</Button>
					</div>
				</nav>
			) : null}

			<ModifierPointageDialog
				pointage={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAModifier(null);
				}}
			/>
		</div>
	);
}
