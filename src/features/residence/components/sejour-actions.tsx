import { Link } from "@tanstack/react-router";
import { Eye, HandCoins, Pencil } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { Sejour } from "../models/sejours";

interface SejourActionsProps {
	sejour: Sejour;
	/** Modifier → ouvre la modale d'édition. */
	onEdit: (sejour: Sejour) => void;
	/** Enregistrer un paiement → ouvre la modale de paiement. */
	onPayer: (sejour: Sejour) => void;
}

/**
 * Actions d'une ligne séjour, gated par les verbes réels `RESIDENCE.MODIFIER`
 * (édition) et `RESIDENCE.CREER` + `FINANCES.VOIR` (paiement). « Voir la
 * fiche » (œil) mène à la page dédiée ; le reste de la ligne est aussi cliquable.
 * Pas de « Générer une facture/reçu » (aucun endpoint réel).
 */
export function SejourActions({ sejour, onEdit, onPayer }: SejourActionsProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const canCreer = useCan("RESIDENCE.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const aUnReste = Number(sejour.reste_a_payer) > 0;

	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" asChild title="Voir la fiche">
				<Link to="/residence/sejours-courts/$id" params={{ id: sejour.id }}>
					<Eye className="size-4" aria-hidden />
					<span className="sr-only">Voir la fiche</span>
				</Link>
			</Button>

			{canModifier ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Modifier"
					onClick={() => onEdit(sejour)}
				>
					<Pencil className="size-4" aria-hidden />
					<span className="sr-only">Modifier</span>
				</Button>
			) : null}

			{canCreer && canFinancesVoir && aUnReste ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Enregistrer le paiement"
					onClick={() => onPayer(sejour)}
				>
					<HandCoins className="size-4 text-lagoon" aria-hidden />
					<span className="sr-only">Enregistrer le paiement</span>
				</Button>
			) : null}
		</div>
	);
}
