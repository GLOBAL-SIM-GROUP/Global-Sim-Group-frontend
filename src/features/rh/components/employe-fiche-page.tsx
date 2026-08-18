import { Link } from "@tanstack/react-router";
import { Pencil, Power, PowerOff } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { useCan } from "#/core/auth";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { useEmploye, useModifierEmploye } from "../hooks/use-employes";
import {
	EMPLOYE_STATUT_BADGE,
	EMPLOYE_STATUT_LABELS,
	nomCompletEmploye,
	TYPE_CONTRAT_LABELS,
} from "../models/employes";
import { EmployeFormDialog } from "./employe-form-dialog";

/** Ligne lecture seule de la fiche. */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[12rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

interface EmployeFichePageProps {
	/** Id de l'employé (paramètre `$id` de la route). */
	id: string;
}

/**
 * Page « Fiche employé — RH » (M9.1) : informations de l'employé et actions
 * Modifier / Activer-Désactiver.
 */
export function EmployeFichePage({ id }: EmployeFichePageProps) {
	const canModifier = useCan("RH.MODIFIER");
	const employeQuery = useEmploye(id);
	const modifierMutation = useModifierEmploye();
	const [formOuvert, setFormOuvert] = useState(false);

	if (employeQuery.isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (employeQuery.isError || !employeQuery.data) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Fiche employé
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Employé introuvable.</p>
					<Button variant="outline" size="sm" asChild>
						<Link to="/rh/employes">Retour à la liste des employés</Link>
					</Button>
				</div>
			</div>
		);
	}

	const employe = employeQuery.data;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Employés — RH", to: "/rh/employes" },
					{ label: nomCompletEmploye(employe) },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Fiche employé — {nomCompletEmploye(employe)}
					</h1>
					<p className="text-muted-foreground">
						{employe.fonction}
						{employe.service_libelle ? ` · ${employe.service_libelle}` : ""}.
					</p>
				</section>

				<div className="flex items-center gap-2">
					{canModifier ? (
						<>
							<Button variant="outline" onClick={() => setFormOuvert(true)}>
								<Pencil className="size-4" aria-hidden />
								Modifier
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									modifierMutation.mutate({
										id: employe.id,
										statut: employe.statut === "ACTIF" ? "INACTIF" : "ACTIF",
									})
								}
							>
								{employe.statut === "ACTIF" ? (
									<PowerOff className="size-4 text-destructive" aria-hidden />
								) : (
									<Power className="size-4 text-lagoon" aria-hidden />
								)}
								{employe.statut === "ACTIF" ? "Désactiver" : "Activer"}
							</Button>
						</>
					) : null}
					<Button variant="outline" asChild>
						<Link to="/rh/employes">Retour</Link>
					</Button>
				</div>
			</div>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<dl className="grid gap-4 sm:grid-cols-2">
					<Ligne label="Nom" valeur={employe.nom} />
					<Ligne label="Prénom" valeur={employe.prenom} />
					<Ligne label="Téléphone" valeur={employe.telephone ?? "—"} />
					<Ligne label="Fonction" valeur={employe.fonction} />
					<Ligne label="Service" valeur={employe.service_libelle ?? "—"} />
					<Ligne
						label="Date d'embauche"
						valeur={formatDateISO(employe.date_embauche)}
					/>
					<Ligne
						label="Type de contrat"
						valeur={TYPE_CONTRAT_LABELS[employe.type_contrat]}
					/>
					<Ligne
						label="Salaire de base"
						valeur={formatMontantFCFA(employe.salaire_base)}
					/>
				</dl>
				<div className="mt-4">
					<span
						className={cn(
							"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
							EMPLOYE_STATUT_BADGE[employe.statut],
						)}
					>
						{EMPLOYE_STATUT_LABELS[employe.statut]}
					</span>
				</div>
				{employe.autres_infos ? (
					<p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
						{employe.autres_infos}
					</p>
				) : null}
			</section>

			{modifierMutation.isError ? (
				<div
					role="alert"
					className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
				>
					Impossible de modifier l'employé.
				</div>
			) : null}

			<EmployeFormDialog
				open={formOuvert}
				employe={employe}
				onOpenChange={(ouvert) => {
					if (!ouvert) setFormOuvert(false);
				}}
				onSaved={() => setFormOuvert(false)}
			/>
		</div>
	);
}
