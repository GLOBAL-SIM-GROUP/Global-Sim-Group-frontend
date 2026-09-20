import { Check, Eye, X } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { DownloadReceiptIconButton } from "#/features/facturation/components/download-receipt-icon-button";

import type { VenteJoin } from "../models/ventes";

interface VenteActionsProps {
	vente: VenteJoin;
	/** Voir la facture → ouvre la modale du détail. */
	onVoirFacture: (vente: VenteJoin) => void;
	/** Valider une demande portail `EN_ATTENTE` (POST valider). */
	onValider: (vente: VenteJoin) => void;
	/** Refuser une demande portail `EN_ATTENTE` (POST annuler + motif). */
	onRefuser: (vente: VenteJoin) => void;
	/** Annuler une vente déjà validée → confirmé par la page (administrateur). */
	onAnnuler: (vente: VenteJoin) => void;
}

/**
 * Actions d'une ligne vente. « Voir la facture » toujours visible. Sur une
 * demande portail `EN_ATTENTE` : « Valider » (gated `MARCHANDISE.VALIDER` —
 * décrémente le stock côté serveur) et « Refuser » (gated
 * `MARCHANDISE.ANNULER`, motif restitué au résident). « Annuler » (gated
 * `MARCHANDISE.SUPPRIMER`, administrateur) reste pour les ventes `EN_COURS`.
 */
export function VenteActions({
	vente,
	onVoirFacture,
	onValider,
	onRefuser,
	onAnnuler,
}: VenteActionsProps) {
	const canValider = useCan("MARCHANDISE.VALIDER");
	const canRefuser = useCan("MARCHANDISE.ANNULER");
	const canSupprimer = useCan("MARCHANDISE.SUPPRIMER");
	const enAttente = vente.statut === "EN_ATTENTE";

	return (
		<div className="flex items-center justify-end gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				title="Voir la facture"
				onClick={() => onVoirFacture(vente)}
			>
				<Eye className="size-4" aria-hidden />
				<span className="sr-only">Voir la facture</span>
			</Button>

			<DownloadReceiptIconButton
				sourceType="VENTE"
				idClient={vente.id_client}
				montantTotal={vente.total}
				isPaid={vente.statut === "PAYEE"}
			/>

			{enAttente && canValider ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Valider la demande"
					onClick={() => onValider(vente)}
				>
					<Check className="size-4 text-[#27AE60]" aria-hidden />
					<span className="sr-only">Valider la demande</span>
				</Button>
			) : null}

			{enAttente && canRefuser ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Refuser la demande"
					onClick={() => onRefuser(vente)}
				>
					<X className="size-4 text-destructive" aria-hidden />
					<span className="sr-only">Refuser la demande</span>
				</Button>
			) : null}

			{!enAttente && canSupprimer && vente.statut !== "ANNULEE" ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Annuler la vente"
					onClick={() => onAnnuler(vente)}
				>
					<X className="size-4 text-destructive" aria-hidden />
					<span className="sr-only">Annuler la vente</span>
				</Button>
			) : null}
		</div>
	);
}
