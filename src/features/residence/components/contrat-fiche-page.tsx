import { Link } from "@tanstack/react-router";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { getApiClient } from "#/core/api/client";
import { cn } from "#/lib/utils";

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

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
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
	const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

	const contratQuery = useContratDetail(id);
	const clientsDetails = useClientsDetails(
		contratQuery.data ? [contratQuery.data.id_client] : [],
	);
	const logementsDetails = useLogementsParId(
		contratQuery.data ? [contratQuery.data.id_logement] : [],
	);

	const handleDownloadPDF = async () => {
		try {
			setIsDownloadingPDF(true);
			const client = getApiClient();
			const blob = await client.download(
				`/api/v1/residence/contrats/${id}/pdf`,
			);

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `contrat-${contratQuery.data?.numero_contrat || id}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Erreur lors du téléchargement du PDF", error);
		} finally {
			setIsDownloadingPDF(false);
		}
	};

	if (contratQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (contratQuery.isError || !contratQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
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
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
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

				<div className="flex gap-3">
					<Button
						onClick={handleDownloadPDF}
						disabled={isDownloadingPDF}
						className="bg-lagoon hover:bg-lagoon/90"
					>
						{isDownloadingPDF ? (
							<>
								<Loader2 className="size-4 mr-2 animate-spin" />
								Téléchargement…
							</>
						) : (
							<>
								<FileText className="size-4 mr-2" />
								PDF Contrat
							</>
						)}
					</Button>
					<Button variant="outline" asChild>
						<Link to="/residence/contrats">Retour aux contrats</Link>
					</Button>
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
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
					<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
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
