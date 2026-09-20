import { Check, Loader2, Pencil, X } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Switch } from "#/components/ui/switch";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import type { TypeManifestation } from "../api/catalogue";
import {
	useCatalogueSalleFete,
	useCreerTypeManifestation,
	useMajTypeManifestation,
} from "../hooks/use-catalogue";

/**
 * Catalogue salle de fête — types de manifestation (référence souple par
 * libellé : la réservation stocke le texte, le catalogue borne les saisies).
 * Lecture `SALLE_FETE.VOIR` ; ajout / renommage / bascule `actif` requièrent
 * `SALLE_FETE.GERER_CATALOGUE`. `actif=false` retire le libellé des saisies
 * futures sans toucher l'historique.
 */
export function CataloguePage() {
	const canGerer = useCan("SALLE_FETE.GERER_CATALOGUE");
	const catalogueQuery = useCatalogueSalleFete();
	const creerMutation = useCreerTypeManifestation();
	const majMutation = useMajTypeManifestation();

	const [nouveauLibelle, setNouveauLibelle] = useState("");
	const [enEdition, setEnEdition] = useState<TypeManifestation | null>(null);
	const [libelleEdition, setLibelleEdition] = useState("");
	const [erreur, setErreur] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<string | null>(null);

	const messageErreur = (error: unknown): string => {
		const apiError = toApiError(error);
		return (
			getErrorMessageForCode(apiError.code) ??
			apiError.message ??
			"Une erreur est survenue."
		);
	};

	const ajouter = async (event: React.FormEvent) => {
		event.preventDefault();
		setErreur(null);
		setConfirmation(null);
		const libelle = nouveauLibelle.trim();
		if (!libelle) {
			setErreur("Indiquez le libellé du type de manifestation.");
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
			await majMutation.mutateAsync({
				id: enEdition.id_type_manifestation,
				libelle,
			});
			setConfirmation(`« ${enEdition.libelle} » renommé en « ${libelle} ».`);
			setEnEdition(null);
		} catch (error) {
			setErreur(messageErreur(error));
		}
	};

	const basculerActif = async (type: TypeManifestation) => {
		setErreur(null);
		setConfirmation(null);
		try {
			await majMutation.mutateAsync({
				id: type.id_type_manifestation,
				actif: !type.actif,
			});
			setConfirmation(
				type.actif
					? `« ${type.libelle} » retiré des saisies futures.`
					: `« ${type.libelle} » réactivé.`,
			);
		} catch (error) {
			setErreur(messageErreur(error));
		}
	};

	const types = catalogueQuery.data ?? [];

	return (
		<div className="w-full space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{
						label: "Réservations — Salle de fête",
						to: "/salle-fete/reservations",
					},
					{ label: "Catalogue" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Catalogue — Types de manifestation
				</h1>
				<p className="text-muted-foreground">
					Libellés proposés lors des saisies de réservation. Désactiver un type
					le retire des saisies futures sans modifier les réservations passées.
				</p>
			</section>

			{erreur ? (
				<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{erreur}
				</p>
			) : confirmation ? (
				<p className="rounded-md border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
					{confirmation}
				</p>
			) : null}

			{canGerer ? (
				<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
					<h2 className="text-base font-semibold text-foreground">
						Ajouter un type de manifestation
					</h2>
					<form
						className="mt-3 flex flex-wrap items-end gap-3"
						onSubmit={(event) => void ajouter(event)}
					>
						<div className="min-w-64 flex-1">
							<InputField
								id="catalogue-nouveau-libelle"
								name="libelle"
								label="Libellé"
								placeholder="ex : Concert"
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
				</section>
			) : null}

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-base font-semibold text-foreground">
					Types existants
				</h2>
				{catalogueQuery.isLoading ? (
					<p className="mt-2 text-sm text-muted-foreground">Chargement…</p>
				) : catalogueQuery.isError ? (
					<p className="mt-2 text-sm text-destructive">
						Impossible de charger le catalogue.
					</p>
				) : types.length === 0 ? (
					<p className="mt-2 text-sm text-muted-foreground">
						Aucun type de manifestation n'est configuré.
					</p>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{types.map((type) => (
							<li
								key={type.id_type_manifestation}
								className="flex flex-wrap items-center gap-3 py-3"
							>
								{enEdition?.id_type_manifestation ===
								type.id_type_manifestation ? (
									<>
										<input
											aria-label="Nouveau libellé"
											className="min-w-48 flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
											maxLength={100}
											value={libelleEdition}
											onChange={(event) =>
												setLibelleEdition(event.target.value)
											}
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
											{type.libelle}
										</span>
										<span
											className={cn(
												"rounded-full px-2.5 py-0.5 text-xs font-medium",
												type.actif
													? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
													: "bg-muted text-muted-foreground",
											)}
										>
											{type.actif ? "Actif" : "Inactif"}
										</span>
										{canGerer ? (
											<div className="flex items-center gap-2">
												<Button
													type="button"
													size="sm"
													variant="ghost"
													disabled={majMutation.isPending}
													onClick={() => {
														setEnEdition(type);
														setLibelleEdition(type.libelle);
														setErreur(null);
														setConfirmation(null);
													}}
												>
													<Pencil className="size-4" aria-hidden />
													Renommer
												</Button>
												<span className="flex items-center gap-2 text-sm text-muted-foreground">
													<Switch
														checked={type.actif}
														disabled={majMutation.isPending}
														onCheckedChange={() => void basculerActif(type)}
														aria-label={`${type.actif ? "Désactiver" : "Activer"} ${type.libelle}`}
													/>
													{type.actif ? "Désactiver" : "Activer"}
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
		</div>
	);
}
