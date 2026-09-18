import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import { useCan } from "#/core/auth";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { formatMontantFCFA } from "#/features/residence/models/format";

import {
	useCreerCommande,
	useModifierCommande,
	useTarifKg,
} from "../hooks/use-commandes";
import {
	apercuTotalLignePoids,
	type CommandePressing,
	type LigneCommandePressing,
	MODE_TARIFICATION_LABELS,
	type ModeTarificationPressing,
	validerLignePressing,
} from "../models/commandes";

interface CommandeFormProps {
	/** Commande à modifier (mode édition) ; null = dépôt. */
	commande: CommandePressing | null;
	/** Lignes actuelles (mode édition). */
	lignesInitiales?: LigneCommandePressing[];
	onCancel: () => void;
	onSaved: () => void;
}

interface LigneSaisie {
	/** Clé stable (index insuffisant : lignes ajoutées/retirées). */
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
 * Formulaire « Dépôt — Pressing » (M4) : recherche client, mode de
 * tarification (à la pièce ou au kilo — choisi une seule fois, verrouillé en
 * édition), articles (adaptés au mode) et date de retrait prévue. Total
 * calculé automatiquement (aperçu client pour les lignes au kilo — le total
 * réel reste toujours calculé par le backend). En édition : articles + date
 * de retrait (client et mode conservés).
 */
export function CommandeForm({
	commande,
	lignesInitiales,
	onCancel,
	onSaved,
}: CommandeFormProps) {
	const createMutation = useCreerCommande();
	const editMutation = useModifierCommande();
	const canGererTarifs = useCan("PRESSING.GERER_TARIFS");
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [idClient, setIdClient] = useState(commande?.id_client ?? "");
	// Verrouillé en édition (le backend refuse de changer le mode d'une
	// commande existante) ; par défaut à la pièce en création.
	const [mode, setMode] = useState<ModeTarificationPressing>(
		commande?.mode_tarification ?? "UNITAIRE",
	);
	const tarifKgQuery = useTarifKg(mode === "POIDS");

	// `cle` dérivée de l'index de construction (pas de `ligne.id`, qui n'est
	// pas forcément numérique) : garantit des clés 0..n-1 uniques quel que
	// soit le contenu de `lignesInitiales`.
	const lignesInitialesEffectives: LigneSaisie[] =
		lignesInitiales && lignesInitiales.length > 0
			? lignesInitiales.map((ligne, index) => ({
					cle: index,
					typeVetement: ligne.type_vetement,
					quantite: String(ligne.quantite),
					prestation: ligne.prestation,
					tarif: ligne.tarif ?? "",
					poidsKg: ligne.poids_kg ?? "",
				}))
			: [ligneVide(0)];
	const [lignes, setLignes] = useState<LigneSaisie[]>(
		lignesInitialesEffectives,
	);
	// Dérivée de la liste effectivement posée en état (jamais de `lignesInitiales`
	// directement) : évite qu'un tableau initial vide (ex. lignes pas encore
	// chargées) ne fasse démarrer `prochaineCle` à 0 et entre en collision avec
	// la ligne par défaut, elle aussi `cle: 0`.
	const [prochaineCle, setProchaineCle] = useState(
		lignesInitialesEffectives.length,
	);
	const [dateRetrait, setDateRetrait] = useState(
		commande?.date_retrait_prevue ?? "",
	);

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

	// Changer de mode (création seulement) réinitialise les champs propres à
	// l'autre mode — évite d'envoyer un `tarif`/`poids_kg` résiduel de l'ancien
	// mode, que le backend rejetterait (mutuelle exclusivité).
	const changerMode = (nouveauMode: ModeTarificationPressing) => {
		setMode(nouveauMode);
		setLignes((current) =>
			current.map((ligne) => ({
				...ligne,
				tarif: "",
				poidsKg: "",
				quantite: "1",
			})),
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

	const valider = (): string | null => {
		if (!commande && !idClient) return "Sélectionnez un client.";
		if (lignes.length === 0) return "Ajoutez au moins un article.";
		if (aucunTarifKgConfigure) {
			return "Aucun tarif au kilo n'est configuré — impossible de créer une commande au kilo.";
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
		if (!dateRetrait.trim()) return "Saisissez la date de retrait prévue.";
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		const lignesCorps = lignes.map((ligne) => ({
			typeVetement: ligne.typeVetement.trim(),
			quantite: ligne.quantite.trim(),
			prestation: ligne.prestation.trim(),
			...(mode === "UNITAIRE"
				? { tarif: ligne.tarif.trim() }
				: { poidsKg: ligne.poidsKg.trim() }),
		}));
		try {
			if (commande) {
				await editMutation.mutateAsync({
					id: commande.id,
					idClient,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
				});
			} else {
				await createMutation.mutateAsync({
					idClient,
					modeTarification: mode,
					dateRetraitPrevue: dateRetrait,
					lignes: lignesCorps,
				});
			}
			onSaved();
		} catch {
			setGlobalError("Une erreur est survenue lors de l'enregistrement.");
		}
	};

	return (
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void soumettre();
			}}
		>
			{!commande ? (
				<ClientRechercheField
					value={idClient}
					onChange={(id) => setIdClient(id)}
				/>
			) : null}

			<div className="space-y-2">
				<Label>Tarification</Label>
				{commande ? (
					<p className="text-sm text-foreground">
						{MODE_TARIFICATION_LABELS[mode]}
						<span className="ml-2 text-xs text-muted-foreground">
							(fixée à la création, non modifiable)
						</span>
					</p>
				) : (
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
									name="mode-tarification"
									checked={mode === valeur}
									onChange={() => changerMode(valeur)}
								/>
								{MODE_TARIFICATION_LABELS[valeur]}
							</label>
						))}
					</div>
				)}
				{aucunTarifKgConfigure ? (
					<div
						role="alert"
						className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
					>
						<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
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
					<Label>Articles</Label>
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
									majLigne(ligne.cle, { typeVetement: event.target.value })
								}
							/>
							<InputField
								aria-label="Prestation"
								placeholder="Prestation (ex : Repassage)"
								value={ligne.prestation}
								onChange={(event) =>
									majLigne(ligne.cle, { prestation: event.target.value })
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
											majLigne(ligne.cle, { quantite: event.target.value })
										}
									/>
									<InputField
										aria-label="Tarif"
										placeholder="Tarif (FCFA)"
										inputMode="numeric"
										value={ligne.tarif}
										onChange={(event) =>
											majLigne(ligne.cle, { tarif: event.target.value })
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
										majLigne(ligne.cle, { poidsKg: event.target.value })
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
				<Label htmlFor="commande-retrait">Date de retrait prévue</Label>
				<input
					id="commande-retrait"
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
					disabled={createMutation.isPending || editMutation.isPending}
					onClick={onCancel}
				>
					Annuler
				</Button>
				<Button
					type="submit"
					disabled={createMutation.isPending || editMutation.isPending}
				>
					{createMutation.isPending || editMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{createMutation.isPending || editMutation.isPending
						? "Enregistrement…"
						: "Enregistrer"}
				</Button>
			</div>
		</form>
	);
}
