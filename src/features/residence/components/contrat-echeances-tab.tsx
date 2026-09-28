import { HandCoins, Wallet } from "lucide-react";
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

import { useMoyensPaiement } from "../hooks/use-moyens-paiement";
import { dateEcheanceEffective, type Echeance } from "../models/contrats";
import { echanceStatutLabel, echanceStatutVariant } from "../models/echeances";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { EcheanceRecuButton } from "./echeance-recu-button";
import { EncaisserFormDialog } from "./encaisser-form-dialog";
import { EncaisserLotFormDialog } from "./encaisser-lot-form-dialog";

interface ContratEcheancesTabProps {
	idContrat: string;
	/** Échéances du contrat (embarquées par le GET détail). */
	echeances: Echeance[];
	/** Date de début du contrat — sert à déduire le jour d'échéance quand `date_echeance` est absente. */
	dateDebut: string;
}

/**
 * Onglet « Échéances » de la fiche contrat : tableau des échéances mensuelles
 * + bouton « Enregistrer un paiement » (POST `/echeances/{id}/encaisser`) sur
 * les lignes non payées, gated par `FINANCES.CREER`.
 * + bouton « Reçu » pour télécharger le PDF du reçu.
 * + bouton « Encaissement en lot » (POST `/contrats/{id}/encaisser-loyer-lot`),
 * action complémentaire pour régler plusieurs échéances en un seul paiement.
 */
export function ContratEcheancesTab({
	idContrat,
	echeances,
	dateDebut,
}: ContratEcheancesTabProps) {
	const peutEncaisser = useCan("FINANCES.CREER");
	const moyensQuery = useMoyensPaiement();
	const [aEncaisser, setAEncaisser] = useState<Echeance | null>(null);
	const [lotOuvert, setLotOuvert] = useState(false);
	const echeancesNonPayees = echeances.filter(
		(echeance) => echeance.statut !== "PAYE",
	);
	const montantMaximum = echeancesNonPayees.reduce((total, echeance) => {
		const montant = Number(echeance.montant);
		const montantPaye = Number(echeance.montant_paye ?? 0);
		const reste = montant - montantPaye;
		return total + (Number.isFinite(reste) ? Math.max(0, reste) : 0);
	}, 0);

	if (echeances.length === 0) {
		return <EmptyState title="Aucune échéance générée pour ce contrat." />;
	}

	return (
		<section className="space-y-3">
			{peutEncaisser && echeancesNonPayees.length >= 2 ? (
				<div className="flex justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setLotOuvert(true)}
					>
						<Wallet className="size-4" aria-hidden />
						Encaissement en lot
					</Button>
				</div>
			) : null}

			<TableShell>
				<DataTable>
					<DataTableHead>
						<tr>
							<Th>MOIS</Th>
							<Th>MONTANT</Th>
							<Th>STATUT</Th>
							<Th>DATE D'ÉCHÉANCE</Th>
							<Th className="text-right">ACTIONS</Th>
						</tr>
					</DataTableHead>
					<tbody>
						{echeances.map((echeance) => {
							const dateEffective = dateEcheanceEffective(echeance, dateDebut);
							return (
								<Tr key={echeance.id}>
									<Td className="font-semibold text-foreground">
										{dateEffective
											? formatDateISO(dateEffective)
											: `${echeance.mois}/${echeance.annee}`}
									</Td>
									<Td className="text-foreground">
										{formatMontantFCFA(echeance.montant)}
									</Td>
									<Td>
										<Badge variant={echanceStatutVariant(echeance.statut)}>
											{echanceStatutLabel(echeance.statut)}
										</Badge>
									</Td>
									<Td className="text-muted-foreground">
										{formatDateISO(dateEffective)}
									</Td>
									<Td>
										<div className="flex items-center justify-end gap-2">
											<EcheanceRecuButton echeance={echeance} />
											{peutEncaisser && echeance.statut !== "PAYE" ? (
												<Button
													variant="outline"
													size="sm"
													onClick={() => setAEncaisser(echeance)}
												>
													<HandCoins className="size-4" aria-hidden />
													Enregistrer un paiement
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

			<EncaisserFormDialog
				open={aEncaisser !== null}
				echeance={aEncaisser}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAEncaisser(null);
				}}
				onSaved={() => setAEncaisser(null)}
			/>

			<EncaisserLotFormDialog
				open={lotOuvert}
				idContrat={idContrat}
				echeances={echeances}
				montantMaximum={montantMaximum}
				moyens={moyensQuery.data ?? []}
				onOpenChange={setLotOuvert}
				onSaved={() => setLotOuvert(false)}
			/>
		</section>
	);
}
