import { FileDown, Printer, Receipt } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import type { Facture } from "#/features/facturation/models/factures";
import { telechargerBlob } from "#/lib/download";
import { imprimerHtml } from "#/lib/print-pdf";

import {
	getMonTicketFactureHtml,
	telechargerMaFacturePdf,
	telechargerMonRecuFacturePdf,
} from "../api/factures";
import { useFactureDuService } from "../hooks/use-factures";

type Action = "facture" | "recu" | "ticket";

/**
 * Documents d'une facture servis par le backend (GET /facturation/portail/
 * factures/{id}/pdf|recu|ticket) : facture PDF, reçu PDF des paiements
 * enregistrés, ticket de caisse HTML imprimé à 80mm.
 * Reçu et ticket exigent un encaissement (`montant_paye` > 0) — le backend
 * renvoie 409 sinon.
 */
export function FactureDocuments({
	facture,
	showLabel = true,
}: {
	facture: Facture;
	showLabel?: boolean;
}) {
	const [enCours, setEnCours] = useState<Action | null>(null);
	const [erreur, setErreur] = useState(false);
	const aUnEncaissement = Number(facture.montant_paye) > 0;

	const executer = async (action: Action) => {
		setEnCours(action);
		setErreur(false);
		try {
			if (action === "facture") {
				telechargerBlob(
					await telechargerMaFacturePdf(facture.id),
					`facture-${facture.numero}.pdf`,
				);
			} else if (action === "recu") {
				telechargerBlob(
					await telechargerMonRecuFacturePdf(facture.id),
					`recu-${facture.numero}.pdf`,
				);
			} else {
				await imprimerHtml(await getMonTicketFactureHtml(facture.id), 80);
			}
		} catch (error) {
			setErreur(true);
			console.error("Document de facture :", error);
		} finally {
			setEnCours(null);
		}
	};

	return (
		<div className="flex flex-wrap items-center justify-end gap-1">
			<Button
				variant="ghost"
				size="sm"
				className="rounded-full"
				disabled={enCours !== null}
				title="Télécharger la facture PDF"
				onClick={() => void executer("facture")}
			>
				<FileDown className="size-4" aria-hidden />
				{showLabel ? "Facture" : <span className="sr-only">Facture PDF</span>}
			</Button>
			{aUnEncaissement ? (
				<>
					<Button
						variant="ghost"
						size="sm"
						className="rounded-full"
						disabled={enCours !== null}
						title="Télécharger le reçu PDF"
						onClick={() => void executer("recu")}
					>
						<Receipt className="size-4" aria-hidden />
						{showLabel ? "Reçu" : <span className="sr-only">Reçu PDF</span>}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="rounded-full"
						disabled={enCours !== null}
						title="Imprimer le ticket de caisse"
						onClick={() => void executer("ticket")}
					>
						<Printer className="size-4" aria-hidden />
						{showLabel ? (
							"Ticket"
						) : (
							<span className="sr-only">Ticket de caisse</span>
						)}
					</Button>
				</>
			) : null}
			{erreur ? (
				<span className="text-xs text-destructive">
					Téléchargement impossible.
				</span>
			) : null}
		</div>
	);
}

/**
 * Documents de la facture liée à une entité de service (commande, vente,
 * réservation…) — résolution via `source_type` + `source_id` de la liste
 * « Mes factures ». N'affiche rien si aucune facture n'existe encore
 * (demande non facturée ou annulée).
 */
export function FactureDocumentsParSource({
	sourceType,
	sourceId,
	showLabel,
}: {
	sourceType: string;
	sourceId: string;
	showLabel?: boolean;
}) {
	const factureQuery = useFactureDuService(sourceType, sourceId);
	const facture = factureQuery.data;
	if (!facture) return null;
	return <FactureDocuments facture={facture} showLabel={showLabel} />;
}
