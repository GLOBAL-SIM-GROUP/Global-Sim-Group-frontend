import { AlertTriangle, Loader2, Tickets } from "lucide-react";

import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import type {
	ApercuAbonnement,
	LigneApercuPressing,
	LigneApercuRestaurant,
} from "../models/abonnements";
import { UNITE_LABELS } from "../models/abonnements";
import { EtatBadge } from "./etat-badge";

interface ApercuAbonnementPanelProps {
	/** `undefined` = aucun appel (pas de client/lignes) → rien n'est rendu. */
	apercu: ApercuAbonnement | null;
	pending: boolean;
	error: boolean;
	visible: boolean;
}

function libelleLigne(ligne: LigneApercuPressing | LigneApercuRestaurant) {
	return "type_vetement" in ligne
		? `${ligne.type_vetement} — ${ligne.prestation}`
		: ligne.plat;
}

/**
 * Panneau « Couverture abonnement » des formulaires de commande pressing et
 * restaurant : abonnements utilisables du client, couverture ligne par ligne
 * (couvert / excédent facturé), total réellement dû. Le bandeau excédent
 * annonce le 409 `ABONNEMENT_EXCEDENT` à anticiper à la confirmation.
 *
 * Rien n'est rendu quand `visible` est faux (pas de client sélectionné ou
 * lignes incomplètes — l'aperçu n'est alors pas appelé).
 */
export function ApercuAbonnementPanel({
	apercu,
	pending,
	error,
	visible,
}: ApercuAbonnementPanelProps) {
	if (!visible) return null;

	const aucun = apercu !== null && apercu.abonnements.length === 0;
	if (aucun) return null; // Pas d'abonnement utilisable : tarif normal, pas de panneau.

	return (
		<section
			aria-label="Couverture abonnement"
			className="space-y-3 rounded-lg border border-lagoon/40 bg-lagoon/5 p-3"
		>
			<p className="flex items-center gap-2 text-sm font-semibold text-foreground">
				<Tickets className="size-4 text-lagoon" aria-hidden />
				Couverture abonnement
				{pending ? (
					<Loader2
						className="size-3.5 animate-spin text-muted-foreground"
						aria-label="Calcul de la couverture…"
					/>
				) : null}
			</p>

			{error ? (
				<p className="text-xs text-muted-foreground">
					Impossible de calculer la couverture — le montant affiché est le tarif
					normal.
				</p>
			) : null}

			{apercu ? (
				<>
					<ul className="space-y-1">
						{apercu.abonnements.map((abonnement) => (
							<li
								key={abonnement.id_souscription}
								className="flex items-center justify-between gap-2 text-xs"
							>
								<span className="min-w-0 truncate text-foreground">
									{abonnement.offre_libelle}
								</span>
								<span className="flex shrink-0 items-center gap-2 text-muted-foreground">
									solde {abonnement.solde}{" "}
									{abonnement.unite
										? (UNITE_LABELS[abonnement.unite] ?? abonnement.unite)
										: ""}
									{abonnement.etat ? (
										<EtatBadge etat={abonnement.etat} />
									) : null}
								</span>
							</li>
						))}
					</ul>

					<div className="overflow-x-auto rounded-md border border-border bg-card">
						<table className="w-full border-collapse text-xs">
							<thead className="bg-muted/60 text-left text-muted-foreground">
								<tr>
									<th scope="col" className="px-3 py-2 font-medium">
										Ligne
									</th>
									<th scope="col" className="px-3 py-2 font-medium">
										Couvert
									</th>
									<th scope="col" className="px-3 py-2 font-medium">
										Excédent
									</th>
									<th scope="col" className="px-3 py-2 text-right font-medium">
										Dû
									</th>
								</tr>
							</thead>
							<tbody>
								{apercu.lignes.map((ligne, index) => (
									<tr
										// biome-ignore lint/suspicious/noArrayIndexKey: lignes d'aperçu sans identifiant — tableau en lecture seule, ordre stable
										key={`${libelleLigne(ligne)}-${index}`}
										className="border-t border-border"
									>
										<td className="px-3 py-2 text-foreground">
											{libelleLigne(ligne)} × {ligne.quantite}
										</td>
										<td className="px-3 py-2 text-foreground">
											{ligne.couvert}{" "}
											{UNITE_LABELS[apercu.unite] ?? apercu.unite}
										</td>
										<td
											className={cn(
												"px-3 py-2",
												ligne.excedent > 0
													? "font-semibold text-amber-600"
													: "text-muted-foreground",
											)}
										>
											{ligne.excedent > 0
												? `${ligne.excedent} ${UNITE_LABELS[apercu.unite] ?? apercu.unite} facturé(s)`
												: "—"}
										</td>
										<td className="px-3 py-2 text-right text-foreground">
											{formatMontantFCFA(ligne.montant_du)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
						<span className="text-muted-foreground">
							Total brut : {formatMontantFCFA(apercu.total_brut)}
						</span>
						<span className="font-semibold text-foreground">
							Reste dû : {formatMontantFCFA(apercu.total_du)}
						</span>
					</div>

					{apercu.excedent ? (
						<p
							role="alert"
							className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400"
						>
							<AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
							Une partie dépasse le quota — elle sera facturée au tarif normal.
							La validation confirme l'excédent auprès du client.
						</p>
					) : null}
				</>
			) : null}
		</section>
	);
}
