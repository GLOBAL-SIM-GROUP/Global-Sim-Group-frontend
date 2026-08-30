import { Undo2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { useCaution } from "../hooks/use-contrats";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { RestituerCautionFormDialog } from "./restituer-caution-form-dialog";

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
 * La restitution (POST `caution/restitution`) est gated par `RESIDENCE.CREER`.
 */
export function CautionTab({ idContrat }: CautionTabProps) {
	const canCreer = useCan("RESIDENCE.CREER");
	const cautionQuery = useCaution(idContrat);
	const [restitutionOuverte, setRestitutionOuverte] = useState(false);

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

			{canCreer && caution.payee && !caution.date_restitution ? (
				<div className="flex justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setRestitutionOuverte(true)}
					>
						<Undo2 className="size-4" aria-hidden />
						Restituer la caution
					</Button>
				</div>
			) : null}

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
