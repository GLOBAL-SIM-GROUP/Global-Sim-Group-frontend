import { Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { useCan } from "#/core/auth";

import {
	type CategorieCharge,
	type Charge,
	chargeStatutLabel,
	chargeStatutVariant,
} from "../models/charges";
import { formatMontantFCFA } from "../models/format";
import { ChargeFormDialog } from "./charge-form-dialog";

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
				<EmptyState title="Aucune charge pour ce logement." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>PÉRIODE</Th>
								<Th>CATÉGORIE</Th>
								<Th>MONTANT</Th>
								<Th>PAYÉ</Th>
								<Th>RESTE</Th>
								<Th>STATUT</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{charges.map((charge) => (
								<Tr key={charge.id}>
									<Td className="font-semibold text-foreground">
										{charge.periode}
									</Td>
									<Td className="text-foreground">
										{charge.categorie_libelle}
									</Td>
									<Td className="text-foreground">
										{formatMontantFCFA(charge.montant)}
									</Td>
									<Td className="text-foreground">
										{formatMontantFCFA(charge.montant_paye)}
									</Td>
									<Td className="text-muted-foreground">
										{formatMontantFCFA(charge.reste_a_payer)}
									</Td>
									<Td>
										<Badge variant={chargeStatutVariant(charge.statut)}>
											{chargeStatutLabel(charge.statut)}
										</Badge>
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
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
