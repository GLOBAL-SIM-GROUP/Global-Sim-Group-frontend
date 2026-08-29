import { BadgeCheck, CheckCheck, Eye, RefreshCw, X } from "lucide-react";

import { Button } from "#/components/ui/button";
import { DownloadReceiptIconButton } from "#/features/facturation/components/download-receipt-icon-button";

import type { CommandeRestaurant } from "../models/commandes";

interface CommandeActionsProps {
	commande: CommandeRestaurant;
	canModifier: boolean;
	canSupprimer: boolean;
	/** Voir la facture → ouvre la modale du détail. */
	onVoirFacture: (commande: CommandeRestaurant) => void;
	/** Changer le statut (prochaine étape selon l'état courant). */
	onStatut: (
		commande: CommandeRestaurant,
		statut: CommandeRestaurant["statut"],
	) => void;
	/** Annuler (administrateur). */
	onAnnuler: (commande: CommandeRestaurant) => void;
}

/**
 * Actions d'une ligne commande restaurant : « Voir la facture », « Modifier le
 * statut » (prochaine étape : En préparation → Servie → Payée) et « Annuler »
 * (gated `RESTAURANT.SUPPRIMER`).
 */
export function CommandeActions({
	commande,
	canModifier,
	canSupprimer,
	onVoirFacture,
	onStatut,
	onAnnuler,
}: CommandeActionsProps) {
	const prochaineEtape: {
		statut: CommandeRestaurant["statut"];
		label: string;
		icon: typeof RefreshCw;
	} | null =
		commande.statut === "EN_COURS"
			? { statut: "EN_PREPARATION", label: "En préparation", icon: RefreshCw }
			: commande.statut === "EN_PREPARATION"
				? { statut: "SERVIE", label: "Servie", icon: CheckCheck }
				: commande.statut === "SERVIE"
					? { statut: "PAYEE", label: "Payée", icon: BadgeCheck }
					: null;

	return (
		<div className="flex items-center justify-end gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				title="Voir la facture"
				onClick={() => onVoirFacture(commande)}
			>
				<Eye className="size-4" aria-hidden />
				<span className="sr-only">Voir la facture</span>
			</Button>

			<DownloadReceiptIconButton
				sourceType="COMMANDE_RESTAURANT"
				idClient={commande.id_client}
				montantTotal={commande.total}
				isPaid={commande.statut === "PAYEE"}
			/>

			{canModifier && prochaineEtape ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title={`Passer en « ${prochaineEtape.label} »`}
					onClick={() => onStatut(commande, prochaineEtape.statut)}
				>
					<prochaineEtape.icon className="size-4 text-lagoon" aria-hidden />
					<span className="sr-only">Passer en « {prochaineEtape.label} »</span>
				</Button>
			) : null}

			{canSupprimer && commande.statut !== "ANNULEE" ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Annuler"
					onClick={() => onAnnuler(commande)}
				>
					<X className="size-4 text-destructive" aria-hidden />
					<span className="sr-only">Annuler</span>
				</Button>
			) : null}
		</div>
	);
}
