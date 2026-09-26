import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { ApercuAbonnementPanel } from "#/features/abonnement/components/apercu-panel";
import { useApercuDebounced } from "#/features/abonnement/hooks/use-apercu";
import { CODE_EXCEDENT } from "#/features/abonnement/models/abonnements";
import { formatMontantFCFA } from "#/features/residence/models/format";
import type { MoyenPaiement } from "#/features/residence/models/moyens-paiement";

import {
	apercuAbonnementCommande,
	type LigneCommandeBody,
} from "../api/commandes";
import { useTarifKg, useValiderDemande } from "../hooks/use-commandes";
import {
	apercuTotalLignePoids,
	type CommandePressingDetail,
	MODE_TARIFICATION_LABELS,
	type ModeTarificationPressing,
	validerLignePressing,
} from "../models/commandes";

interface ValiderDemandeDialogProps {
	open: boolean;
	/** Demande `EN_ATTENTE` à chiffrer (détail, lignes déclarées embarquées). */
	commande: CommandePressingDetail | null;
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

interface LigneSaisie {
	cle: number;
	typeVetement: string;
	quantite: string;
	prestation: string;
	tarif: string;
	poidsKg: string;
}

const ligneVide = (cle: number): LigneSaisie => ({
	cle,
	typeVetement: "",
	quantite: "1",
	prestation: "",
	tarif: "",
	poidsKg: "",
});

/**
 * Modale « Valider la demande de dépôt » (Pressing, portail résident) :
 * chiffrage des lignes déclarées par le résident — choix du mode de
 * tarification, tarif/poids par article, date de retrait prévue et acompte
 * éventuel — puis `POST /pressing/commandes/{id}/valider` (→ `DEPOSE`,
 * PRESSING.CREER).
 */
export function ValiderDemandeDialog({
	open,
	commande,
	moyens,
	onOpenChange,
	onSaved,
}: ValiderDemandeDialogProps) {
	const mutation = useValiderDemande();
	const canGererTarifs = useCan("PRESSING.GERER_TARIFS");
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [mode, setMode] = useState<ModeTarificationPressing>("UNITAIRE");
	const tarifKgQuery = useTarifKg(mode === "POIDS" && open);

	const lignesInitiales: LigneSaisie[] =
		commande && commande.lignes.length > 0
			? commande.lignes.map((ligne, index) => ({
					cle: index,
					typeVetement: ligne.type_vetement,
					quantite: String(ligne.quantite),
					prestation: ligne.prestation,
					tarif: ligne.tarif ?? "",
					poidsKg: ligne.poids_kg ?? "",
				}))
			: [ligneVide(0)];
	const [lignes, setLignes] = useState<LigneSaisie[]>(lignesInitiales);
	const [prochaineCle, setProchaineCle] = useState(lignesInitiales.length);
	const [dateRetrait, setDateRetrait] = useState(
		commande?.date_retrait_prevue ?? "",
	);
	const [acompte, setAcompte] = useState("");
	const [idMoyen, setIdMoyen] = useState(moyens[0]?.id ?? "");
	// Abonnements : ignorer = plein tarif ; `excedentConfirme` armé par le 409
	// `ABONNEMENT_EXCEDENT` (message serveur affiché, resubmit confirmé).
	const [ignorerAbonnement, setIgnorerAbonnement] = useState(false);
	const [excedentConfirme, setExcedentConfirme] = useState(false);

	const ajouterLigne = () => {
		setLignes((current) => [...current, ligneVide(prochaineCle)]);
		setProchaineCle((valeur) => valeur + 1);
	};
	const majLigne = (cle: number, patch: Partial<LigneSaisie>) =>
		setLignes((current) =>
			current.map((ligne) =>
				ligne.cle === cle ? { ...ligne, ...patch } : ligne,
			),
		);
	const retirerLigne = (cle: number) =>
		setLignes((current) => current.filter((ligne) => ligne.cle !== cle));

	const changerMode = (nouveauMode: ModeTarificationPressing) => {
		setMode(nouveauMode);
		setLignes((current) =>
			current.map((ligne) => ({ ...ligne, tarif: "", poidsKg: "" })),
		);
	};

	const total = useMemo(() => {
		if (mode === "UNITAIRE") {
			return lignes.reduce(
				(somme, ligne) =>
					somme + (Number(ligne.tarif) || 0) * (Number(ligne.quantite) || 0),
				0,
			);
		}
		return lignes.reduce((somme, ligne) => {
			const apercu = apercuTotalLignePoids(
				ligne.poidsKg,
				tarifKgQuery.data?.prix_kg,
			);
			return somme + (apercu ?? 0);
		}, 0);
	}, [lignes, mode, tarifKgQuery.data]);

	const aucunTarifKgConfigure =
		mode === "POIDS" && !tarifKgQuery.isLoading && tarifKgQuery.data === null;

	// Aperçu de couverture abonnement sur les lignes chiffrées — débouncé
	// (~300 ms), seulement quand toutes les lignes sont complètes.
	const lignesCorps: LigneCommandeBody[] = lignes.map((ligne) => ({
		typeVetement: ligne.typeVetement.trim(),
		quantite: ligne.quantite.trim(),
		prestation: ligne.prestation.trim(),
		horsCatalogue: true,
		...(mode === "UNITAIRE"
			? { tarif: ligne.tarif.trim() }
			: { poidsKg: ligne.poidsKg.trim() }),
	}));
	const lignesCompletes =
		lignesCorps.length > 0 &&
		lignesCorps.every(
			(ligne) =>
				ligne.typeVetement !== "" &&
				ligne.prestation !== "" &&
				Number(ligne.quantite) > 0 &&
				(mode === "UNITAIRE"
					? Number(ligne.tarif) > 0
					: Number(ligne.poidsKg) > 0),
		);
	const apercuRequest =
		commande && lignesCompletes && !ignorerAbonnement
			? {
					idClient: commande.id_client,
					modeTarification: mode,
					lignes: lignesCorps,
				}
			: null;
	const apercu = useApercuDebounced(apercuAbonnementCommande, apercuRequest);
	// Acompte inutile quand l'abonnement couvre la totalité.
	const totalDu =
		apercu.data && !ignorerAbonnement ? apercu.data.total_du : null;
	const couvertureComplete = totalDu !== null && Number(totalDu) === 0;

	const valider = (): string | null => {
		if (lignes.length === 0) return "Ajoutez au moins un article.";
		if (aucunTarifKgConfigure) {
			return "Aucun tarif au kilo n'est configuré — impossible de chiffrer au kilo.";
		}
		for (const ligne of lignes) {
			const erreur = validerLignePressing(
				{
					typeVetement: ligne.typeVetement,
					quantite: ligne.quantite,
					prestation: ligne.prestation,
					tarif: mode === "UNITAIRE" ? ligne.tarif : undefined,
					poidsKg: mode === "POIDS" ? ligne.poidsKg : undefined,
				},
				mode,
			);
			if (erreur) return erreur;
		}
		if (acompte.trim() && Number(acompte) <= 0) {
			return "L'acompte doit être un montant positif (ou vide).";
		}
		if (acompte.trim() && !idMoyen) {
			return "Sélectionnez le moyen de paiement de l'acompte.";
		}
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		if (!commande) return;
		try {
			await mutation.mutateAsync({
				id: commande.id,
				modeTarification: mode,
				dateRetraitPrevue: dateRetrait.trim() || undefined,
				lignes: lignesCorps,
				...(acompte.trim()
					? { paiement: { montant: acompte.trim(), idMoyen } }
					: {}),
				utiliserAbonnement: !ignorerAbonnement,
				accepterExcedent: excedentConfirme || apercu.data?.excedent === true,
			});
			onSaved();
		} catch (error) {
			const apiError = toApiError(error);
			if (apiError.status === 409 && apiError.code === CODE_EXCEDENT) {
				setExcedentConfirme(true);
				setGlobalError(apiError.message || "Dépassement de quota abonnement.");
			} else {
				setGlobalError("Une erreur est survenue lors de la validation.");
			}
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Valider la demande de dépôt
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{commande
							? `Demande ${commande.numero_commande} — vérifiez les articles déclarés et chiffrez-les.`
							: "Chiffrer la demande et la passer en « Déposé »."}
					</Dialog.Description>

					<form
						className="mt-4 space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void soumettre();
						}}
					>
						<div className="space-y-2">
							<Label>Tarification</Label>
							<div className="flex gap-4">
								{(
									Object.keys(
										MODE_TARIFICATION_LABELS,
									) as ModeTarificationPressing[]
								).map((valeur) => (
									<label
										key={valeur}
										className="flex items-center gap-2 text-sm text-foreground"
									>
										<input
											type="radio"
											name="mode-tarification-validation"
											checked={mode === valeur}
											onChange={() => changerMode(valeur)}
										/>
										{MODE_TARIFICATION_LABELS[valeur]}
									</label>
								))}
							</div>
							{aucunTarifKgConfigure ? (
								<div
									role="alert"
									className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
								>
									<AlertTriangle
										className="mt-0.5 size-4 shrink-0"
										aria-hidden
									/>
									<span>
										Aucun tarif au kilo n'est encore configuré.
										{canGererTarifs
											? " Définissez-en un dans « Tarif au kilo » avant de continuer."
											: " Demandez à un responsable pressing d'en définir un."}
									</span>
								</div>
							) : null}
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Articles déclarés</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={ajouterLigne}
								>
									<Plus className="size-4" aria-hidden />
									Ajouter un article
								</Button>
							</div>

							{lignes.map((ligne) => (
								<div
									key={ligne.cle}
									className="space-y-3 rounded-md border border-border p-3"
								>
									<div className="grid gap-3 sm:grid-cols-2">
										<InputField
											aria-label="Type de vêtement"
											placeholder="Type de vêtement (ex : Chemise)"
											value={ligne.typeVetement}
											onChange={(event) =>
												majLigne(ligne.cle, {
													typeVetement: event.target.value,
												})
											}
										/>
										<InputField
											aria-label="Prestation"
											placeholder="Prestation (ex : Repassage)"
											value={ligne.prestation}
											onChange={(event) =>
												majLigne(ligne.cle, {
													prestation: event.target.value,
												})
											}
										/>
										{mode === "UNITAIRE" ? (
											<>
												<InputField
													aria-label="Quantité"
													type="number"
													min="1"
													value={ligne.quantite}
													onChange={(event) =>
														majLigne(ligne.cle, {
															quantite: event.target.value,
														})
													}
												/>
												<InputField
													aria-label="Tarif"
													placeholder="Tarif (FCFA)"
													inputMode="numeric"
													value={ligne.tarif}
													onChange={(event) =>
														majLigne(ligne.cle, {
															tarif: event.target.value,
														})
													}
												/>
											</>
										) : (
											<InputField
												aria-label="Poids (kg)"
												placeholder="Poids (kg, ex : 4.500)"
												inputMode="decimal"
												value={ligne.poidsKg}
												onChange={(event) =>
													majLigne(ligne.cle, {
														poidsKg: event.target.value,
													})
												}
											/>
										)}
									</div>
									{mode === "POIDS" && tarifKgQuery.data ? (
										<p className="text-xs text-muted-foreground">
											Aperçu :{" "}
											{formatMontantFCFA(
												String(
													apercuTotalLignePoids(
														ligne.poidsKg,
														tarifKgQuery.data.prix_kg,
													) ?? 0,
												),
											)}{" "}
											({formatMontantFCFA(tarifKgQuery.data.prix_kg)}/kg)
										</p>
									) : null}
									<div className="flex justify-end">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											disabled={lignes.length === 1}
											onClick={() => retirerLigne(ligne.cle)}
										>
											<Trash2 className="size-4 text-destructive" aria-hidden />
											Retirer
										</Button>
									</div>
								</div>
							))}
						</div>

						<div>
							<Label htmlFor="validation-retrait">Date de retrait prévue</Label>
							<input
								id="validation-retrait"
								className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
								type="date"
								value={dateRetrait}
								onChange={(event) => setDateRetrait(event.target.value)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-md border border-border bg-accent/30 px-4 py-3 text-sm">
							<span className="text-muted-foreground">
								Total {mode === "POIDS" ? "(aperçu)" : ""} :{" "}
								{formatMontantFCFA(String(total))}
							</span>
							{totalDu !== null ? (
								<span className="font-semibold text-foreground">
									À payer : {formatMontantFCFA(totalDu)}
								</span>
							) : null}
						</div>

						<ApercuAbonnementPanel
							apercu={apercu.data}
							pending={apercu.pending}
							error={apercu.error}
							visible={!ignorerAbonnement}
						/>
						{apercu.data && apercu.data.abonnements.length > 0 ? (
							<label className="flex items-center gap-2 text-sm text-muted-foreground">
								<input
									type="checkbox"
									checked={ignorerAbonnement}
									onChange={(event) =>
										setIgnorerAbonnement(event.target.checked)
									}
								/>
								Ne pas utiliser l'abonnement — facturer plein tarif
							</label>
						) : null}
						{excedentConfirme ? (
							<p
								role="alert"
								className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
							>
								Excédent confirmé — cliquez à nouveau pour valider en facturant
								le dépassement au résident.
							</p>
						) : null}

						<div className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
							{couvertureComplete ? (
								<p className="text-xs text-[#27AE60] sm:col-span-2">
									Commande entièrement couverte par l'abonnement — aucun acompte
									à encaisser.
								</p>
							) : null}
							<InputField
								id="validation-acompte"
								label="Acompte encaissé (FCFA, optionnel)"
								inputMode="numeric"
								value={acompte}
								onChange={(event) => setAcompte(event.target.value)}
							/>
							{acompte.trim() ? (
								<div className="space-y-2">
									<Label htmlFor="validation-moyen">Moyen de paiement</Label>
									<Select value={idMoyen} onValueChange={setIdMoyen}>
										<SelectTrigger id="validation-moyen" className="w-full">
											<SelectValue placeholder="Sélectionner un moyen" />
										</SelectTrigger>
										<SelectContent>
											{moyens.map((moyen) => (
												<SelectItem key={moyen.id} value={moyen.id}>
													{moyen.libelle}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							) : null}
						</div>

						{globalError ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{globalError}
							</p>
						) : null}

						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="ghost"
								disabled={mutation.isPending}
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								{mutation.isPending ? "Validation…" : "Valider et chiffrer"}
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
