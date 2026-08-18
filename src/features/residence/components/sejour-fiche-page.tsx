import { Link } from "@tanstack/react-router";
import { HandCoins, Pencil } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { useMoyensPaiement } from "../hooks/use-moyens-paiement";
import { useSejour } from "../hooks/use-sejours";
import { formatDateHeureISO, formatMontantFCFA } from "../models/format";
import {
	SEJOUR_STATUT_LABELS,
	SEJOUR_TYPE_LABELS,
	type Sejour,
	type SejourStatut,
} from "../models/sejours";
import { PayerSejourFormDialog } from "./payer-sejour-form-dialog";
import { SejourFormDialog } from "./sejour-form-dialog";

const SEJOUR_STATUT_BADGE: Record<SejourStatut, string> = {
	EN_COURS: "bg-[#2980B9] text-white",
	TERMINE: "bg-[#27AE60] text-white",
	ANNULE: "bg-[#95A5A6] text-white",
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

interface SejourFichePageProps {
	/** Id du séjour (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche séjour — [ID] » (M2.3) : informations du client, détails du
 * séjour et paiement (total, payé, reste). Boutons Modifier et Enregistrer un
 * paiement ; « Générer une facture/reçu » n'a pas d'endpoint réel → omis.
 */
export function SejourFichePage({ id }: SejourFichePageProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const canCreer = useCan("RESIDENCE.CREER");
	const canFinancesVoir = useCan("FINANCES.VOIR");
	const moyensQuery = useMoyensPaiement();
	const [aModifier, setAModifier] = useState<Sejour | null>(null);
	const [aPayer, setAPayer] = useState<Sejour | null>(null);

	const sejourQuery = useSejour(id);

	if (sejourQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (sejourQuery.isError || !sejourQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Fiche séjour</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Séjour introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/sejours-courts">
							Retour à la liste des séjours
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const sejour = sejourQuery.data;
	const aUnReste = Number(sejour.reste_a_payer) > 0;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Séjours courts", to: "/residence/sejours-courts" },
					{ label: `Séjour ${sejour.id}` },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche séjour — {sejour.id}
					</h1>
					<p className="text-muted-foreground">
						{SEJOUR_TYPE_LABELS[sejour.type_prestation]} ·{" "}
						{sejour.numero_logement}
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link to="/residence/sejours-courts">Retour aux séjours</Link>
					</Button>
					{canModifier ? (
						<Button onClick={() => setAModifier(sejour)}>
							<Pencil className="size-4" aria-hidden />
							Modifier
						</Button>
					) : null}
					{canCreer && canFinancesVoir && aUnReste ? (
						<Button onClick={() => setAPayer(sejour)}>
							<HandCoins className="size-4" aria-hidden />
							Enregistrer un paiement
						</Button>
					) : null}
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne
						label="Client"
						valeur={
							[sejour.client_nom, sejour.client_prenoms]
								.filter(Boolean)
								.join(" ") || "—"
						}
					/>
					<Ligne
						label="Type"
						valeur={SEJOUR_TYPE_LABELS[sejour.type_prestation]}
					/>
					<Ligne label="Logement" valeur={sejour.numero_logement} />
					<Ligne
						label="Arrivée"
						valeur={formatDateHeureISO(sejour.date_heure_arrivee)}
					/>
					<Ligne
						label="Départ prévu"
						valeur={formatDateHeureISO(sejour.date_heure_depart_prevue)}
					/>
					<Ligne label="Durée" valeur={sejour.duree ?? "—"} />
					<Ligne label="Tarif" valeur={formatMontantFCFA(sejour.tarif)} />
					<Ligne
						label="Montant total"
						valeur={formatMontantFCFA(sejour.montant_total)}
					/>
					<Ligne
						label="Montant payé"
						valeur={formatMontantFCFA(sejour.montant_paye)}
					/>
					<Ligne
						label="Reste à payer"
						valeur={formatMontantFCFA(sejour.reste_a_payer)}
					/>
					<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
						<dt className="text-muted-foreground">Statut</dt>
						<dd>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
									SEJOUR_STATUT_BADGE[sejour.statut],
								)}
							>
								{SEJOUR_STATUT_LABELS[sejour.statut]}
							</span>
						</dd>
					</div>
				</dl>
			</section>

			<SejourFormDialog
				open={aModifier !== null}
				sejour={aModifier}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAModifier(null);
				}}
				onSaved={() => setAModifier(null)}
			/>

			<PayerSejourFormDialog
				open={aPayer !== null}
				sejour={aPayer}
				moyens={moyensQuery.data ?? []}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAPayer(null);
				}}
				onSaved={() => setAPayer(null)}
			/>
		</div>
	);
}
