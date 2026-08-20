import { FileDown, FileText, Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "#/components/ui/button";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useRecuEcheance, useRecuPaiement } from "../hooks/use-portail";
import {
	recuEcheanceEnCsv,
	recuPaiementEnCsv,
	telechargerRecuEcheancePdf,
	telechargerRecuPaiementPdf,
	telechargerTexte,
} from "../lib/export";
import {
	libelleMoisAnnee,
	type RecuEcheance,
	type RecuPaiement,
} from "../models/portail";

interface RecuDialogProps {
	open: boolean;
	kind: "echeance" | "paiement";
	/** Id de l'échéance ou du paiement (null si fermé). */
	id: string | null;
	onOpenChange: (open: boolean) => void;
}

/** `logement` n'existe que sur le reçu d'échéance → discrimine l'union. */
function estRecuEcheance(
	recu: RecuEcheance | RecuPaiement,
): recu is RecuEcheance {
	return "logement" in recu;
}

/** Ligne lecture seule d'un reçu. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

/**
 * Modale « Reçu » (M2.5) : affiche le reçu JSON d'une échéance ou d'un paiement
 * et permet de le télécharger en CSV.
 */
export function RecuDialog({ open, kind, id, onOpenChange }: RecuDialogProps) {
	const recuEcheanceQuery = useRecuEcheance(kind === "echeance" ? id : null);
	const recuPaiementQuery = useRecuPaiement(kind === "paiement" ? id : null);
	const query = kind === "echeance" ? recuEcheanceQuery : recuPaiementQuery;
	const recu = query.data;

	const telechargerCsv = () => {
		if (!recu) return;
		const nom = `recu-${kind}-${id}.csv`;
		if (estRecuEcheance(recu)) {
			telechargerTexte(nom, recuEcheanceEnCsv(recu));
		} else {
			telechargerTexte(nom, recuPaiementEnCsv(recu));
		}
	};

	const telechargerPdf = () => {
		if (!recu) return;
		if (estRecuEcheance(recu)) {
			telechargerRecuEcheancePdf(recu);
		} else {
			telechargerRecuPaiementPdf(recu);
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Reçu de paiement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{recu ? `${recu.reference}` : ""}
					</Dialog.Description>

					<div className="mt-4">
						{query.isLoading ? (
							<p className="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Chargement…
							</p>
						) : query.isError || !recu ? (
							<p role="alert" className="text-sm text-destructive">
								Impossible de charger le reçu.
							</p>
						) : (
							<div className="space-y-4">
								<div className="space-y-2 rounded-lg border border-border bg-sea-ink/5 p-4">
									<Ligne
										label="Client"
										valeur={`${recu.client.prenoms} ${recu.client.nom}`}
									/>
									<Ligne label="Référence" valeur={recu.reference} />
									<Ligne label="Date" valeur={formatDateHeureISO(recu.date)} />
									<Ligne
										label="Montant"
										valeur={formatMontantFCFA(recu.montant)}
									/>
									<Ligne label="Mode de paiement" valeur={recu.mode_paiement} />
									{estRecuEcheance(recu) ? (
										<Ligne label="Logement" valeur={recu.logement} />
									) : null}
									{recu.echeance ? (
										<>
											<Ligne
												label="Période"
												valeur={libelleMoisAnnee(
													recu.echeance.mois,
													recu.echeance.annee,
												)}
											/>
											<Ligne
												label="Contrat"
												valeur={recu.echeance.numero_contrat}
											/>
										</>
									) : null}
								</div>
								<div className="flex items-center justify-end gap-2">
									<Button
										type="button"
										variant="ghost"
										onClick={() => onOpenChange(false)}
									>
										Fermer
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={telechargerCsv}
									>
										<FileDown className="size-4" aria-hidden />
										Télécharger (CSV)
									</Button>
									<Button type="button" onClick={telechargerPdf}>
										<FileText className="size-4" aria-hidden />
										Télécharger (PDF)
									</Button>
								</div>
							</div>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
