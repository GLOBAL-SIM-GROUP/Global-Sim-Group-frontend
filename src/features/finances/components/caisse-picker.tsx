import { AlertTriangle, Landmark } from "lucide-react";
import { useEffect } from "react";

import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useActivites } from "../hooks/use-caisses-accessibles";
import type { CaisseAccessible } from "../models/caisses";

export interface CaissePickerProps {
	/** Résultat de `useCaissesAccessibles()` (`undefined` = en chargement). */
	caisses: CaisseAccessible[] | undefined;
	chargement?: boolean;
	/** Choix courant — utile seulement quand ≥ 2 caisses subalternes. */
	value: string;
	onChange: (id: string) => void;
	/** « destination » (encaissement) ou « source » (décaissement). */
	sens?: "destination" | "source";
	/** Message d'erreur champ (validation formulaire). */
	erreur?: string | null;
	id?: string;
	/**
	 * Code du secteur d'activité du formulaire appelant (`"PRESSING"`,
	 * `"RESTAURATION"`, `"SALLE_FETE"`, `"VENTE_MARCHANDISES"`,
	 * `"LOCATION_RESIDENTIEL"`, `"LOCATION_COMMERCIAL"` — voir
	 * `GET /finances/activites`). Quand fourni et qu'aucun choix n'est
	 * encore fait, la caisse **ouverte** de ce secteur est présélectionnée
	 * automatiquement parmi les caisses subalternes — le `Select` reste
	 * modifiable, rien n'est imposé.
	 */
	activiteCode?: string;
}

function libelleCaisse(caisse: CaisseAccessible): string {
	const proprietaire = caisse.utilisateur
		? `${caisse.utilisateur.prenom ?? ""} ${caisse.utilisateur.nom ?? ""}`.trim()
		: "";
	const suffixe = caisse.est_propre
		? " (ma caisse)"
		: proprietaire
			? ` — ${proprietaire}`
			: "";
	const activite = caisse.activite_libelle
		? ` · ${caisse.activite_libelle}`
		: "";
	return `${caisse.libelle}${suffixe}${activite}`;
}

/**
 * Sélecteur de caisse pour tout mouvement d'argent, piloté par
 * `GET /finances/caisses/accessibles` (le backend reste la frontière :
 * `CAISSE_REQUISE`/`CAISSE_NON_AUTORISEE`/`CAISSE_FERMEE` au submit).
 *
 * - `undefined`/chargement → indicateur discret ;
 * - `[]` → bannière « aucune caisse accessible » (le formulaire doit
 *   désactiver son submit — `erreurCaisseRequise`) ;
 * - 1 caisse ou une caisse `est_propre` → libellé en lecture seule (le
 *   serveur résout/force — ne pas envoyer `id_caisse`, cf.
 *   `idCaisseAEnvoyer`) ;
 * - ≥ 2 caisses subalternes → `Select` obligatoire (présélectionné sur la
 *   caisse ouverte du secteur `activiteCode` si fourni — reste modifiable),
 *   caisses fermées affichées mais désactivées avec le suffixe « (fermée) ».
 */
export function CaissePicker({
	caisses,
	chargement,
	value,
	onChange,
	sens = "destination",
	erreur,
	id,
	activiteCode,
}: CaissePickerProps) {
	// Hooks avant tout retour anticipé (règle des hooks) — `useActivites()`
	// a son propre garde-fou `enabled` (permission), inoffensif si
	// `activiteCode` n'est pas fourni par l'appelant.
	const activitesQuery = useActivites();

	// Présélection par secteur : seulement si rien n'est encore choisi, et
	// seulement parmi les caisses subalternes **ouvertes** (une caisse
	// fermée produirait `CAISSE_FERMEE` au submit) — le choix de
	// l'utilisateur, une fois posé, n'est jamais écrasé par cet effet.
	useEffect(() => {
		if (!activiteCode || value || !caisses || caisses.length < 2) return;
		if (caisses.some((caisse) => caisse.est_propre)) return;
		const activite = activitesQuery.data?.find((a) => a.code === activiteCode);
		if (!activite) return;
		const correspondante = caisses.find(
			(caisse) => caisse.id_activite === activite.id_activite && caisse.ouverte,
		);
		if (correspondante) onChange(correspondante.id_caisse);
	}, [activiteCode, value, caisses, activitesQuery.data, onChange]);

	if (chargement) {
		return (
			<p className="text-xs text-muted-foreground">Chargement des caisses…</p>
		);
	}

	// Query désactivée (pas la permission) ou en échec → le serveur résout
	// la caisse seul ; on n'affiche rien plutôt qu'un état bloquant.
	if (caisses === undefined) return null;

	const verbe = sens === "source" ? "depuis" : "sur";

	if (caisses.length === 0) {
		return (
			<div
				role="alert"
				className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
			>
				<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
				<span>
					Aucune caisse accessible — ouvrez une caisse ou demandez à un
					responsable de vous en rattacher une avant d'enregistrer l'opération.
				</span>
			</div>
		);
	}

	const propre = caisses.find((caisse) => caisse.est_propre);
	if (propre || caisses.length === 1) {
		const caisse = propre ?? caisses[0];
		return (
			<div className="flex items-center gap-2 rounded-md border border-border bg-accent/30 px-3 py-2 text-sm">
				<Landmark className="size-4 text-muted-foreground" aria-hidden />
				<span className="text-muted-foreground">
					{sens === "source" ? "Décaissement" : "Encaissement"} {verbe} :
				</span>
				<span className="font-medium text-foreground">
					{caisse.libelle}
					{caisse.ouverte ? "" : " (fermée)"}
				</span>
			</div>
		);
	}

	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>
				{sens === "source" ? "Caisse source" : "Caisse de destination"}
			</Label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger id={id} className="w-full">
					<SelectValue placeholder="Sélectionner une caisse" />
				</SelectTrigger>
				<SelectContent>
					{caisses.map((caisse) => (
						<SelectItem
							key={caisse.id_caisse}
							value={caisse.id_caisse}
							disabled={!caisse.ouverte}
						>
							{libelleCaisse(caisse)}
							{caisse.ouverte ? "" : " (fermée)"}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{erreur ? (
				<p role="alert" className="text-xs text-destructive">
					{erreur}
				</p>
			) : null}
		</div>
	);
}
