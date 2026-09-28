import { HandCoins } from "lucide-react";

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
	type Charge,
	chargeStatutLabel,
	chargeStatutVariant,
} from "../models/charges";
import { formatMontantFCFA } from "../models/format";

interface ChargeTableProps {
	charges: Charge[];
	onPayer: (charge: Charge) => void;
}

/**
 * Tableau des charges facturées (M2.4). Action « Enregistrer un paiement »
 * (gated `RESIDENCE.CREER` && `FINANCES.VOIR`) — pas de « Modifier » (aucun
 * PATCH `/charges/{id}` dans le spec).
 */
export function ChargeTable({ charges, onPayer }: ChargeTableProps) {
	const canCreer = useCan("RESIDENCE.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");

	if (charges.length === 0) {
		return <EmptyState title="Aucune charge trouvée." />;
	}

	return (
		<TableShell>
			<DataTable>
				<DataTableHead>
					<tr>
						<Th>LOGEMENT</Th>
						<Th>PÉRIODE</Th>
						<Th>CATÉGORIE</Th>
						<Th>MONTANT</Th>
						<Th>MONTANT PAYÉ</Th>
						<Th>STATUT</Th>
						<Th className="text-right">ACTIONS</Th>
					</tr>
				</DataTableHead>
				<tbody>
					{charges.map((charge) => {
						const aUnReste = Number(charge.reste_a_payer) > 0;
						return (
							<Tr key={charge.id}>
								<Td className="font-semibold text-foreground">
									{charge.numero_logement}
								</Td>
								<Td className="text-foreground">{charge.periode}</Td>
								<Td className="text-foreground">{charge.categorie_libelle}</Td>
								<Td className="text-foreground">
									{formatMontantFCFA(charge.montant)}
								</Td>
								<Td className="text-foreground">
									{formatMontantFCFA(charge.montant_paye)}
								</Td>
								<Td>
									<Badge variant={chargeStatutVariant(charge.statut)}>
										{chargeStatutLabel(charge.statut)}
									</Badge>
								</Td>
								<Td>
									<div className="flex items-center justify-end">
										{canCreer && canFinancesVoir && aUnReste ? (
											<Button
												variant="ghost"
												size="icon-sm"
												title="Enregistrer le paiement"
												onClick={() => onPayer(charge)}
											>
												<HandCoins className="size-4 text-lagoon" aria-hidden />
												<span className="sr-only">Enregistrer le paiement</span>
											</Button>
										) : null}
									</div>
								</Td>
							</Tr>
						);
					})}
				</tbody>
			</DataTable>
		</TableShell>
	);
}
