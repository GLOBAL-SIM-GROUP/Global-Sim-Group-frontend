import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Wallet } from "lucide-react";
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
import { useCan } from "#/core/auth";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useSouscriptions } from "../hooks/use-souscriptions";
import {
	ACTIVITE_LABELS,
	type ActiviteAbonnement,
	ETAT_LABELS,
	type EtatSouscription,
	type Souscription,
	UNITE_LABELS,
} from "../models/abonnements";
import { EtatBadge } from "./etat-badge";
import { SoldeProgress } from "./solde-progress";
import { VendreSouscriptionDialog } from "./vendre-souscription-dialog";

export type ActiviteFiltre = "toutes" | ActiviteAbonnement;
export type EtatFiltre = "tous" | EtatSouscription;

/** Filtres reflétés dans l'URL (`reliquat=a_decider` = file des reliquats). */
export interface SouscriptionsSearch {
	recherche?: string;
	activite?: ActiviteFiltre;
	etat?: EtatFiltre;
	reliquat?: "a_decider";
}

interface SouscriptionsPageProps {
	initialSearch: SouscriptionsSearch;
	onSearchChange: (
		maj: (prev: SouscriptionsSearch) => SouscriptionsSearch,
	) => void;
}

/**
 * Souscriptions vendues (quotas prépayés, `ABONNEMENT.VOIR`) : liste +
 * filtres serveur (recherche, activité, état, file « reliquats à décider »
 * via `?reliquat=a_decider`), vente (`ABONNEMENT.VENDRE`) — le détail et les
 * actions (paiement, ajustement, résiliation, reliquat) vivent sur la fiche.
 */
export function SouscriptionsPage({
	initialSearch,
	onSearchChange,
}: SouscriptionsPageProps) {
	const navigate = useNavigate();
	const canVendre = useCan("ABONNEMENT.VENDRE");

	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [activite, setActivite] = useState<ActiviteFiltre>(
		initialSearch.activite ?? "toutes",
	);
	const [etat, setEtat] = useState<EtatFiltre>(initialSearch.etat ?? "tous");
	const [reliquatsSeuls, setReliquatsSeuls] = useState(
		initialSearch.reliquat === "a_decider",
	);

	const souscriptionsQuery = useSouscriptions({
		...(recherche.trim() ? { recherche: recherche.trim() } : {}),
		...(activite !== "toutes" ? { activite } : {}),
		...(etat !== "tous" ? { etat } : {}),
		...(reliquatsSeuls ? { reliquat_a_decider: true } : {}),
	});

	const [venteOuverte, setVenteOuverte] = useState(false);
	const souscriptions = souscriptionsQuery.data ?? [];

	return (
		<div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Souscriptions — Abonnements" },
				]}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
				<section className="space-y-1">
					<h1 className="text-lg font-semibold text-foreground sm:text-2xl">
						Souscriptions
					</h1>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Quotas prépayés vendus — soldes, validité et restes à payer.
					</p>
				</section>
				{canVendre ? (
					<Button
						onClick={() => setVenteOuverte(true)}
						className="w-full sm:w-auto justify-center"
					>
						<Plus className="size-4" aria-hidden />
						Vendre une souscription
					</Button>
				) : null}
			</div>

			<div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:flex-wrap sm:p-4">
				<div className="flex-1">
					<InputField
						placeholder="Rechercher par client ou offre…"
						value={recherche}
						onChange={(event) => {
							setRecherche(event.target.value);
							onSearchChange((prev) => ({
								...prev,
								recherche: event.target.value || undefined,
							}));
						}}
					/>
				</div>
				<Select
					value={activite}
					onValueChange={(valeur) => {
						const v = valeur as ActiviteFiltre;
						setActivite(v);
						onSearchChange((prev) => ({
							...prev,
							activite: v === "toutes" ? undefined : v,
						}));
					}}
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
					value={etat}
					onValueChange={(valeur) => {
						const v = valeur as EtatFiltre;
						setEtat(v);
						onSearchChange((prev) => ({
							...prev,
							etat: v === "tous" ? undefined : v,
						}));
					}}
				>
					<SelectTrigger aria-label="État" className="w-full sm:w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les états</SelectItem>
						{(Object.keys(ETAT_LABELS) as EtatSouscription[]).map((valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{ETAT_LABELS[valeur]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<label className="flex items-center gap-2 text-sm text-foreground">
					<input
						type="checkbox"
						checked={reliquatsSeuls}
						onChange={(event) => {
							setReliquatsSeuls(event.target.checked);
							onSearchChange((prev) => ({
								...prev,
								reliquat: event.target.checked ? "a_decider" : undefined,
							}));
						}}
					/>
					Reliquats à décider
				</label>
			</div>

			{souscriptionsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : souscriptionsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les souscriptions.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void souscriptionsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : souscriptions.length === 0 ? (
				<p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
					{reliquatsSeuls
						? "Aucun reliquat en attente de décision."
						: "Aucune souscription trouvée."}
				</p>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									CLIENT
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									OFFRE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									SOLDE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									VALIDITÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ÉTAT
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									RESTE À PAYER
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{souscriptions.map((souscription: Souscription) => (
								<tr
									key={souscription.id_souscription}
									className="border-t border-border"
								>
									<td className="px-4 py-3 text-foreground">
										{souscription.client_nom} {souscription.client_prenoms}
									</td>
									<td className="px-4 py-3 text-foreground">
										{souscription.offre_libelle}
										<span className="block text-xs text-muted-foreground">
											{ACTIVITE_LABELS[souscription.activite] ??
												souscription.activite}
										</span>
									</td>
									<td className="px-4 py-3">
										<SoldeProgress
											solde={souscription.solde}
											quota={souscription.quota}
											uniteLabel={
												UNITE_LABELS[souscription.unite] ?? souscription.unite
											}
										/>
									</td>
									<td className="px-4 py-3 text-foreground">
										{formatDateISO(souscription.date_debut)} →{" "}
										{formatDateISO(souscription.date_fin)}
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-col gap-1">
											<EtatBadge etat={souscription.etat} />
											{souscription.reliquat_a_decider ? (
												<span className="text-xs font-medium text-amber-600">
													Reliquat à décider
												</span>
											) : null}
										</div>
									</td>
									<td className="px-4 py-3 text-foreground">
										{Number(souscription.reste_a_payer) > 0 ? (
											formatMontantFCFA(souscription.reste_a_payer)
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</td>
									<td className="px-4 py-3 text-right">
										<Button variant="ghost" size="icon-sm" asChild>
											<Link
												to="/abonnements/souscriptions/$id"
												params={{ id: souscription.id_souscription }}
												title="Voir la souscription"
											>
												<Wallet className="size-4" aria-hidden />
												<span className="sr-only">Voir</span>
											</Link>
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<VendreSouscriptionDialog
				open={venteOuverte}
				onOpenChange={setVenteOuverte}
				onSaved={(souscription) => {
					setVenteOuverte(false);
					void navigate({
						to: "/abonnements/souscriptions/$id",
						params: { id: souscription.id_souscription },
					});
				}}
			/>
		</div>
	);
}
