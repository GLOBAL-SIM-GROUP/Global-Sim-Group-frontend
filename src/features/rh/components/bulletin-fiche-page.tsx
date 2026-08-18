import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
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

import {
	useAjouterElementPaie,
	useAnnulerPaie,
	usePaie,
	usePayerPaie,
	useRecalculerPaie,
	useValiderPaie,
} from "../hooks/use-paies";
import {
	ELEMENT_PAIE_LABELS,
	nomCompletPaie,
	PAIE_STATUT_BADGE,
	PAIE_STATUT_LABELS,
} from "../models/paies";

const TYPES_ELEMENT = [
	"PRIME",
	"AVANCE",
	"RETENUE",
	"HEURE_SUP",
	"AUTRE",
] as const;
const TYPES_RETENUS = new Set(["AVANCE", "RETENUE"]);

/** Ligne lecture seule de la fiche. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[12rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

/** Modale « Ajouter un élément de salaire ». */
function AjouterElementDialog({
	open,
	idPaie,
	onOpenChange,
}: {
	open: boolean;
	idPaie: string;
	onOpenChange: (open: boolean) => void;
}) {
	const ajouterMutation = useAjouterElementPaie();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: { type: "PRIME", libelle: "", montant: "" },
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<string, string>> = {};
				if (!value.type) fields.type = "Ce champ est requis.";
				if (!value.libelle.trim()) fields.libelle = "Ce champ est requis.";
				if (!value.montant.trim()) {
					fields.montant = "Ce champ est requis.";
				} else if (!/^\d+(\.\d+)?$/.test(value.montant.trim())) {
					fields.montant = "Le montant doit être un nombre.";
				}
				return { fields };
			},
		},
		onSubmit: async ({ value }) => {
			setGlobalError(null);
			try {
				const brut = value.montant.trim();
				const montant =
					TYPES_RETENUS.has(value.type) && !brut.startsWith("-")
						? `-${brut}`
						: brut;
				await ajouterMutation.mutateAsync({
					id: idPaie,
					type: value.type,
					libelle: value.libelle.trim(),
					montant,
				});
				onOpenChange(false);
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
						Ajouter un élément de salaire
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Les avances et retenues sont saisies en positif (montant négatif
						appliqué automatiquement).
					</Dialog.Description>
					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<form.Field name="type">
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor={field.name}>Type</Label>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger
											id={field.name}
											aria-label="Type d'élément"
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{TYPES_ELEMENT.map((type) => (
												<SelectItem key={type} value={type}>
													{ELEMENT_PAIE_LABELS[type] ?? type}
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
						<form.Field name="libelle">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Libellé"
									placeholder="ex : Prime d'assiduité"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
						<form.Field name="montant">
							{(field) => (
								<InputField
									id={field.name}
									name={field.name}
									label="Montant (FCFA)"
									inputMode="numeric"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									error={field.state.meta.errors[0]}
								/>
							)}
						</form.Field>
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
							<Button type="submit" disabled={ajouterMutation.isPending}>
								{ajouterMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Ajouter
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

interface BulletinFichePageProps {
	/** Id du bulletin (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Bulletin de salaire » (M9.3) : détail (éléments, totaux), ajout
 * d'éléments, Recalculer / Valider / Payer / Annuler.
 */
export function BulletinFichePage({ id }: BulletinFichePageProps) {
	const canCreer = useCan("RH.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");

	const paieQuery = usePaie(id);
	const moyensQuery = useMoyensPaiement();
	const recalculerMutation = useRecalculerPaie();
	const validerMutation = useValiderPaie();
	const payerMutation = usePayerPaie();
	const annulerMutation = useAnnulerPaie();

	const [elementOuvert, setElementOuvert] = useState(false);
	const [paiementOuvert, setPaiementOuvert] = useState(false);
	const [aAnnuler, setAAnnuler] = useState(false);

	if (paieQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (paieQuery.isError || !paieQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Bulletin de salaire
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Bulletin introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/rh/bulletins">Retour aux bulletins</Link>
					</Button>
				</div>
			</div>
		);
	}

	const { paie, elements } = paieQuery.data;
	const estModifiable = paie.statut === "CALCULEE" || paie.statut === "VALIDEE";

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Bulletins de salaire", to: "/rh/bulletins" },
					{ label: `${nomCompletPaie(paie)} — ${paie.periode}` },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Bulletin de salaire — {nomCompletPaie(paie)}
					</h1>
					<p className="text-muted-foreground">
						Période {paie.periode} ·{" "}
						{PAIE_STATUT_LABELS[paie.statut].toLowerCase()}.
					</p>
				</section>

				<div className="flex flex-wrap items-center gap-2">
					{canCreer && estModifiable ? (
						<Button variant="outline" onClick={() => setElementOuvert(true)}>
							<Plus className="size-4" aria-hidden />
							Ajouter un élément
						</Button>
					) : null}
					{canCreer && estModifiable ? (
						<Button
							variant="outline"
							onClick={() => recalculerMutation.mutate(paie.id)}
							disabled={recalculerMutation.isPending}
						>
							Recalculer
						</Button>
					) : null}
					{canCreer && paie.statut === "CALCULEE" ? (
						<Button
							variant="outline"
							onClick={() => validerMutation.mutate(paie.id)}
						>
							<Check className="size-4 text-lagoon" aria-hidden />
							Valider
						</Button>
					) : null}
					{canCreer && canFinancesVoir && paie.statut === "VALIDEE" ? (
						<Button onClick={() => setPaiementOuvert(true)}>
							Payer le bulletin
						</Button>
					) : null}
					{canCreer && estModifiable ? (
						<Button
							variant="outline"
							className="text-destructive"
							onClick={() => setAAnnuler(true)}
						>
							<X className="size-4" aria-hidden />
							Annuler
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<Link to="/rh/bulletins">Retour</Link>
					</Button>
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne label="Employé" valeur={nomCompletPaie(paie)} />
					<Ligne label="Période" valeur={paie.periode} />
					<Ligne
						label="Salaire de base"
						valeur={formatMontantFCFA(paie.salaire_base)}
					/>
					<Ligne
						label="Total éléments"
						valeur={`+ ${formatMontantFCFA(paie.total_elements)}`}
					/>
					<Ligne
						label="Total retenues"
						valeur={`- ${formatMontantFCFA(paie.total_retenues)}`}
					/>
					<Ligne
						label="Montant à payer"
						valeur={formatMontantFCFA(paie.montant_a_payer)}
					/>
				</dl>
				<div className="mt-4">
					<span
						className={cn(
							"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
							PAIE_STATUT_BADGE[paie.statut],
						)}
					>
						{PAIE_STATUT_LABELS[paie.statut]}
					</span>
				</div>
			</section>

			<section className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-foreground">
					Éléments de salaire
				</h2>
				{elements.length === 0 ? (
					<p className="rounded-lg border border-border bg-sea-ink/5 p-4 text-center text-sm text-muted-foreground">
						Aucun élément ajouté à ce bulletin.
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-3 font-medium">
										TYPE
									</th>
									<th scope="col" className="px-4 py-3 font-medium">
										LIBELLÉ
									</th>
									<th scope="col" className="px-4 py-3 text-right font-medium">
										MONTANT
									</th>
								</tr>
							</thead>
							<tbody>
								{elements.map((element) => {
									const negatif = Number(element.montant) < 0;
									return (
										<tr
											key={element.id}
											className="border-t border-border transition-colors hover:bg-accent/40"
										>
											<td className="px-4 py-3">
												<span
													className={cn(
														"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
														negatif
															? "bg-[#E74C3C] text-white"
															: "bg-[#27AE60] text-white",
													)}
												>
													{ELEMENT_PAIE_LABELS[element.type] ?? element.type}
												</span>
											</td>
											<td className="px-4 py-3 text-foreground">
												{element.libelle}
											</td>
											<td
												className={cn(
													"px-4 py-3 text-right font-semibold",
													negatif ? "text-destructive" : "text-foreground",
												)}
											>
												{formatMontantFCFA(element.montant)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{recalculerMutation.isError ||
			validerMutation.isError ||
			payerMutation.isError ||
			annulerMutation.isError ? (
				<div
					role="alert"
					className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					Impossible de mettre à jour le bulletin.
				</div>
			) : null}

			<AjouterElementDialog
				open={elementOuvert}
				idPaie={paie.id}
				onOpenChange={(ouvert) => {
					if (!ouvert) setElementOuvert(false);
				}}
			/>

			{paiementOuvert ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
					<div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
						<h3 className="text-base font-semibold text-foreground">
							Payer le bulletin
						</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							{nomCompletPaie(paie)} — {paie.periode} ·{" "}
							{formatMontantFCFA(paie.montant_a_payer)}.
						</p>
						<div className="mt-4">
							<PaiementDialog
								titre="Encaisser"
								montantDefaut={paie.montant_a_payer}
								moyens={(moyensQuery.data ?? []).filter((moyen) => moyen.actif)}
								onOpenChange={() => setPaiementOuvert(false)}
								onValider={(_montant, idMoyen) => {
									payerMutation.mutate(
										{ id: paie.id, idMoyen },
										{ onSettled: () => setPaiementOuvert(false) },
									);
								}}
							/>
						</div>
					</div>
				</div>
			) : null}

			<ConfirmDialog
				open={aAnnuler}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAAnnuler(false);
				}}
				title="Annuler le bulletin"
				message={`Voulez-vous vraiment annuler le bulletin de ${nomCompletPaie(paie)} (${paie.periode}) ?`}
				confirmLabel="Annuler le bulletin"
				cancelLabel="Fermer"
				destructive
				busy={annulerMutation.isPending}
				onConfirm={() => {
					annulerMutation.mutate(paie.id, {
						onSettled: () => setAAnnuler(false),
					});
				}}
			/>
		</div>
	);
}
