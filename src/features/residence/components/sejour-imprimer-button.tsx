import { Loader2, Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { FactureDownloadButtons } from "#/features/facturation/components/facture-download-buttons";

import { useSejourFacture } from "../hooks/use-sejours";
import type { Sejour } from "../models/sejours";

interface SejourImprimerButtonProps {
	sejour: Sejour;
}

/**
 * Bouton « Imprimer » d'une ligne de la liste des séjours : la facture n'est
 * interrogée qu'à l'ouverture (pas pour toutes les lignes affichées —
 * `enabled` paresseux de `useSejourFacture`, évite un N+1 sur
 * `GET .../facture`). Vrai dialogue Radix rendu en portal : l'ancien menu
 * `absolute` était rogné par l'`overflow-x-auto` du tableau ; la fermeture
 * par Échap / clic extérieur est native. Réutilise `FactureDownloadButtons`
 * (PDF + ticket) une fois la facture trouvée ; affiche un état vide si le
 * séjour n'a encore aucun encaissement (voir la règle du module — pas de
 * facture tant qu'aucun paiement n'est encaissé, ce n'est pas une erreur).
 */
export function SejourImprimerButton({ sejour }: SejourImprimerButtonProps) {
	const [ouvert, setOuvert] = useState(false);
	const factureQuery = useSejourFacture(sejour.id, ouvert);
	const facture = factureQuery.data ?? null;
	const client = [sejour.client_nom, sejour.client_prenoms]
		.filter(Boolean)
		.join(" ");

	return (
		<Dialog open={ouvert} onOpenChange={setOuvert}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Imprimer la facture ou le ticket"
				>
					<Printer className="size-4 text-lagoon" aria-hidden />
					<span className="sr-only">Imprimer la facture ou le ticket</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm space-y-4">
				<div className="space-y-1">
					<DialogTitle>Imprimer</DialogTitle>
					<DialogDescription>
						Séjour {sejour.numero_logement}
						{client ? ` — ${client}` : ""}
					</DialogDescription>
				</div>

				{factureQuery.isLoading ? (
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" aria-hidden />
						Chargement…
					</p>
				) : factureQuery.isError ? (
					<p role="alert" className="text-sm text-destructive">
						Impossible de charger la facture.
					</p>
				) : !facture ? (
					<p className="text-sm text-muted-foreground">
						Aucune facture — ce séjour n'a encore fait l'objet d'aucun
						encaissement.
					</p>
				) : (
					<FactureDownloadButtons idFacture={facture.id} layout="vertical" />
				)}

				<div className="flex justify-end">
					<Button variant="ghost" onClick={() => setOuvert(false)}>
						Fermer
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
