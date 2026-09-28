import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import { formatDateInstantUTC } from "#/features/residence/models/format";
import {
	SIGNALEMENT_STATUT_LABELS,
	SIGNALEMENT_STATUT_VARIANT,
} from "#/features/signalements/models/signalements";

import { useMesSignalements } from "../hooks/use-signalements";
import { libelleCiblePortail } from "../models/signalements";

interface SignalementsPageProps {
	/** Route fiche pour le lien d'une carte (ex. `/residence/portail/signalements`). */
	lienDetailBase: string;
	/** Route du formulaire de déclaration. */
	lienNouveau: string;
	/** Fil d'Ariane : libellé racine + destination. */
	breadcrumbAccueil: { label: string; to: string };
	/** Classes du conteneur (le portail résident ajoute `p-6`). */
	className?: string;
}

/**
 * « Mes signalements » — signalements déclarés par le compte connecté
 * (`GET /signalements/portail`, scopé par le JWT, tri `date_signalement`
 * desc). Lecture seule : le traitement reste côté personnel.
 */
export function SignalementsPage({
	lienDetailBase,
	lienNouveau,
	breadcrumbAccueil,
	className = "w-full space-y-6 p-6",
}: SignalementsPageProps) {
	const signalementsQuery = useMesSignalements();

	if (signalementsQuery.isLoading) {
		return (
			<div className={className}>
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (signalementsQuery.isError) {
		return (
			<div className={className}>
				<h1 className="text-2xl font-semibold text-foreground">
					Mes signalements
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos signalements.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={() => void signalementsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const signalements = signalementsQuery.data ?? [];

	return (
		<div className={className}>
			<PageHeader
				breadcrumb={[breadcrumbAccueil, { label: "Mes signalements" }]}
				title="Mes signalements"
				description="Les problèmes que vous avez signalés et leur suivi par nos équipes."
				actions={
					<Button asChild size="sm" className="rounded-full">
						<Link to={lienNouveau as never}>
							<Plus className="size-4" aria-hidden />
							Signaler un problème
						</Link>
					</Button>
				}
			/>

			{signalements.length === 0 ? (
				<EmptyState
					title="Aucun signalement pour le moment."
					description="Signalez un problème rencontré dans nos locaux ou services depuis « Signaler un problème »."
				/>
			) : (
				<div className="space-y-3">
					{signalements.map((signalement) => (
						<Link
							key={signalement.id}
							to={`${lienDetailBase}/$id` as never}
							params={{ id: signalement.id } as never}
							className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-accent/40 hover:shadow-md"
						>
							<div className="min-w-0 flex-1 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="truncate font-semibold text-foreground">
										{signalement.titre}
									</span>
									<Badge
										variant={SIGNALEMENT_STATUT_VARIANT[signalement.statut]}
									>
										{SIGNALEMENT_STATUT_LABELS[signalement.statut] ??
											signalement.statut}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">
									{libelleCiblePortail(signalement)} · signalé le{" "}
									{formatDateInstantUTC(signalement.date_signalement)}
								</p>
							</div>
							<ChevronRight
								className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
								aria-hidden
							/>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
