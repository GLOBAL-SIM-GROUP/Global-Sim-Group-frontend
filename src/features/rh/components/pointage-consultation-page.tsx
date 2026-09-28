import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { Input } from "#/components/ui/input";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { PageHeader } from "#/components/ui/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { useCan } from "#/core/auth";
import {
	formatDateHeureUTC,
	formatDateISO,
} from "#/features/residence/models/format";

import { useEmployes } from "../hooks/use-employes";
import { useModifierPointage, usePointages } from "../hooks/use-pointages";
import { useServices } from "../hooks/use-services";
import {
	filtrerPointages,
	nomCompletPointage,
	POINTAGE_STATUT_LABELS,
	type Pointage,
	paginerPointages,
	pointageStatutVariant,
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
		<Dialog open={pointage !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Modifier le pointage</DialogTitle>
				<DialogDescription>
					{pointage ? nomCompletPointage(pointage) : ""} —{" "}
					{pointage ? formatDateISO(pointage.date) : ""}
				</DialogDescription>
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
			</DialogContent>
		</Dialog>
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
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Pointage — Consultation" },
				]}
				title="Pointage — Consultation"
				description="Consultation des pointages par employé, service et période."
			/>

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
				<EmptyState title="Aucun pointage trouvé." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>EMPLOYÉ</Th>
								<Th>DATE</Th>
								<Th>ARRIVÉE</Th>
								<Th>DÉPART</Th>
								<Th>DURÉE</Th>
								<Th>STATUT</Th>
								<Th className="text-right">H. SUP</Th>
								{canModifier ? <Th className="text-right">ACTIONS</Th> : null}
							</tr>
						</DataTableHead>
						<tbody>
							{pagination.items.map((pointage) => (
								<Tr key={pointage.id}>
									<Td className="font-medium text-foreground">
										{nomCompletPointage(pointage)}
									</Td>
									<Td className="text-muted-foreground">
										{formatDateISO(pointage.date)}
									</Td>
									<Td className="text-muted-foreground">
										{formatDateHeureUTC(pointage.heure_arrivee)}
									</Td>
									<Td className="text-muted-foreground">
										{formatDateHeureUTC(pointage.heure_depart)}
									</Td>
									<Td className="text-muted-foreground">
										{pointage.duree_travaillee
											? `${pointage.duree_travaillee} h`
											: "—"}
									</Td>
									<Td>
										<Badge variant={pointageStatutVariant(pointage.statut)}>
											{POINTAGE_STATUT_LABELS[pointage.statut] ??
												pointage.statut}
										</Badge>
									</Td>
									<Td className="text-right text-foreground">
										{pointage.heures_sup ?? "—"}
									</Td>
									{canModifier ? (
										<Td>
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
										</Td>
									) : null}
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
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
