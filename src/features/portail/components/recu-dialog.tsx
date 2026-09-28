import { FileDown, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { DataTable, DataTableHead, Td, Th, Tr } from "#/components/ui/table";
import {
	formatDateHeureISO,
	formatDateHeureUTC,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import {
	telechargerRecuEcheancePdf,
	telechargerRecuPaiementPdf,
} from "../api/portail";
import { useRecuEcheance, useRecuPaiement } from "../hooks/use-portail";
import {
	recuEcheanceEnCsv,
	recuPaiementEnCsv,
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
	const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
	const [erreurPdf, setErreurPdf] = useState<string | null>(null);

	const getErrorMessage = () => {
		if (!query.error) return null;
		const error = query.error as unknown;
		// Vérifie si c'est une erreur API avec un code de statut
		if (typeof error === "object" && error !== null && "statusCode" in error) {
			const statusCode = (error as Record<string, unknown>).statusCode;
			if (statusCode === 404 || statusCode === 400) {
				return "Aucun reçu n'est encore disponible. Assurez-vous que le paiement a été effectué.";
			}
		}
		return "Aucun reçu n'est émis tant que le paiement n'est pas encore effectué.";
	};

	const telechargerCsv = () => {
		if (!recu) return;
		const nom = `recu-${kind}-${id}.csv`;
		if (estRecuEcheance(recu)) {
			telechargerTexte(nom, recuEcheanceEnCsv(recu));
		} else {
			telechargerTexte(nom, recuPaiementEnCsv(recu));
		}
	};

	const telechargerPdf = async () => {
		if (!id || !recu) return;
		try {
			setIsDownloadingPdf(true);
			setErreurPdf(null);
			const blob = estRecuEcheance(recu)
				? await telechargerRecuEcheancePdf(id)
				: await telechargerRecuPaiementPdf(id);

			const url = URL.createObjectURL(blob);
			const lien = document.createElement("a");
			lien.href = url;
			lien.download = `recu-${kind}-${id}.pdf`;
			document.body.appendChild(lien);
			lien.click();
			document.body.removeChild(lien);
			URL.revokeObjectURL(url);
		} catch (err) {
			setErreurPdf("Impossible de télécharger le PDF pour le moment.");
			console.error("Erreur téléchargement PDF reçu:", err);
		} finally {
			setIsDownloadingPdf(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] overflow-y-auto">
				<DialogTitle>Reçu de paiement</DialogTitle>
				<DialogDescription>{recu ? `${recu.reference}` : ""}</DialogDescription>

				<div className="mt-4">
					{query.isLoading ? (
						<p className="flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" aria-hidden />
							Chargement…
						</p>
					) : query.isError || !recu ? (
						<div
							role="alert"
							className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
						>
							<p>{getErrorMessage()}</p>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full"
								onClick={() => onOpenChange(false)}
							>
								Fermer
							</Button>
						</div>
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

							{!estRecuEcheance(recu) && recu.facture ? (
								<div className="space-y-2 rounded-lg border border-border bg-sea-ink/5 p-4">
									<p className="text-sm font-semibold text-foreground">
										Facture {recu.facture.numero}
									</p>
									<Ligne
										label="Date"
										valeur={formatDateHeureUTC(recu.facture.date)}
									/>
									<Ligne
										label="Montant total"
										valeur={formatMontantFCFA(recu.facture.montant_total)}
									/>
									<Ligne
										label="Montant payé"
										valeur={formatMontantFCFA(recu.facture.montant_paye)}
									/>
									<DataTable>
										<DataTableHead>
											<tr>
												<Th>Libellé</Th>
												<Th className="text-right">Qté</Th>
												<Th className="text-right">P.U.</Th>
												<Th className="text-right">Total</Th>
											</tr>
										</DataTableHead>
										<tbody>
											{recu.facture.lignes.map((ligne) => (
												<Tr key={`${ligne.libelle}-${ligne.total}`}>
													<Td className="text-foreground">{ligne.libelle}</Td>
													<Td className="text-right text-foreground">
														{ligne.quantite}
													</Td>
													<Td className="text-right text-foreground">
														{formatMontantFCFA(ligne.prix_unitaire)}
													</Td>
													<Td className="text-right text-foreground">
														{formatMontantFCFA(ligne.total)}
													</Td>
												</Tr>
											))}
										</tbody>
									</DataTable>
								</div>
							) : null}

							<div className="flex items-center justify-end gap-2">
								<Button
									type="button"
									variant="ghost"
									className="rounded-full"
									onClick={() => onOpenChange(false)}
								>
									Fermer
								</Button>
								<Button
									type="button"
									variant="outline"
									className="rounded-full"
									onClick={telechargerCsv}
								>
									<FileDown className="size-4" aria-hidden />
									Télécharger (CSV)
								</Button>
								<Button
									type="button"
									className="rounded-full"
									onClick={telechargerPdf}
									disabled={isDownloadingPdf}
								>
									{isDownloadingPdf ? (
										<Loader2 className="size-4 animate-spin" aria-hidden />
									) : (
										<FileText className="size-4" aria-hidden />
									)}
									Télécharger (PDF)
								</Button>
							</div>
							{erreurPdf ? (
								<p className="text-right text-xs text-destructive">
									{erreurPdf}
								</p>
							) : null}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
