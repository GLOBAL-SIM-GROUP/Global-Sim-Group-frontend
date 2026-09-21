import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { AnnulerDemandeDialog } from "#/features/portail/components/annuler-demande-dialog";
import { PressingRecuButton } from "#/features/portail/components/pressing-recu-button";
import {
	useAnnulerDepotPressing,
	usePressingCommande,
} from "#/features/portail/hooks/use-pressing";
import {
	calculerProgression,
	estAnnulable,
	getEtapeActuelle,
	libelleDateDepot,
	libelleMontantPressing,
	PRESSING_STATUT_BADGE,
	PRESSING_STATUT_LABELS,
	PROGRESSION_ETAPES,
} from "#/features/portail/models/pressing";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

/**
 * Détail d'une commande de pressing de l'espace client — reprend exactement
 * la logique de `PressingCommandeDetailPage` (portail résident), même
 * API/modèle/`PressingRecuButton` (`features/portail`), seuls les liens de
 * navigation changent.
 */
export function PressingDetailPage({ id }: { id: string }) {
	const commandeQuery = usePressingCommande(id);
	const canDeclarer = useCan("PRESSING.DECLARER");
	const annuler = useAnnulerDepotPressing();
	const [confirmOuvert, setConfirmOuvert] = useState(false);

	if (commandeQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-6xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (commandeQuery.isError || !commandeQuery.data) {
		return (
			<div className="mx-auto w-full max-w-6xl space-y-3 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-foreground">
					Commande de pressing
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger cette commande.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void commandeQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const commande = commandeQuery.data;
	const progression = calculerProgression(commande.statut);
	const etape = getEtapeActuelle(commande.statut);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
			<Breadcrumb
				items={[
					{ label: "Espace client", to: "/espace-client" },
					{ label: "Pressing", to: "/espace-client/pressing" },
					{ label: commande.numero_commande },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-2xl font-semibold text-foreground">
							{commande.numero_commande}
						</h1>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								PRESSING_STATUT_BADGE[commande.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{PRESSING_STATUT_LABELS[commande.statut] ?? commande.statut}
						</span>
					</div>
					<p className="text-muted-foreground">
						{libelleDateDepot(commande)}
						{commande.date_retrait_reelle
							? ` — retiré le ${formatDateISO(commande.date_retrait_reelle.slice(0, 10))}`
							: commande.date_retrait_prevue
								? ` — retrait prévu le ${formatDateISO(commande.date_retrait_prevue)}`
								: ""}
					</p>
				</section>
				<div className="flex flex-wrap items-center gap-2">
					<PressingRecuButton
						idCommande={commande.id}
						numeroCommande={commande.numero_commande}
					/>
					{canDeclarer && estAnnulable(commande) ? (
						<Button
							variant="outline"
							size="sm"
							className="text-destructive hover:bg-destructive/10"
							onClick={() => setConfirmOuvert(true)}
						>
							Annuler la demande
						</Button>
					) : null}
					<Button variant="outline" size="sm" asChild>
						<Link to="/espace-client/pressing">Retour à la liste</Link>
					</Button>
				</div>
			</div>

			{commande.motif_annulation ? (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
					<p className="font-medium text-destructive">Motif d'annulation</p>
					<p className="mt-1 text-foreground">{commande.motif_annulation}</p>
				</div>
			) : null}

			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Montant total
					</p>
					<p className="mt-1 text-lg font-semibold text-foreground">
						{libelleMontantPressing(commande.montant_total)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Acompte versé
					</p>
					<p className="mt-1 text-lg font-semibold text-foreground">
						{formatMontantFCFA(commande.acompte)}
					</p>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Reste à payer
					</p>
					<p
						className={cn(
							"mt-1 text-lg font-semibold",
							Number(commande.reste_a_payer) > 0
								? "text-destructive"
								: "text-foreground",
						)}
					>
						{formatMontantFCFA(commande.reste_a_payer)}
					</p>
				</div>
			</div>

			<section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-foreground">
					Progression du traitement
				</h2>
				<div className="space-y-2">
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>
							Étape {etape.actuelle} sur {etape.total}
						</span>
						<span className="font-semibold text-foreground">
							{progression}%
						</span>
					</div>
					<div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-lagoon transition-all"
							style={{ width: `${progression}%` }}
						/>
					</div>
				</div>

				<ol className="space-y-4">
					{PROGRESSION_ETAPES.map((statut, index) => {
						const isCompleted = index < etape.actuelle - 1;
						const isCurrent = index === etape.actuelle - 1;
						return (
							<li key={statut} className="flex gap-3">
								<div className="flex flex-col items-center">
									<span
										className={cn(
											"flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
											isCompleted
												? "border-[#27AE60] bg-[#27AE60] text-white"
												: isCurrent
													? "border-lagoon text-lagoon"
													: "border-border text-muted-foreground",
										)}
									>
										{isCompleted ? "✓" : index + 1}
									</span>
									{index < PROGRESSION_ETAPES.length - 1 ? (
										<div
											className={cn(
												"mt-1 w-px flex-1",
												isCompleted ? "bg-[#27AE60]" : "bg-border",
											)}
											style={{ minHeight: "2rem" }}
										/>
									) : null}
								</div>
								<div className="pb-2">
									<p className="text-sm font-medium text-foreground">
										{PRESSING_STATUT_LABELS[statut]}
									</p>
									<p className="text-xs text-muted-foreground">
										{isCompleted
											? "Complété"
											: isCurrent
												? "En cours"
												: "À venir"}
									</p>
								</div>
							</li>
						);
					})}
				</ol>
			</section>

			<AnnulerDemandeDialog
				open={confirmOuvert}
				titre="Annuler la demande de dépôt ?"
				description={`${commande.numero_commande} — l'annulation est définitive.`}
				isPending={annuler.isPending}
				erreur={
					annuler.error
						? annuler.error instanceof Error
							? annuler.error.message
							: "Impossible d'annuler la demande."
						: null
				}
				onConfirm={() =>
					annuler.mutate(commande.id, {
						onSuccess: () => setConfirmOuvert(false),
					})
				}
				onOpenChange={setConfirmOuvert}
			/>
		</div>
	);
}
