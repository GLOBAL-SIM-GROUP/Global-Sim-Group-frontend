import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import { useBatiments } from "../hooks/use-batiments";
import { useCategoriesCharges, useCharges } from "../hooks/use-charges";
import { useContrats } from "../hooks/use-contrats";
import { useLogement } from "../hooks/use-logements";
import { useSejours } from "../hooks/use-sejours";
import { formatMontantFCFA } from "../models/format";
import {
	LOGEMENT_STATUT_LABELS,
	LOGEMENT_TYPE_LABELS,
	type Logement,
	type LogementStatut,
	OCCUPATION_LABELS,
} from "../models/logements";
import { LogementChargesTab } from "./logement-charges-tab";
import { LogementFormDialog } from "./logement-form-dialog";
import { LogementOccupationsTab } from "./logement-occupations-tab";

/** Onglets de la fiche logement (portés par l'URL : `?onglet=`). */
export type OngletFicheLogement = "occupations" | "charges";

/** Search reflétée dans l'URL de la fiche logement. */
export interface LogementFicheSearch {
	onglet?: OngletFicheLogement;
}

interface LogementFichePageProps {
	/** Id du logement (paramètre `$id` de la route). */
	id: string;
	initialSearch: LogementFicheSearch;
	onSearchChange: (
		maj: (prev: LogementFicheSearch) => LogementFicheSearch,
	) => void;
}

/** Couleurs de badge par statut (mêmes teintes que la liste des logements). */
const STATUT_BADGE: Record<LogementStatut, string> = {
	DISPONIBLE: "bg-[#27AE60] text-white",
	RESERVE: "bg-[#E67E22] text-white",
	OCCUPE: "bg-[#2980B9] text-white",
	EN_NETTOYAGE: "bg-[#1ABC9C] text-white",
	EN_MAINTENANCE: "bg-[#E74C3C] text-white",
	INDISPONIBLE: "bg-[#95A5A6] text-white",
};

/** Ligne lecture seule du bandeau d'informations. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[8rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

/**
 * Page « Fiche logement — [Numéro] » (M2.2) : informations complètes du
 * logement + onglets « Historique des occupations » (contrats + séjours du
 * logement, filtrés côté client par `id_logement`) et « Charges ». Les données
 * sont déjà chargées par les listers — aucun endpoint inventé ; « Résilier »
 * n'existe pas côté backend (pas de bouton).
 */
export function LogementFichePage({
	id,
	initialSearch,
	onSearchChange,
}: LogementFichePageProps) {
	const canModifier = useCan("RESIDENCE.MODIFIER");
	const [onglet, setOnglet] = useState<OngletFicheLogement>(
		initialSearch.onglet ?? "occupations",
	);
	const [aModifier, setAModifier] = useState<Logement | null>(null);

	const logementQuery = useLogement(id);
	const batimentsQuery = useBatiments();
	const contratsQuery = useContrats();
	const sejoursQuery = useSejours();
	const chargesQuery = useCharges();
	const categoriesQuery = useCategoriesCharges();

	const logement = logementQuery.data;
	const batiment = batimentsQuery.data?.find(
		(item) => item.id === logement?.id_batiment,
	);

	const changerOnglet = (suivant: OngletFicheLogement) => {
		setOnglet(suivant);
		onSearchChange((prev) => ({ ...prev, onglet: suivant }));
	};

	const contratsDuLogement = useMemo(
		() =>
			(contratsQuery.data ?? []).filter(
				(contrat) => contrat.id_logement === logement?.id,
			),
		[contratsQuery.data, logement?.id],
	);
	const sejoursDuLogement = useMemo(
		() =>
			(sejoursQuery.data ?? []).filter(
				(sejour) => sejour.id_logement === logement?.id,
			),
		[sejoursQuery.data, logement?.id],
	);
	// Le param `logement` du lister charges renvoie un 500 : filtrage client.
	const chargesDuLogement = useMemo(
		() =>
			(chargesQuery.data ?? []).filter(
				(charge) => charge.id_logement === logement?.id,
			),
		[chargesQuery.data, logement?.id],
	);

	if (logementQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (logementQuery.isError || !logement) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Fiche logement
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Logement introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/residence/batiments">
							Retour à la liste des bâtiments
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Bâtiments", to: "/residence/batiments" },
					{
						label: "Logements",
						to: "/residence/logements",
						search: { batiment: logement.id_batiment },
					},
					{ label: logement.numero },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche logement — {logement.numero}
					</h1>
					<p className="text-muted-foreground">
						{batiment ? `${batiment.nom} (bâtiment ${batiment.code})` : "—"}
					</p>
				</section>

				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link
							to="/residence/logements"
							search={{ batiment: logement.id_batiment }}
						>
							Retour aux logements
						</Link>
					</Button>
					{canModifier ? (
						<Button onClick={() => setAModifier(logement)}>
							<Pencil className="size-4" aria-hidden />
							Modifier
						</Button>
					) : null}
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne label="Numéro" valeur={logement.numero} />
					<Ligne
						label="Bâtiment"
						valeur={batiment ? `${batiment.nom} (${batiment.code})` : "—"}
					/>
					<Ligne label="Type" valeur={LOGEMENT_TYPE_LABELS[logement.type]} />
					<Ligne label="Tarif" valeur={formatMontantFCFA(logement.tarif)} />
					<div className="grid grid-cols-[8rem_1fr] gap-3 text-sm">
						<dt className="text-muted-foreground">Statut</dt>
						<dd>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
									STATUT_BADGE[logement.statut],
								)}
							>
								{LOGEMENT_STATUT_LABELS[logement.statut]}
							</span>
						</dd>
					</div>
					<Ligne
						label="Occupation"
						valeur={OCCUPATION_LABELS[logement.statut]}
					/>
				</dl>
			</section>

			<div
				role="tablist"
				aria-label="Détails du logement"
				className="flex gap-1 border-b border-border"
			>
				{(
					[
						["occupations", "Historique des occupations"],
						["charges", "Charges"],
					] as const
				).map(([valeur, libelle]) => (
					<button
						key={valeur}
						type="button"
						role="tab"
						aria-selected={onglet === valeur}
						onClick={() => changerOnglet(valeur)}
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

			{onglet === "occupations" ? (
				<LogementOccupationsTab
					contrats={contratsDuLogement}
					sejours={sejoursDuLogement}
				/>
			) : (
				<LogementChargesTab
					logementId={logement.id}
					charges={chargesDuLogement}
					categories={categoriesQuery.data ?? []}
				/>
			)}

			<LogementFormDialog
				open={aModifier !== null}
				logement={aModifier}
				batiments={batimentsQuery.data ?? []}
				batimentIdParDefaut={logement.id_batiment}
				onOpenChange={(ouvert) => {
					if (!ouvert) setAModifier(null);
				}}
				onSaved={() => setAModifier(null)}
			/>
		</div>
	);
}
