import { Loader2, Printer } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
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
		<Dialog.Root open={ouvert} onOpenChange={setOuvert}>
			<Dialog.Trigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Imprimer la facture ou le ticket"
				>
					<Printer className="size-4 text-lagoon" aria-hidden />
					<span className="sr-only">Imprimer la facture ou le ticket</span>
				</Button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-lg border border-border bg-card p-6 shadow-lg">
					<div className="space-y-1">
						<Dialog.Title className="text-base font-semibold text-foreground">
							Imprimer
						</Dialog.Title>
						<Dialog.Description className="text-sm text-muted-foreground">
							Séjour {sejour.numero_logement}
							{client ? ` — ${client}` : ""}
						</Dialog.Description>
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
