import { Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, HandCoins, Pencil, XCircle } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";

import type { Sejour } from "../models/sejours";
import { SejourImprimerButton } from "./sejour-imprimer-button";

interface SejourActionsProps {
	sejour: Sejour;
	/** Modifier → ouvre la modale d'édition. */
	onEdit: (sejour: Sejour) => void;
	/** Enregistrer un paiement → ouvre la modale de paiement. */
	onPayer: (sejour: Sejour) => void;
	/** Valider une demande `EN_ATTENTE` → modale de chiffrage. */
	onValider: (sejour: Sejour) => void;
	/** Refuser une demande `EN_ATTENTE` → modale de motif. */
	onRefuser: (sejour: Sejour) => void;
}

/**
 * Actions d'une ligne séjour, gated par les verbes réels `RESIDENCE.MODIFIER`
 * (édition) et `RESIDENCE.ENCAISSER` + `FINANCES.VOIR` (paiement — verbe
 * distinct de `RESIDENCE.CREER` : le réceptionniste crée des séjours mais
 * n'encaisse pas, le caissier résidence encaisse mais ne crée pas, vérifié en
 * direct sur les rôles réels 2026-09-13). « Voir la fiche » (œil) mène à la
 * page dédiée ; le reste de la ligne est aussi cliquable.
 *
 * Sur une demande `EN_ATTENTE` (origine portail, residence 087+088) :
 * « Valider » (`RESIDENCE.VALIDER`) et « Refuser » (`RESIDENCE.ANNULER`) —
 * visibles pour le réceptionniste depuis la 088.
 */
export function SejourActions({
	sejour,
	onEdit,
	onPayer,
	onValider,
	onRefuser,
}: SejourActionsProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const canEncaisser = useCan("RESIDENCE.ENCAISSER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const canFacturationVoir = useCan("FACTURATION.VOIR");
	const canValider = useCan("RESIDENCE.VALIDER");
	const canAnnuler = useCan("RESIDENCE.ANNULER");
	const enAttente = sejour.statut === "EN_ATTENTE";
	const aUnReste = Number(sejour.reste_a_payer) > 0;

	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" asChild title="Voir la fiche">
				<Link to="/residence/sejours-courts/$id" params={{ id: sejour.id }}>
					<Eye className="size-4" aria-hidden />
					<span className="sr-only">Voir la fiche</span>
				</Link>
			</Button>

			{canValider && enAttente ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Valider la demande"
					onClick={() => onValider(sejour)}
				>
					<CheckCircle2 className="size-4 text-[#27AE60]" aria-hidden />
					<span className="sr-only">Valider la demande</span>
				</Button>
			) : null}

			{canAnnuler && enAttente ? (
				<Button
					variant="ghost"
					size="icon-sm"
					title="Refuser la demande"
					onClick={() => onRefuser(sejour)}
				>
					<XCircle className="size-4 text-destructive" aria-hidden />
					<span className="sr-only">Refuser la demande</span>
				</Button>
			) : null}

			{canModifier && sejour.statut !== "TERMINE" ? (
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

			{canEncaisser && canFinancesVoir && aUnReste ? (
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

			{canFacturationVoir ? <SejourImprimerButton sejour={sejour} /> : null}
		</div>
	);
}
