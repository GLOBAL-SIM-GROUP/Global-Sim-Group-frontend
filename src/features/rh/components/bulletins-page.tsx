import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { PaiementDialog } from "#/features/salle-fete/components/paiement-dialog";
import { cn } from "#/lib/utils";

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
	PAIE_STATUT_BADGE,
	PAIE_STATUT_LABELS,
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
						"Une erreur est survenue.",
				);
			}
		},
	});

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Nouveau bulletin de salaire
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Salaire de base prérempli d'après l'employé ; les éléments sont
						ajoutés sur la fiche.
					</Dialog.Description>
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
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
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

	const paiesQuery = usePaies();
	const employesQuery = useEmployes();
	const moyensQuery = useMoyensPaiement();
	const validerMutation = useValiderPaie();
	const payerMutation = usePayerPaie();
	const annulerMutation = useAnnulerPaie();

	const employes = employesQuery.data ?? [];

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
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Bulletins de salaire" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Bulletins de salaire
					</h1>
					<p className="text-muted-foreground">
						Bulletins par employé et par période.
					</p>
				</section>
				{canCreer ? (
					<Button onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Nouveau bulletin
					</Button>
				) : null}
			</div>

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
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun bulletin trouvé.
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
									PÉRIODE
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									BASE
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ÉLÉMENTS
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									RETENUES
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									À PAYER
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((paie) => (
								<tr
									key={paie.id}
									className="relative border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3">
										{/* Toute la ligne ouvre la fiche (stretched link). */}
										<Link
											to="/rh/bulletins/$id"
											params={{ id: paie.id }}
											title={`Voir le bulletin de ${nomCompletPaie(paie)}`}
											className="font-medium text-lagoon after:absolute after:inset-0 transition-colors hover:underline"
										>
											{nomCompletPaie(paie)}
										</Link>
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{paie.periode}
									</td>
									<td className="px-4 py-3 text-right text-foreground">
										{formatMontantFCFA(paie.salaire_base)}
									</td>
									<td className="px-4 py-3 text-right text-[#27AE60]">
										+ {formatMontantFCFA(paie.total_elements)}
									</td>
									<td className="px-4 py-3 text-right text-destructive">
										- {formatMontantFCFA(paie.total_retenues)}
									</td>
									<td className="px-4 py-3 text-right font-semibold text-foreground">
										{formatMontantFCFA(paie.montant_a_payer)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												PAIE_STATUT_BADGE[paie.statut],
											)}
										>
											{PAIE_STATUT_LABELS[paie.statut]}
										</span>
									</td>
									<td className="relative z-10 px-4 py-3">
										<div className="flex items-center justify-end gap-1">
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
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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

			{aPayer ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
					<div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
						<h3 className="text-base font-semibold text-foreground">
							Payer le bulletin
						</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							{nomCompletPaie(aPayer)} — {aPayer.periode} ·{" "}
							{formatMontantFCFA(aPayer.montant_a_payer)}.
						</p>
						<div className="mt-4">
							<PaiementDialog
								titre="Encaisser"
								montantDefaut={aPayer.montant_a_payer}
								moyens={(moyensQuery.data ?? []).filter((moyen) => moyen.actif)}
								onOpenChange={() => setAPayer(null)}
								onValider={(_montant, idMoyen) => {
									payerMutation.mutate(
										{ id: aPayer.id, idMoyen },
										{ onSettled: () => setAPayer(null) },
									);
								}}
							/>
						</div>
					</div>
				</div>
			) : null}

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
