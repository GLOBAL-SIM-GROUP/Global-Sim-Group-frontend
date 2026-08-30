import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	CalendarDays,
	Camera,
	ChevronRight,
	CreditCard,
	ShieldCheck,
	Shirt,
} from "lucide-react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { usePortailResume } from "../hooks/use-portail";
import {
	ECHEANCE_STATUT_BADGE,
	ECHEANCE_STATUT_LABELS,
	libelleMoisAnnee,
} from "../models/portail";

/** Lien-carte vers un module accessible au résident. */
function ModuleCard({
	to,
	icon: Icon,
	titre,
	description,
}: {
	to: string;
	icon: typeof CalendarDays;
	titre: string;
	description: string;
}) {
	return (
		<Link
			to={to}
			className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-lagoon/50 hover:bg-accent/40"
		>
			<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sea-ink/10 text-sea-ink">
				<Icon className="size-5" aria-hidden />
			</span>
			<span className="flex-1 min-w-0">
				<span className="block text-sm font-semibold text-foreground">
					{titre}
				</span>
				<span className="block truncate text-xs text-muted-foreground">
					{description}
				</span>
			</span>
			<ChevronRight
				className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
				aria-hidden
			/>
		</Link>
	);
}

/** Ligne lecture seule. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

/**
 * Page « Mon espace résident » (M2.5.1) : récapitulatif de la situation
 * locative du résident connecté + liens vers ses échéances, paiements, caution.
 */
export function PortailPage() {
	const resumeQuery = usePortailResume();
	const canVoirSignalements = useCan("SIGNALEMENT.VOIR");

	if (resumeQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (resumeQuery.isError || !resumeQuery.data) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Mon espace résident
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger votre espace résident.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void resumeQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const { client, contrat_en_cours, prochaine_echeance } = resumeQuery.data;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Mon espace résident
				</h1>
				<p className="text-muted-foreground">
					{client.prenoms} {client.nom} — récapitulatif de votre situation.
				</p>
			</section>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold text-foreground">Mes services</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					<ModuleCard
						to="/residence/portail/echeances"
						icon={CalendarDays}
						titre="Mes échéances"
						description="Suivi de vos loyers, dus et payés."
					/>
					<ModuleCard
						to="/residence/portail/paiements"
						icon={CreditCard}
						titre="Mon historique"
						description="Historique de vos paiements et reçus."
					/>
					<ModuleCard
						to="/residence/portail/caution"
						icon={ShieldCheck}
						titre="Ma caution"
						description="Montant versé et statut de restitution."
					/>
					<ModuleCard
						to="/residence/portail/pressing"
						icon={Shirt}
						titre="Suivi Pressing"
						description="Avancement de vos commandes de pressing."
					/>
					<ModuleCard
						to="/residence/portail/etat-des-lieux"
						icon={Camera}
						titre="Mes états des lieux"
						description="Photos d'entrée et de sortie de vos logements."
					/>
					{canVoirSignalements ? (
						<ModuleCard
							to="/signalements"
							icon={AlertCircle}
							titre="Signalements"
							description="Vos signalements et leur suivi."
						/>
					) : null}
				</div>
			</section>

			{contrat_en_cours ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-foreground">
						Contrat en cours
					</h2>
					<dl className="mt-3 grid gap-4 sm:grid-cols-2">
						<Ligne label="Numéro" valeur={contrat_en_cours.numero_contrat} />
						<Ligne
							label="Logement"
							valeur={`${contrat_en_cours.logement.numero} — ${contrat_en_cours.logement.nom} (bât. ${contrat_en_cours.logement.batiment})`}
						/>
						<Ligne
							label="Montant du loyer"
							valeur={formatMontantFCFA(contrat_en_cours.montant_loyer)}
						/>
						<Ligne label="Périodicité" valeur={contrat_en_cours.periodicite} />
						<Ligne
							label="Début"
							valeur={formatDateISO(contrat_en_cours.date_debut)}
						/>
						<Ligne
							label="Fin prévue"
							valeur={formatDateISO(contrat_en_cours.date_fin_prevue)}
						/>
					</dl>
				</section>
			) : null}

			{prochaine_echeance ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="text-lg font-semibold text-foreground">
						Prochaine échéance
					</h2>
					<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-muted-foreground">
							{libelleMoisAnnee(
								prochaine_echeance.mois,
								prochaine_echeance.annee,
							)}{" "}
							—{" "}
							<span className="font-semibold text-foreground">
								{formatMontantFCFA(prochaine_echeance.montant)}
							</span>
						</p>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								ECHEANCE_STATUT_BADGE[prochaine_echeance.statut] ??
									"bg-[#95A5A6] text-white",
							)}
						>
							{ECHEANCE_STATUT_LABELS[prochaine_echeance.statut] ??
								prochaine_echeance.statut}
						</span>
					</div>
				</section>
			) : null}
		</div>
	);
}
