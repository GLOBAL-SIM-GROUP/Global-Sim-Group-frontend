import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { formatDateISO } from "#/features/residence/models/format";

import {
	MOUVEMENT_TYPE_LABELS,
	type Mouvement,
	UNITE_LABELS,
	type UniteAbonnement,
} from "../models/abonnements";

interface MouvementsTimelineProps {
	mouvements: Mouvement[];
	unite: UniteAbonnement;
	/**
	 * Lien optionnel vers la commande d'origine (fiche staff, demande du
	 * portail…). Renvoyer `null` = pas de lien.
	 */
	lienCommande?: (mouvement: Mouvement) => { to: string; label: string } | null;
	/** Rendu vide personnalisé (ex. message portail). */
	vide?: ReactNode;
}

/**
 * Journal des mouvements de quota d'une souscription — consommations,
 * annulations, reports entrants/sortants, pertes et ajustements, plus récent
 * en premier. Partagé entre la fiche staff et le portail client.
 */
export function MouvementsTimeline({
	mouvements,
	unite,
	lienCommande,
	vide,
}: MouvementsTimelineProps) {
	if (mouvements.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				{vide ?? "Aucun mouvement pour le moment."}
			</p>
		);
	}

	const tries = [...mouvements].sort((a, b) => b.date.localeCompare(a.date));

	return (
		<ol className="space-y-3">
			{tries.map((mouvement) => {
				const negatif = mouvement.quantite.startsWith("-");
				const lien = lienCommande?.(mouvement) ?? null;
				return (
					<li
						key={mouvement.id_mouvement}
						className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
					>
						<span
							className={`mt-0.5 inline-flex min-w-20 justify-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
								negatif
									? "border-destructive/30 bg-destructive/10 text-destructive"
									: "border-[#27AE60]/30 bg-[#27AE60]/10 text-[#27AE60]"
							}`}
						>
							{mouvement.quantite} {UNITE_LABELS[unite] ?? unite}
						</span>
						<div className="min-w-0 flex-1 space-y-0.5">
							<p className="text-sm font-medium text-foreground">
								{MOUVEMENT_TYPE_LABELS[mouvement.type] ?? mouvement.type}
								{lien ? (
									<>
										{" — "}
										<Link
											to={lien.to as never}
											className="font-medium text-lagoon hover:underline"
										>
											{lien.label}
										</Link>
									</>
								) : null}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatDateISO(mouvement.date)}
								{mouvement.motif ? ` — ${mouvement.motif}` : ""}
							</p>
						</div>
					</li>
				);
			})}
		</ol>
	);
}
