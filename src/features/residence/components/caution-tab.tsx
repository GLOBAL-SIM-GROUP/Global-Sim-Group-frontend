import { Undo2, Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { useCaution } from "../hooks/use-contrats";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { RestituerCautionFormDialog } from "./restituer-caution-form-dialog";
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
 * La restitution (POST `caution/restitution`) est gated par `RESIDENCE.CREER` ;
 * la déclaration de versement (POST `caution/versement`) par `RESIDENCE.MODIFIER`
 * — deux verbes distincts côté backend pour ces deux actions.
 */
export function CautionTab({ idContrat }: CautionTabProps) {
	const canCreer = useCan("RESIDENCE.CREER");
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const cautionQuery = useCaution(idContrat);
	const [restitutionOuverte, setRestitutionOuverte] = useState(false);
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

			<div className="flex flex-wrap justify-end gap-2">
				{canModifier && !caution.payee ? (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setVersementOuvert(true)}
					>
						<Wallet className="size-4" aria-hidden />
						Déclarer le versement
					</Button>
				) : null}

				{canCreer && caution.payee && !caution.date_restitution ? (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setRestitutionOuverte(true)}
					>
						<Undo2 className="size-4" aria-hidden />
						Restituer la caution
					</Button>
				) : null}
			</div>

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

			<VersementCautionFormDialog
				open={versementOuvert}
				idContrat={idContrat}
				montantCaution={caution.montant}
				onOpenChange={(ouvert) => {
					if (!ouvert) setVersementOuvert(false);
				}}
				onSaved={() => setVersementOuvert(false)}
			/>

			<RestituerCautionFormDialog
				open={restitutionOuverte}
				idContrat={idContrat}
				onOpenChange={(ouvert) => {
					if (!ouvert) setRestitutionOuverte(false);
				}}
				onSaved={() => setRestitutionOuverte(false)}
			/>
		</section>
	);
}
