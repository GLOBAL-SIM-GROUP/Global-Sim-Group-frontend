import { Banknote, HandCoins, Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { useCaution } from "../hooks/use-contrats";
import { useMoyensPaiement } from "../hooks/use-moyens-paiement";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { EncaisserCautionFormDialog } from "./encaisser-caution-form-dialog";
import { RembourserCautionFormDialog } from "./rembourser-caution-form-dialog";
import { VersementCautionFormDialog } from "./versement-caution-form-dialog";

interface CautionTabProps {
	idContrat: string;
}

/** Ligne lecture seule. Empilée sous `sm` (voir contrat-fiche-page.tsx). */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="break-words text-foreground">{valeur}</dd>
		</div>
	);
}

/**
 * Onglet « Caution » de la fiche contrat (GET `/contrats/{id}/caution`). Un
 * 404 est traité comme « aucune caution » (état vide), pas comme une erreur.
 *
 * Actions (`RESIDENCE.MODIFIER`) :
 * - « Encaisser »/« Rembourser » (mise en avant) : une seule opération créant
 *   un vrai paiement `finances.paiement` (ENCAISSEMENT/DECAISSEMENT) via
 *   `caution/encaisser`/`caution/rembourser` — ajoutés le 2026-09-13.
 * - « Déclarer un versement hors système » (secondaire) : simple traçabilité
 *   sans paiement (`caution/versement`), pour un versement déjà fait par un
 *   autre biais. Pas d'équivalent pour la restitution — le bouton
 *   correspondant (`caution/restitution`) a été retiré de l'UI.
 */
export function CautionTab({ idContrat }: CautionTabProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const cautionQuery = useCaution(idContrat);
	const moyensQuery = useMoyensPaiement();
	const [encaissementOuvert, setEncaissementOuvert] = useState(false);
	const [remboursementOuvert, setRemboursementOuvert] = useState(false);
	const [versementOuvert, setVersementOuvert] = useState(false);

	if (cautionQuery.isLoading) {
		return (
			<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
				Chargement…
			</p>
		);
	}

	if (cautionQuery.isError || !cautionQuery.data) {
		return (
			<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
				Aucune caution enregistrée pour ce contrat.
			</p>
		);
	}

	const caution = cautionQuery.data;
	const moyens = moyensQuery.data ?? [];

	return (
		<section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
			<dl className="grid gap-4 sm:grid-cols-2">
				<Ligne label="Montant" valeur={formatMontantFCFA(caution.montant)} />
				<Ligne
					label="Date de versement"
					valeur={formatDateISO(caution.date_versement)}
				/>
				<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-3">
					<dt className="text-muted-foreground">Statut</dt>
					<dd>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								caution.payee
									? "bg-[#27AE60] text-white"
									: "bg-[#95A5A6] text-white",
							)}
						>
							{caution.payee ? "Payée" : "Non payée"}
						</span>
					</dd>
				</div>
				<Ligne
					label="Restitution"
					valeur={
						caution.date_restitution
							? formatDateISO(caution.date_restitution)
							: "—"
					}
				/>
				<Ligne
					label="Montant restitué"
					valeur={
						caution.montant_restitue
							? formatMontantFCFA(caution.montant_restitue)
							: "—"
					}
				/>
				<Ligne
					label="Retenue"
					valeur={caution.retenue ? formatMontantFCFA(caution.retenue) : "—"}
				/>
				<Ligne
					label="Motif de la retenue"
					valeur={caution.motif_retenue ?? "—"}
				/>
			</dl>

			{canModifier && !caution.payee ? (
				<div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground"
						onClick={() => setVersementOuvert(true)}
					>
						<Wallet className="size-4" aria-hidden />
						Déclarer un versement hors système
					</Button>
					<Button size="sm" onClick={() => setEncaissementOuvert(true)}>
						<HandCoins className="size-4" aria-hidden />
						Encaisser la caution
					</Button>
				</div>
			) : null}

			{canModifier && caution.payee && !caution.date_restitution ? (
				<div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
					<Button size="sm" onClick={() => setRemboursementOuvert(true)}>
						<Banknote className="size-4" aria-hidden />
						Rembourser la caution
					</Button>
				</div>
			) : null}

			{caution.historique.length > 0 ? (
				<div className="space-y-2 border-t border-border pt-4">
					<h3 className="text-sm font-semibold text-foreground">Historique</h3>
					<div className="overflow-x-auto rounded-lg border border-border">
						<table className="w-full border-collapse text-sm">
							<thead className="bg-sea-ink text-left text-white">
								<tr>
									<th scope="col" className="px-4 py-2 font-medium">
										ÉVÉNEMENT
									</th>
									<th scope="col" className="px-4 py-2 font-medium">
										DATE
									</th>
									<th scope="col" className="px-4 py-2 text-right font-medium">
										MONTANT
									</th>
									<th scope="col" className="px-4 py-2 font-medium">
										MOTIF
									</th>
								</tr>
							</thead>
							<tbody>
								{caution.historique.map((evenement) => (
									<tr
										key={`${evenement.evenement}-${evenement.date}-${evenement.montant ?? ""}`}
										className="border-t border-border"
									>
										<td className="px-4 py-2 font-medium text-foreground">
											{evenement.evenement}
										</td>
										<td className="px-4 py-2 text-muted-foreground">
											{formatDateISO(evenement.date.slice(0, 10))}
										</td>
										<td className="px-4 py-2 text-right text-foreground">
											{evenement.montant
												? formatMontantFCFA(evenement.montant)
												: "—"}
										</td>
										<td className="px-4 py-2 text-muted-foreground">
											{evenement.motif ?? "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : null}

			<EncaisserCautionFormDialog
				open={encaissementOuvert}
				idContrat={idContrat}
				montantCaution={caution.montant}
				moyens={moyens}
				onOpenChange={(ouvert) => {
					if (!ouvert) setEncaissementOuvert(false);
				}}
				onSaved={() => setEncaissementOuvert(false)}
			/>

			<RembourserCautionFormDialog
				open={remboursementOuvert}
				idContrat={idContrat}
				moyens={moyens}
				onOpenChange={(ouvert) => {
					if (!ouvert) setRemboursementOuvert(false);
				}}
				onSaved={() => setRemboursementOuvert(false)}
			/>

			<VersementCautionFormDialog
				open={versementOuvert}
				idContrat={idContrat}
				montantCaution={caution.montant}
				onOpenChange={(ouvert) => {
					if (!ouvert) setVersementOuvert(false);
				}}
				onSaved={() => setVersementOuvert(false)}
			/>
		</section>
	);
}
