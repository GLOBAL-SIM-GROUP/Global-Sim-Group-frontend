import { Link } from "@tanstack/react-router";
import { FileX, Loader2, Mail, Printer } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { getApiClient } from "#/core/api/client";
import { imprimerPdfBlob } from "#/lib/print-pdf";
import { cn } from "#/lib/utils";

import type { ContratResilie } from "../api/contrats";
import { useClientsDetails } from "../hooks/use-clients";
import {
	useContratDetail,
	useEnvoyerContratParEmail,
} from "../hooks/use-contrats";
import { useLogementsParId } from "../hooks/use-logements";
import { nomComplet } from "../models/clients";
import {
	CONTRAT_STATUT_LABELS,
	type ContratStatut,
	TYPE_LOCATION_LABELS,
} from "../models/contrats";
import { formatDateISO, formatMontantFCFA } from "../models/format";
import { CautionTab } from "./caution-tab";
import { ContratEcheancesTab } from "./contrat-echeances-tab";
import { EtatDesLieuxTab } from "./etat-des-lieux-tab";
import { ResilierContratFormDialog } from "./resilier-contrat-form-dialog";

const CONTRAT_STATUT_BADGE: Record<ContratStatut, string> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	ACTIF: "bg-[#27AE60] text-white",
	RESILIE: "bg-[#E74C3C] text-white",
	TERMINE: "bg-[#2980B9] text-white",
};

/**
 * Ligne lecture seule. Empilée (label au-dessus de la valeur) sous `sm` —
 * la colonne de libellé fixe (10rem) ne laisse quasiment plus de place à la
 * valeur sur un écran de 320px ; à partir de `sm`, layout habituel en 2
 * colonnes.
 */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="break-words text-foreground">{valeur}</dd>
		</div>
	);
}

interface ContratFichePageProps {
	/** Id du contrat (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche contrat — [Numéro] » (M2.2) : informations générales + onglets
 * « Échéances » (encaissement des échéances) et « Caution » (restitution).
 * « Résilier » (départ anticipé, avant terme) : visible uniquement sur un
 * contrat ACTIF. Pas de bouton Modifier / Clôturer / Générer reçu : aucun
 * endpoint réel pour ceux-là.
 */
export function ContratFichePage({ id }: ContratFichePageProps) {
	const [onglet, setOnglet] = useState<
		"echeances" | "caution" | "etatDesLieux"
	>("echeances");
	const [isPrintingPDF, setIsPrintingPDF] = useState(false);
	const [emailFeedback, setEmailFeedback] = useState<{
		type: "success" | "error";
		texte: string;
	} | null>(null);
	const envoyerEmailMutation = useEnvoyerContratParEmail();
	const [resiliationOuverte, setResiliationOuverte] = useState(false);
	const [resiliationResultat, setResiliationResultat] =
		useState<ContratResilie | null>(null);

	const contratQuery = useContratDetail(id);
	const clientsDetails = useClientsDetails(
		contratQuery.data ? [contratQuery.data.id_client] : [],
	);
	const logementsDetails = useLogementsParId(
		contratQuery.data ? [contratQuery.data.id_logement] : [],
	);

	const handlePrintPDF = async () => {
		try {
			setIsPrintingPDF(true);
			const blob = await getApiClient().download(
				`/api/v1/residence/contrats/${id}/pdf`,
			);
			imprimerPdfBlob(blob);
		} catch (error) {
			console.error("Erreur lors de l'impression du PDF", error);
		} finally {
			setIsPrintingPDF(false);
		}
	};

	const handleEnvoyerEmail = async () => {
		setEmailFeedback(null);
		try {
			const { envoye } = await envoyerEmailMutation.mutateAsync(id);
			setEmailFeedback(
				envoye
					? { type: "success", texte: "Le contrat a été envoyé par email." }
					: {
							type: "error",
							texte: "L'envoi a échoué. Réessayez plus tard.",
						},
			);
		} catch (error) {
			const apiError = toApiError(error);
			setEmailFeedback({
				type: "error",
				texte:
					getErrorMessageForCode(apiError.code) ??
					(apiError.message || "Impossible d'envoyer le contrat par email."),
			});
		}
	};

	if (contratQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (contratQuery.isError || !contratQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-4 sm:p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Fiche contrat
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Contrat introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/contrats">Retour à la liste des contrats</Link>
					</Button>
				</div>
			</div>
		);
	}

	const contrat = contratQuery.data;
	const client = clientsDetails.data?.get(contrat.id_client);
	const logement = logementsDetails.data?.get(contrat.id_logement);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Contrats de location", to: "/residence/contrats" },
					{ label: contrat.numero_contrat },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche contrat — {contrat.numero_contrat}
					</h1>
					<p className="text-muted-foreground">
						Contrat de location{" "}
						{TYPE_LOCATION_LABELS[contrat.type_location].toLowerCase()}.
					</p>
				</section>

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						onClick={() => void handlePrintPDF()}
						disabled={isPrintingPDF}
						className="w-full bg-lagoon hover:bg-lagoon/90 sm:w-auto"
					>
						{isPrintingPDF ? (
							<>
								<Loader2 className="size-4 mr-2 animate-spin" />
								Préparation…
							</>
						) : (
							<>
								<Printer className="size-4 mr-2" />
								Imprimer le contrat
							</>
						)}
					</Button>
					<Button
						variant="outline"
						onClick={() => void handleEnvoyerEmail()}
						disabled={envoyerEmailMutation.isPending}
						className="w-full sm:w-auto"
					>
						{envoyerEmailMutation.isPending ? (
							<>
								<Loader2 className="size-4 mr-2 animate-spin" />
								Envoi…
							</>
						) : (
							<>
								<Mail className="size-4 mr-2" />
								Envoyer par email
							</>
						)}
					</Button>
					{contrat.statut === "ACTIF" ? (
						<Button
							variant="destructive"
							onClick={() => setResiliationOuverte(true)}
							className="w-full sm:w-auto"
						>
							<FileX className="size-4 mr-2" />
							Résilier le contrat
						</Button>
					) : null}
					<Button variant="outline" asChild className="w-full sm:w-auto">
						<Link to="/residence/contrats">Retour aux contrats</Link>
					</Button>
				</div>
			</div>

			{emailFeedback ? (
				<div
					role="alert"
					className={cn(
						"rounded-lg border px-4 py-3 text-sm",
						emailFeedback.type === "success"
							? "border-[#27AE60]/30 bg-[#27AE60]/10 text-[#27AE60]"
							: "border-destructive/30 bg-destructive/10 text-destructive",
					)}
				>
					{emailFeedback.texte}
				</div>
			) : null}

			{resiliationResultat ? (
				resiliationResultat.montantARembourser !== "0.00" &&
				Number(resiliationResultat.montantARembourser) > 0 ? (
					<div
						role="alert"
						className="space-y-2 rounded-lg border border-[#E67E22]/30 bg-[#E67E22]/10 p-4 text-sm text-[#E67E22]"
					>
						<p>
							Contrat résilié au{" "}
							{formatDateISO(resiliationResultat.dateResiliation)}. Ce résident
							a payé {resiliationResultat.nbEcheancesARembourser} mois d'avance
							— {formatMontantFCFA(resiliationResultat.montantARembourser)} sont
							à lui rembourser.
						</p>
						<Button variant="outline" size="sm" asChild>
							<Link to="/finances/depenses">Enregistrer le remboursement</Link>
						</Button>
					</div>
				) : (
					<output className="block rounded-lg border border-[#27AE60]/30 bg-[#27AE60]/10 px-4 py-3 text-sm text-[#27AE60]">
						Contrat résilié au{" "}
						{formatDateISO(resiliationResultat.dateResiliation)}.
					</output>
				)
			) : null}

			<section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne label="Numéro" valeur={contrat.numero_contrat} />
					<Ligne label="Locataire" valeur={client ? nomComplet(client) : "…"} />
					<Ligne
						label="Logement"
						valeur={
							logement ? `${logement.numero} — ${logement.nom ?? ""}` : "…"
						}
					/>
					<Ligne
						label="Type de location"
						valeur={TYPE_LOCATION_LABELS[contrat.type_location]}
					/>
					<Ligne
						label="Loyer"
						valeur={formatMontantFCFA(contrat.montant_loyer)}
					/>
					<Ligne
						label="Date de début"
						valeur={formatDateISO(contrat.date_debut)}
					/>
					<Ligne
						label="Date de fin prévue"
						valeur={formatDateISO(contrat.date_fin_prevue)}
					/>
					<Ligne
						label="Durée (mois)"
						valeur={contrat.duree_mois?.toString() ?? "—"}
					/>
					<Ligne
						label="Date de signature"
						valeur={formatDateISO(contrat.date_signature)}
					/>
					<div className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-3">
						<dt className="text-muted-foreground">Statut</dt>
						<dd>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
									CONTRAT_STATUT_BADGE[contrat.statut],
								)}
							>
								{CONTRAT_STATUT_LABELS[contrat.statut]}
							</span>
						</dd>
					</div>
				</dl>
			</section>

			<div
				role="tablist"
				aria-label="Détails du contrat"
				className="flex gap-1 border-b border-border"
			>
				{(
					[
						["echeances", "Échéances"],
						["caution", "Caution"],
						["etatDesLieux", "État des lieux"],
					] as const
				).map(([valeur, libelle]) => (
					<button
						key={valeur}
						type="button"
						role="tab"
						aria-selected={onglet === valeur}
						onClick={() => setOnglet(valeur)}
						className={cn(
							"-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
							onglet === valeur
								? "border-lagoon text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{libelle}
					</button>
				))}
			</div>

			{onglet === "echeances" ? (
				<ContratEcheancesTab echeances={contrat.echeances} />
			) : onglet === "caution" ? (
				<CautionTab idContrat={contrat.id} />
			) : (
				<EtatDesLieuxTab idContrat={contrat.id} />
			)}

			<ResilierContratFormDialog
				open={resiliationOuverte}
				idContrat={contrat.id}
				onOpenChange={setResiliationOuverte}
				onSaved={(resultat) => {
					setResiliationOuverte(false);
					setResiliationResultat(resultat);
				}}
			/>
		</div>
	);
}
