import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	type CategorieCharge,
	type Charge,
	chargeStatutLabel,
} from "../models/charges";
import { formatMontantFCFA } from "../models/format";
import { ChargeFormDialog } from "./charge-form-dialog";

const CHARGE_STATUT_BADGE: Record<string, string> = {
	PAYEE: "bg-[#27AE60] text-white",
	IMPAYEE: "bg-[#E74C3C] text-white",
	PARTIELLE: "bg-[#E67E22] text-white",
};

interface LogementChargesTabProps {
	logementId: string;
	charges: Charge[];
	categories: CategorieCharge[];
}

/**
 * Onglet « Charges » de la fiche logement : historique des charges du logement
 * (déjà filtrées serveur par `?logement=`) + bouton « Ajouter une charge ».
 */
export function LogementChargesTab({
	logementId,
	charges,
	categories,
}: LogementChargesTabProps) {
	const canCreer = useCan("RESIDENCE.CREER");
	const [formOuvert, setFormOuvert] = useState(false);

	return (
		<section className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 className="text-base font-semibold text-foreground">
					Charges associées
				</h2>
				{canCreer ? (
					<Button size="sm" onClick={() => setFormOuvert(true)}>
						<Plus className="size-4" aria-hidden />
						Ajouter une charge
					</Button>
				) : null}
			</div>

			{charges.length === 0 ? (
				<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					Aucune charge pour ce logement.
				</p>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									PÉRIODE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									CATÉGORIE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									MONTANT
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									PAYÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									RESTE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
							</tr>
						</thead>
						<tbody>
							{charges.map((charge) => (
								<tr
									key={charge.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-semibold text-foreground">
										{charge.periode}
									</td>
									<td className="px-4 py-3 text-foreground">
										{charge.categorie_libelle}
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatMontantFCFA(charge.montant)}
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatMontantFCFA(charge.montant_paye)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatMontantFCFA(charge.reste_a_payer)}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												CHARGE_STATUT_BADGE[charge.statut] ??
													"bg-[#95A5A6] text-white",
											)}
										>
											{chargeStatutLabel(charge.statut)}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<ChargeFormDialog
				open={formOuvert}
				logementId={logementId}
				categories={categories}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>
		</section>
	);
}
