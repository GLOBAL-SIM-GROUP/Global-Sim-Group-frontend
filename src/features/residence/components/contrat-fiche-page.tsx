import { Link } from "@tanstack/react-router";
import { Loader2, Printer } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { getApiClient } from "#/core/api/client";
import { cn } from "#/lib/utils";
import { imprimerPdfBlob } from "#/lib/print-pdf";

import { useClientsDetails } from "../hooks/use-clients";
import { useContratDetail } from "../hooks/use-contrats";
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
 * « Échéances » (encaissement des échéances) et « Caution » (restitution). Pas
 * de bouton Modifier / Résilier / Clôturer / Générer reçu : aucun endpoint réel.
 */
export function ContratFichePage({ id }: ContratFichePageProps) {
	const [onglet, setOnglet] = useState<"echeances" | "caution">("echeances");
	const [isPrintingPDF, setIsPrintingPDF] = useState(false);

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
					<Button variant="outline" asChild className="w-full sm:w-auto">
						<Link to="/residence/contrats">Retour aux contrats</Link>
					</Button>
				</div>
			</div>

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
					<Ligne label="Périodicité" valeur={contrat.periodicite ?? "—"} />
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
			) : (
				<CautionTab idContrat={contrat.id} />
			)}
		</div>
	);
}
