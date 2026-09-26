import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ConfirmDialog } from "#/features/residence/components/confirm-dialog";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

import { useMajOffre, useOffres, useSupprimerOffre } from "../hooks/use-offres";
import {
	ACTIVITE_LABELS,
	type ActiviteAbonnement,
	type Offre,
	UNITE_LABELS,
} from "../models/abonnements";
import { OffreFormDialog } from "./offre-form-dialog";

type ActiviteFiltre = "toutes" | ActiviteAbonnement;
type ActifFiltre = "tous" | "actives" | "inactives";

/**
 * Catalogue des offres d'abonnement (quotas prépayés pressing/restauration,
 * `ABONNEMENT.VOIR`) : liste + filtres serveur (recherche, activité, actif),
 * création/édition (`CREER`/`MODIFIER`), suppression (`SUPPRIMER`) — le 409
 * « offre déjà vendue » propose la désactivation comme seul recours.
 */
export function OffresPage() {
	const canCreer = useCan("ABONNEMENT.CREER");
	const canModifier = useCan("ABONNEMENT.MODIFIER");
	const canSupprimer = useCan("ABONNEMENT.SUPPRIMER");

	const [recherche, setRecherche] = useState("");
	const [activite, setActivite] = useState<ActiviteFiltre>("toutes");
	const [actif, setActif] = useState<ActifFiltre>("tous");

	const offresQuery = useOffres({
		...(recherche.trim() ? { recherche: recherche.trim() } : {}),
		...(activite !== "toutes" ? { activite } : {}),
		...(actif !== "tous" ? { actif: actif === "actives" } : {}),
	});
	const supprimerMutation = useSupprimerOffre();
	const desactiverMutation = useMajOffre();

	const [formOuvert, setFormOuvert] = useState(false);
	const [aModifier, setAModifier] = useState<Offre | null>(null);
	const [aSupprimer, setASupprimer] = useState<Offre | null>(null);
	const [erreurSuppression, setErreurSuppression] = useState<string | null>(
		null,
	);

	const offres = offresQuery.data ?? [];

	return (
		<div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Offres — Abonnements" },
				]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<h1 className="text-lg font-semibold text-foreground sm:text-2xl">
						Offres d'abonnement
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Quotas prépayés vendables au comptoir (pressing, restauration).
					</p>
				</section>
				{canCreer ? (
					<Button
						onClick={() => {
							setAModifier(null);
							setFormOuvert(true);
						}}
						className="w-full sm:w-auto justify-center"
					>
						<Plus className="size-4" aria-hidden />
						Nouvelle offre
					</Button>
				) : null}
			</div>

			<div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:flex-wrap sm:p-4">
				<div className="flex-1">
					<InputField
						placeholder="Rechercher par code ou libellé…"
						value={recherche}
						onChange={(event) => setRecherche(event.target.value)}
					/>
				</div>
				<Select
					value={activite}
					onValueChange={(valeur) => setActivite(valeur as ActiviteFiltre)}
				>
					<SelectTrigger aria-label="Activité" className="w-full sm:w-44">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="toutes">Toutes les activités</SelectItem>
						{(Object.keys(ACTIVITE_LABELS) as ActiviteAbonnement[]).map(
							(valeur) => (
								<SelectItem key={valeur} value={valeur}>
									{ACTIVITE_LABELS[valeur]}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
				<Select
					value={actif}
					onValueChange={(valeur) => setActif(valeur as ActifFiltre)}
				>
					<SelectTrigger aria-label="Actif" className="w-full sm:w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Toutes</SelectItem>
						<SelectItem value="actives">Actives</SelectItem>
						<SelectItem value="inactives">Inactives</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{offresQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : offresQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les offres.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void offresQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : offres.length === 0 ? (
				<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					Aucune offre. Créez la première offre d'abonnement.
				</p>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									CODE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ACTIVITÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									COUVERTURE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									QUOTA
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									PRIX
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DURÉE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{offres.map((offre) => (
								<tr key={offre.id_offre} className="border-t border-border">
									<td className="px-4 py-3 font-mono text-xs text-foreground">
										{offre.code}
									</td>
									<td className="px-4 py-3 text-foreground">{offre.libelle}</td>
									<td className="px-4 py-3 text-foreground">
										{ACTIVITE_LABELS[offre.activite] ?? offre.activite}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{offre.activite === "PRESSING"
											? (offre.prestation_libelle ?? "—")
											: `${offre.categorie_plat_libelle ?? "Tout plat"}${
													offre.max_par_jour
														? ` · max ${offre.max_par_jour}/j`
														: ""
												}`}
									</td>
									<td className="px-4 py-3 text-foreground">
										{offre.quota} {UNITE_LABELS[offre.unite] ?? offre.unite}
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatMontantFCFA(offre.prix)}
									</td>
									<td className="px-4 py-3 text-foreground">
										{offre.duree_jours} j
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
												offre.actif
													? "border-[#27AE60]/30 bg-[#27AE60]/10 text-[#27AE60]"
													: "border-border bg-muted text-muted-foreground",
											)}
										>
											{offre.actif ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-1">
											{canModifier ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Modifier l'offre"
													onClick={() => {
														setAModifier(offre);
														setFormOuvert(true);
													}}
												>
													<Pencil className="size-4" aria-hidden />
													<span className="sr-only">Modifier</span>
												</Button>
											) : null}
											{canSupprimer ? (
												<Button
													variant="ghost"
													size="icon-sm"
													title="Supprimer l'offre"
													onClick={() => {
														setErreurSuppression(null);
														supprimerMutation.reset();
														setASupprimer(offre);
													}}
												>
													<Trash2
														className="size-4 text-destructive"
														aria-hidden
													/>
													<span className="sr-only">Supprimer</span>
												</Button>
											) : null}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<OffreFormDialog
				open={formOuvert}
				offre={aModifier}
				onOpenChange={(ouvert) => {
					if (!ouvert) {
						setFormOuvert(false);
						setAModifier(null);
					}
				}}
				onSaved={() => {
					setFormOuvert(false);
					setAModifier(null);
				}}
			/>

			<ConfirmDialog
				open={aSupprimer !== null}
				onOpenChange={(ouvert) => {
					if (!ouvert) setASupprimer(null);
				}}
				title="Supprimer l'offre"
				message={
					erreurSuppression
						? `${erreurSuppression} — une offre déjà vendue ne peut pas être supprimée ; la désactiver la retire des ventes sans perdre l'historique.`
						: `Voulez-vous vraiment supprimer l'offre « ${aSupprimer?.libelle ?? ""} » ?`
				}
				confirmLabel={erreurSuppression ? "Désactiver l'offre" : "Supprimer"}
				cancelLabel="Fermer"
				destructive={!erreurSuppression}
				busy={supprimerMutation.isPending || desactiverMutation.isPending}
				onConfirm={() => {
					if (!aSupprimer) return;
					if (erreurSuppression) {
						// 409 « offre déjà vendue » : le seul recours est PATCH actif:false.
						desactiverMutation.mutate(
							{ id: aSupprimer.id_offre, actif: false },
							{ onSettled: () => setASupprimer(null) },
						);
						return;
					}
					supprimerMutation.mutate(aSupprimer.id_offre, {
						onSuccess: () => setASupprimer(null),
						onError: (error) => {
							const apiError = toApiError(error);
							setErreurSuppression(
								apiError.status === 409
									? apiError.message || "Cette offre a déjà été vendue."
									: apiError.message || "Suppression impossible.",
							);
						},
					});
				}}
			/>
		</div>
	);
}
