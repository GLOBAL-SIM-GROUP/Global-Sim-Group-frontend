import type { UseMutationResult } from "@tanstack/react-query";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Switch } from "#/components/ui/switch";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	useCataloguePressing,
	useCreerPrestation,
	useCreerTypeVetement,
	useMajPrestation,
	useMajTypeVetement,
} from "../hooks/use-catalogue";

interface EntreeLibelle {
	id: string;
	libelle: string;
	actif: boolean;
}

type MutationLibelle = UseMutationResult<
	unknown,
	Error,
	{ id: string; libelle?: string; actif?: boolean },
	unknown
>;

function messageErreur(error: unknown): string {
	const apiError = toApiError(error);
	return (
		getErrorMessageForCode(apiError.code) ??
		apiError.message ??
		"Une erreur est survenue."
	);
}

/**
 * Section générique du catalogue pressing : liste des libellés (actifs +
 * inactifs), ajout, renommage inline et bascule `actif`. `actif=false` retire
 * le libellé des saisies futures sans toucher l'historique ; un libellé en
 * doublon est refusé par le serveur (409, message affiché tel quel).
 */
function SectionLibelles({
	titre,
	description,
	singularite,
	items,
	canGerer,
	chargement,
	enErreur,
	creerMutation,
	majMutation,
}: {
	titre: string;
	description: string;
	/** Nom singulier pour les messages (« type de vêtement » / « prestation »). */
	singularite: string;
	items: EntreeLibelle[];
	canGerer: boolean;
	chargement: boolean;
	enErreur: boolean;
	creerMutation: UseMutationResult<unknown, Error, string, unknown>;
	majMutation: MutationLibelle;
}) {
	const [nouveauLibelle, setNouveauLibelle] = useState("");
	const [enEdition, setEnEdition] = useState<EntreeLibelle | null>(null);
	const [libelleEdition, setLibelleEdition] = useState("");
	const [erreur, setErreur] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<string | null>(null);

	const ajouter = async (event: React.FormEvent) => {
		event.preventDefault();
		setErreur(null);
		setConfirmation(null);
		const libelle = nouveauLibelle.trim();
		if (!libelle) {
			setErreur(`Indiquez le libellé de la ${singularite}.`);
			return;
		}
		try {
			await creerMutation.mutateAsync(libelle);
			setNouveauLibelle("");
			setConfirmation(`« ${libelle} » ajouté au catalogue.`);
		} catch (error) {
			setErreur(messageErreur(error));
		}
	};

	const renommer = async () => {
		if (!enEdition) return;
		setErreur(null);
		setConfirmation(null);
		const libelle = libelleEdition.trim();
		if (!libelle || libelle === enEdition.libelle) {
			setEnEdition(null);
			return;
		}
		try {
			await majMutation.mutateAsync({ id: enEdition.id, libelle });
			setConfirmation(`« ${enEdition.libelle} » renommé en « ${libelle} ».`);
			setEnEdition(null);
		} catch (error) {
			setErreur(messageErreur(error));
		}
	};

	const basculerActif = async (item: EntreeLibelle) => {
		setErreur(null);
		setConfirmation(null);
		try {
			await majMutation.mutateAsync({ id: item.id, actif: !item.actif });
			setConfirmation(
				item.actif
					? `« ${item.libelle} » retiré des saisies futures.`
					: `« ${item.libelle} » réactivé.`,
			);
		} catch (error) {
			setErreur(messageErreur(error));
		}
	};

	return (
		<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
			<h2 className="text-base font-semibold text-foreground">{titre}</h2>
			<p className="mt-1 text-sm text-muted-foreground">{description}</p>

			{erreur ? (
				<p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{erreur}
				</p>
			) : confirmation ? (
				<p className="mt-3 rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
					{confirmation}
				</p>
			) : null}

			{canGerer ? (
				<form
					className="mt-4 flex flex-wrap items-end gap-3"
					onSubmit={(event) => void ajouter(event)}
				>
					<div className="min-w-64 flex-1">
						<InputField
							id={`catalogue-nouveau-${singularite}`}
							name="libelle"
							label={`Nouveau libellé`}
							placeholder={`ex : ${singularite}`}
							autoComplete="off"
							maxLength={100}
							value={nouveauLibelle}
							onChange={(event) => setNouveauLibelle(event.target.value)}
						/>
					</div>
					<Button type="submit" disabled={creerMutation.isPending}>
						{creerMutation.isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						Ajouter
					</Button>
				</form>
			) : null}

			{chargement ? (
				<p className="mt-3 text-sm text-muted-foreground">Chargement…</p>
			) : enErreur ? (
				<p className="mt-3 text-sm text-destructive">
					Impossible de charger le catalogue.
				</p>
			) : items.length === 0 ? (
				<p className="mt-3 text-sm text-muted-foreground">
					Aucun libellé n'est configuré.
				</p>
			) : (
				<ul className="mt-3 divide-y divide-border">
					{items.map((item) => (
						<li
							key={item.id}
							className="flex flex-wrap items-center gap-3 py-3"
						>
							{enEdition?.id === item.id ? (
								<>
									<input
										aria-label="Nouveau libellé"
										className="min-w-48 flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
										maxLength={100}
										value={libelleEdition}
										onChange={(event) => setLibelleEdition(event.target.value)}
										onKeyDown={(event) => {
											if (event.key === "Enter") {
												event.preventDefault();
												void renommer();
											}
											if (event.key === "Escape") setEnEdition(null);
										}}
									/>
									<Button
										type="button"
										size="sm"
										disabled={majMutation.isPending}
										onClick={() => void renommer()}
									>
										{majMutation.isPending ? (
											<Loader2 className="size-4 animate-spin" aria-hidden />
										) : (
											<Check className="size-4" aria-hidden />
										)}
										Enregistrer
									</Button>
									<Button
										type="button"
										size="sm"
										variant="ghost"
										disabled={majMutation.isPending}
										onClick={() => setEnEdition(null)}
									>
										<X className="size-4" aria-hidden />
										Annuler
									</Button>
								</>
							) : (
								<>
									<span className="flex-1 text-sm font-medium text-foreground">
										{item.libelle}
									</span>
									<span
										className={cn(
											"rounded-full px-2.5 py-0.5 text-xs font-medium",
											item.actif
												? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
												: "bg-muted text-muted-foreground",
										)}
									>
										{item.actif ? "Actif" : "Inactif"}
									</span>
									{canGerer ? (
										<div className="flex items-center gap-2">
											<Button
												type="button"
												size="sm"
												variant="ghost"
												disabled={majMutation.isPending}
												onClick={() => {
													setEnEdition(item);
													setLibelleEdition(item.libelle);
													setErreur(null);
													setConfirmation(null);
												}}
											>
												<Pencil className="size-4" aria-hidden />
												Renommer
											</Button>
											<span className="flex items-center gap-2 text-sm text-muted-foreground">
												<Switch
													checked={item.actif}
													disabled={majMutation.isPending}
													onCheckedChange={() => void basculerActif(item)}
													aria-label={`${item.actif ? "Désactiver" : "Activer"} ${item.libelle}`}
												/>
												{item.actif ? "Désactiver" : "Activer"}
											</span>
										</div>
									) : null}
								</>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

/**
 * Catalogue pressing — types de vêtement + prestations (références souples
 * par libellé : la commande stocke le texte saisi). Lecture `PRESSING.VOIR` ;
 * ajout / renommage / bascule `actif` requièrent `PRESSING.GERER_CATALOGUE`.
 */
export function CataloguePage() {
	const canGerer = useCan("PRESSING.GERER_CATALOGUE");
	const catalogueQuery = useCataloguePressing();
	const creerType = useCreerTypeVetement();
	const majType = useMajTypeVetement();
	const creerPrestation = useCreerPrestation();
	const majPrestation = useMajPrestation();

	const typesVetement: EntreeLibelle[] = (
		catalogueQuery.data?.typesVetement ?? []
	).map((t) => ({
		id: t.id_type_vetement,
		libelle: t.libelle,
		actif: t.actif,
	}));
	const prestations: EntreeLibelle[] = (
		catalogueQuery.data?.prestations ?? []
	).map((p) => ({ id: p.id_prestation, libelle: p.libelle, actif: p.actif }));

	return (
		<div className="w-full space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Pressing", to: "/pressing/commandes" },
					{ label: "Catalogue" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Catalogue — Pressing
				</h1>
				<p className="text-muted-foreground">
					Libellés proposés lors des saisies de dépôt. Désactiver une entrée la
					retire des saisies futures sans modifier les commandes passées.
				</p>
			</section>

			<SectionLibelles
				titre="Types de vêtement"
				description="Libellés des articles déposés (ex : chemise, costume)."
				singularite="type de vêtement"
				items={typesVetement}
				canGerer={canGerer}
				chargement={catalogueQuery.isLoading}
				enErreur={catalogueQuery.isError}
				creerMutation={creerType}
				majMutation={majType}
			/>

			<SectionLibelles
				titre="Prestations"
				description="Libellés des prestations réalisables (ex : repassage, nettoyage à sec)."
				singularite="prestation"
				items={prestations}
				canGerer={canGerer}
				chargement={catalogueQuery.isLoading}
				enErreur={catalogueQuery.isError}
				creerMutation={creerPrestation}
				majMutation={majPrestation}
			/>
		</div>
	);
}
