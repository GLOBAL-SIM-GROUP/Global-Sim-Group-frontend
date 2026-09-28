import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Plus, Printer, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
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
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { PaiementDialog } from "#/features/salle-fete/components/paiement-dialog";
import { imprimerPdfBlob } from "#/lib/print-pdf";

import { telechargerPaiePdf } from "../api/paies";
import { useEmployes } from "../hooks/use-employes";
import {
	useAnnulerPaie,
	useCreerPaie,
	usePaies,
	usePayerPaie,
	useValiderPaie,
} from "../hooks/use-paies";
import {
	filtrerPaies,
	nomCompletPaie,
	PAIE_STATUT_LABELS,
	PAIE_STATUT_VARIANT,
	type Paie,
	type PaieStatut,
	paginerPaies,
} from "../models/paies";
import { PAIES_PAGE_SIZE } from "../permissions";

function moisCourant(): string {
	const maintenant = new Date();
	return `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;
}

/** Modale « Nouveau bulletin » (employé + période, salaire auto). */
function NouveauBulletinDialog({
	open,
	onOpenChange,
	onCreated,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: (idPaie: string) => void;
}) {
	const employesQuery = useEmployes();
	const createMutation = useCreerPaie();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const employes = employesQuery.data ?? [];

	const form = useForm({
		defaultValues: {
			idEmploye: "",
			periode: moisCourant(),
			salaireBase: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.idEmploye) fields.idEmploye = "Sélectionnez un employé.";
				if (!value.periode) fields.periode = "Ce champ est requis.";
				if (!value.salaireBase.trim())
					fields.salaireBase = "Ce champ est requis.";
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const resultat = await createMutation.mutateAsync({
					idEmploye: value.idEmploye,
					periode: value.periode,
					salaireBase: value.salaireBase.trim(),
				});
				onCreated(resultat.id_paie);
			} catch (error) {
				setGlobalError(
					getErrorMessageForCode(toApiError(error).code) ??
						(toApiError(error).message || "Une erreur est survenue."),
				);
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Nouveau bulletin de salaire</DialogTitle>
				<DialogDescription>
					Salaire de base prérempli d'après l'employé ; les éléments sont
					ajoutés sur la fiche.
				</DialogDescription>
				<form
					className="mt-4 space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="idEmploye">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Employé</Label>
								<Select
									value={field.state.value}
									onValueChange={(valeur) => {
										field.handleChange(valeur);
										const employe = employes.find((e) => e.id === valeur);
										if (employe) {
											form.setFieldValue("salaireBase", employe.salaire_base);
										}
									}}
								>
									<SelectTrigger
										id={field.name}
										aria-label="Employé"
										className="w-full"
									>
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
								{field.state.meta.errors[0] ? (
									<p className="text-xs text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>
					<div className="grid grid-cols-2 gap-4">
						<form.Field name="periode">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Période</Label>
									<input
										id={field.name}
										name={field.name}
										type="month"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => field.handleChange(event.target.value)}
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
									/>
									{field.state.meta.errors[0] ? (
										<p className="text-xs text-destructive">
											{field.state.meta.errors[0]}
										</p>
									) : null}
								</div>
							)}
						</form.Field>
						<form.Field name="salaireBase">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Salaire de base (FCFA)"
									inputMode="numeric"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
					</div>
					{globalError ? (
						<p role="alert" className="text-sm font-medium text-destructive">
							{globalError}
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
						<Button type="submit" disabled={createMutation.isPending}>
							{createMutation.isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Créer le bulletin
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/** Filtres/pagination reflétés dans l'URL. */
export interface BulletinsSearch {
	employe?: string;
	periode?: string;
	statut?: string;
	page?: number;
}

interface BulletinsPageProps {
	initialSearch: BulletinsSearch;
	onSearchChange: (maj: (prev: BulletinsSearch) => BulletinsSearch) => void;
}

/**
 * Page « Bulletins de salaire » (M9.3) : liste des bulletins, filtres,
 * « Nouveau bulletin », actions Voir / Valider / Payer / Annuler.
 */
export function BulletinsPage({
	initialSearch,
	onSearchChange,
}: BulletinsPageProps) {
	const canCreer = useCan("RH.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const navigate = useNavigate();

	const [employe, setEmploye] = useState(initialSearch.employe ?? "tous");
	const [periode, setPeriode] = useState(initialSearch.periode ?? "");
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);
	const [formOuvert, setFormOuvert] = useState(false);
	const [aPayer, setAPayer] = useState<Paie | null>(null);
	const [aAnnuler, setAAnnuler] = useState<Paie | null>(null);
	const [impressionEnCours, setImpressionEnCours] = useState<string | null>(
		null,
	);
	const [erreurImpression, setErreurImpression] = useState<string | null>(null);

	const paiesQuery = usePaies();
	const employesQuery = useEmployes();
	const moyensQuery = useMoyensPaiement();
	const validerMutation = useValiderPaie();
	const payerMutation = usePayerPaie();
	const annulerMutation = useAnnulerPaie();

	const employes = employesQuery.data ?? [];

	const imprimerPdf = async (id: string) => {
		setErreurImpression(null);
		setImpressionEnCours(id);
		try {
			const blob = await telechargerPaiePdf(id);
			imprimerPdfBlob(blob);
		} catch (error) {
			setErreurImpression("Impossible d'imprimer le bulletin.");
			console.error("Erreur impression bulletin PDF", error);
		} finally {
			setImpressionEnCours(null);
		}
	};

	const changerFiltre = (patch: {
		employe?: string;
		periode?: string;
		statut?: string;
	}) => {
		setEmploye(patch.employe ?? employe);
		setPeriode(patch.periode ?? periode);
		setStatut(patch.statut ?? statut);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const paies = paiesQuery.data ?? [];
	const filtres = filtrerPaies(paies, { employe, periode, statut });
	const pagination = paginerPaies(filtres, page, PAIES_PAGE_SIZE);

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Bulletins de salaire" },
				]}
				title="Bulletins de salaire"
				description="Bulletins par employé et par période."
				actions={
					canCreer ? (
						<Button onClick={() => setFormOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Nouveau bulletin
						</Button>
					) : undefined
				}
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
				<input
					type="month"
					value={periode}
					onChange={(event) => changerFiltre({ periode: event.target.value })}
					aria-label="Période"
					className="w-40 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
				<Select
					value={statut}
					onValueChange={(valeur) => changerFiltre({ statut: valeur })}
				>
					<SelectTrigger aria-label="Statut" className="w-44">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les statuts</SelectItem>
						{(Object.keys(PAIE_STATUT_LABELS) as PaieStatut[]).map((valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{PAIE_STATUT_LABELS[valeur]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{erreurImpression ? (
				<div
					role="alert"
					className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					{erreurImpression}
				</div>
			) : null}

			{paiesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : paiesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les bulletins.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void paiesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<EmptyState title="Aucun bulletin trouvé." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>EMPLOYÉ</Th>
								<Th>PÉRIODE</Th>
								<Th className="text-right">BASE</Th>
								<Th className="text-right">ÉLÉMENTS</Th>
								<Th className="text-right">RETENUES</Th>
								<Th className="text-right">À PAYER</Th>
								<Th>STATUT</Th>
								<Th className="text-right">ACTIONS</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{pagination.items.map((paie) => (
								<Tr key={paie.id} className="relative">
									<Td>
										{/* Toute la ligne ouvre la fiche (stretched link). */}
										<Link
											to="/rh/bulletins/$id"
											params={{ id: paie.id }}
											title={`Voir le bulletin de ${nomCompletPaie(paie)}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{nomCompletPaie(paie)}
										</Link>
									</Td>
									<Td className="text-muted-foreground">{paie.periode}</Td>
									<Td className="text-right text-foreground">
										{formatMontantFCFA(paie.salaire_base)}
									</Td>
									<Td className="text-right text-success">
										+ {formatMontantFCFA(paie.total_elements)}
									</Td>
									<Td className="text-right text-destructive">
										- {formatMontantFCFA(paie.total_retenues)}
									</Td>
									<Td className="text-right font-semibold text-foreground">
										{formatMontantFCFA(paie.montant_a_payer)}
									</Td>
									<Td>
										<Badge variant={PAIE_STATUT_VARIANT[paie.statut]}>
											{PAIE_STATUT_LABELS[paie.statut]}
										</Badge>
									</Td>
									<Td className="relative z-10">
										<div className="flex items-center justify-end gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												title="Imprimer le PDF"
												disabled={impressionEnCours === paie.id}
												onClick={() => void imprimerPdf(paie.id)}
											>
												{impressionEnCours === paie.id ? (
													<Loader2
														className="size-4 animate-spin"
														aria-hidden
													/>
												) : (
													<Printer className="size-4" aria-hidden />
												)}
												<span className="sr-only">Imprimer le PDF</span>
											</Button>
											{canCreer && paie.statut === "CALCULEE" ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Valider"
													onClick={() => validerMutation.mutate(paie.id)}
												>
													<Check className="size-4 text-lagoon" aria-hidden />
													<span className="sr-only">Valider</span>
												</Button>
											) : null}
											{canCreer &&
											canFinancesVoir &&
											paie.statut === "VALIDEE" ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Payer"
													onClick={() => setAPayer(paie)}
												>
													<Plus className="size-4 text-lagoon" aria-hidden />
													<span className="sr-only">Payer</span>
												</Button>
											) : null}
											{canCreer &&
											(paie.statut === "CALCULEE" ||
												paie.statut === "VALIDEE") ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Annuler"
													onClick={() => setAAnnuler(paie)}
												>
													<X className="size-4 text-destructive" aria-hidden />
													<span className="sr-only">Annuler</span>
												</Button>
											) : null}
										</div>
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des bulletins"
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

			<NouveauBulletinDialog
				open={formOuvert}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onCreated={(idPaie) => {
					setFormOuvert(false);
					void navigate({ to: "/rh/bulletins/$id", params: { id: idPaie } });
				}}
			/>

			<Dialog
				open={aPayer !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAPayer(null);
				}}
			>
				<DialogContent className="max-w-md">
					<DialogTitle>Payer le bulletin</DialogTitle>
					{aPayer ? (
						<>
							<DialogDescription>
								{nomCompletPaie(aPayer)} — {aPayer.periode} ·{" "}
								{formatMontantFCFA(aPayer.montant_a_payer)}.
							</DialogDescription>
							<div className="mt-4">
								<PaiementDialog
									titre="Encaisser"
									montantDefaut={aPayer.montant_a_payer}
									moyens={(moyensQuery.data ?? []).filter(
										(moyen) => moyen.actif,
									)}
									onOpenChange={() => setAPayer(null)}
									onValider={(_montant, idMoyen) => {
										payerMutation.mutate(
											{ id: aPayer.id, idMoyen },
											{ onSettled: () => setAPayer(null) },
										);
									}}
								/>
							</div>
						</>
					) : null}
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={aAnnuler !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAAnnuler(null);
				}}
				title="Annuler le bulletin"
				message={`Voulez-vous vraiment annuler le bulletin de ${aAnnuler ? nomCompletPaie(aAnnuler) : ""} (${aAnnuler?.periode ?? ""}) ?`}
				confirmLabel="Annuler le bulletin"
				cancelLabel="Fermer"
				destructive
				busy={annulerMutation.isPending}
				onConfirm={() => {
					if (aAnnuler) {
						annulerMutation.mutate(aAnnuler.id, {
							onSettled: () => setAAnnuler(null),
						});
					}
				}}
			/>
		</div>
	);
}
