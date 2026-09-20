import { Link } from "@tanstack/react-router";
import { CheckCheck, Eye, HandCoins, Pencil, RefreshCw, X } from "lucide-react";

import { Button } from "#/components/ui/button";
import { DownloadReceiptIconButton } from "#/features/facturation/components/download-receipt-icon-button";

import type { CommandePressing } from "../models/commandes";
import { RecuDepotButton } from "./recu-depot-button";

interface CommandeActionsProps {
	commande: CommandePressing;
	canModifier: boolean;
	canCreer: boolean;
	canFinancesVoir: boolean;
	/** `PRESSING.ANNULER` — refuser une demande `EN_ATTENTE`. */
	canAnnuler: boolean;
	/** Modifier → ouvre la modale d'édition. */
	onEdit: (commande: CommandePressing) => void;
	/** Passer en traitement (statut DEPOSE). */
	onTraitement: (commande: CommandePressing) => void;
	/** Passer en « Prêt » (statut EN_TRAITEMENT). */
	onPret: (commande: CommandePressing) => void;
	/** Retirer (encaisser le solde). */
	onRetirer: (commande: CommandePressing) => void;
	/** Valider/chiffrer une demande `EN_ATTENTE` (→ DEPOSE, PRESSING.CREER). */
	onValider: (commande: CommandePressing) => void;
	/** Refuser une demande `EN_ATTENTE` (annulation, PRESSING.ANNULER). */
	onRefuser: (commande: CommandePressing) => void;
}

/**
 * Actions d'une ligne commande pressing : « Voir la fiche » (œil), « Modifier »,
 * « Changer le statut » (En traitement / Prêt selon l'état courant) et
 * « Retirer » (solde > 0). Tout gated par les verbes réels `PRESSING.*`.
 */
export function CommandeActions({
	commande,
	canModifier,
	canCreer,
	canFinancesVoir,
	canAnnuler,
	onEdit,
	onTraitement,
	onPret,
	onRetirer,
	onValider,
	onRefuser,
}: CommandeActionsProps) {
	const reste = Number(commande.reste_a_payer) > 0;
	const enAttente = commande.statut === "EN_ATTENTE";
	const estTerminee =
		commande.statut === "RETIRE" || commande.statut === "ANNULEE";

	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" asChild title="Voir la fiche">
				<Link to="/pressing/commandes/$id" params={{ id: commande.id }}>
					<Eye className="size-4" aria-hidden />
					<span className="sr-only">Voir la fiche</span>
				</Link>
			</Button>

			<RecuDepotButton idCommande={commande.id} />

			<DownloadReceiptIconButton
				sourceType="COMMANDE_PRESSING"
				idClient={commande.id_client}
				montantTotal={commande.montant_total ?? undefined}
				isPaid={Number(commande.reste_a_payer) === 0}
			/>

			{enAttente && canCreer ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Valider et chiffrer la demande"
					onClick={() => onValider(commande)}
				>
					<CheckCheck className="size-4 text-lagoon" aria-hidden />
					<span className="sr-only">Valider et chiffrer</span>
				</Button>
			) : null}

			{enAttente && canAnnuler ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Refuser la demande"
					onClick={() => onRefuser(commande)}
				>
					<X className="size-4 text-destructive" aria-hidden />
					<span className="sr-only">Refuser la demande</span>
				</Button>
			) : null}

			{canModifier ? (
				<>
					{commande.statut === "DEPOSE" ? (
						<Button
							variant="ghost"
							size="icon-sm"
							title="Passer en traitement"
							onClick={() => onTraitement(commande)}
						>
							<RefreshCw className="size-4 text-lagoon" aria-hidden />
							<span className="sr-only">Passer en traitement</span>
						</Button>
					) : null}
					{commande.statut === "EN_TRAITEMENT" ? (
						<Button
							variant="ghost"
							size="icon-sm"
							title="Passer en « Prêt »"
							onClick={() => onPret(commande)}
						>
							<CheckCheck className="size-4 text-lagoon" aria-hidden />
							<span className="sr-only">Passer en « Prêt »</span>
						</Button>
					) : null}
					{!estTerminee && !enAttente ? (
						<Button
							variant="ghost"
							size="icon-sm"
							title="Modifier"
							onClick={() => onEdit(commande)}
						>
							<Pencil className="size-4" aria-hidden />
							<span className="sr-only">Modifier</span>
						</Button>
					) : null}
				</>
			) : null}

			{canCreer && canFinancesVoir && reste && !estTerminee ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Retirer (encaisser le solde)"
					onClick={() => onRetirer(commande)}
				>
					<HandCoins className="size-4 text-lagoon" aria-hidden />
					<span className="sr-only">Retirer</span>
				</Button>
			) : null}
		</div>
	);
}
