import { useEffect, useMemo, useState } from "react";

import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

import { useBatiments } from "../hooks/use-batiments";
import { useLogements } from "../hooks/use-logements";
import { useOccupationPeriode } from "../hooks/use-occupation-periode";
import { LOGEMENT_TYPE_LABELS, type Logement } from "../models/logements";

interface LogementCascadeFieldProps {
	/** Id du logement sélectionné (champ `idLogement` du formulaire). */
	value: string;
	onChange: (id: string) => void;
	/**
	 * Ne liste que les logements au statut DISPONIBLE (ex. création de
	 * contrat : on ne peut pas louer un logement déjà occupé). `false` par
	 * défaut — les autres usages (ex. ajout d'une charge) doivent pouvoir
	 * cibler n'importe quel logement, y compris occupé.
	 */
	disponibleUniquement?: boolean;
	/**
	 * Ne liste que les logements au statut OCCUPE (ayant un contrat actif).
	 * Utilisé par les formulaires de charge et d'abonnement : une charge ou
	 * un abonnement ne peut être rattaché qu'à un logement actuellement loué.
	 * `false` par défaut. Mutuellement exclusif avec `disponibleUniquement`.
	 */
	occupeUniquement?: boolean;
	/**
	 * Bâtiment présélectionné au montage (édition : celui du logement
	 * courant). Appliqué aussi si la valeur arrive en async, tant qu'aucun
	 * bâtiment n'a été choisi à la main.
	 */
	batimentInitial?: string;
	/**
	 * Logement à toujours proposer quand son bâtiment est sélectionné, même
	 * filtré par `disponibleUniquement` (édition : le logement actuel du
	 * contrat n'est pas DISPONIBLE mais doit rester sélectionnable).
	 */
	logementActuel?: Pick<Logement, "id" | "id_batiment" | "numero" | "type">;
	/**
	 * Période du séjour `[debut, fin[` (format backend `YYYY-MM-DD HH:MM:SS`
	 * ou datetime-local). Avec `disponibleUniquement`, exclut en plus les
	 * logements occupés sur la période — séjour `EN_COURS` chevauchant ou
	 * contrat `ACTIF` couvrant (même règle que le catalogue portail ;
	 * `GET /residence/logements` ne prend pas de dates, le filtrage est fait
	 * ici). Les logements ayant une demande `EN_ATTENTE` chevauchante restent
	 * proposables — le backend ne les bloque pas — mais sont suffixés
	 * « demande en attente ».
	 */
	periode?: { debut: string; fin: string } | null;
}

/** Champ Select avec label visible (le contenu s'ouvre en portal). */
function SelectField({
	id,
	label,
	placeholder,
	value,
	onValueChange,
	disabled,
	children,
}: {
	id: string;
	label: string;
	placeholder?: string;
	value: string;
	onValueChange: (value: string) => void;
	disabled?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={value} onValueChange={onValueChange} disabled={disabled}>
				<SelectTrigger id={id} aria-label={label} className="w-full">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>{children}</SelectContent>
			</Select>
		</div>
	);
}

/**
 * Sélection du logement par cascade : Bâtiment → Logement (le lister logements
 * exige le paramètre `batiment`, réel). Changer de bâtiment réinitialise le
 * logement choisi. `disponibleUniquement` restreint la liste aux logements
 * DISPONIBLE (cf. `LogementCascadeFieldProps`).
 *
 * Le Select « Logement » reste monté en permanence (juste désactivé tant
 * qu'aucun bâtiment n'est choisi) plutôt que d'apparaître/disparaître
 * conditionnellement : à l'intérieur d'une Dialog Radix, un Select qui se
 * (dé)monte pile au moment où un autre Select voisin se ferme peut rester
 * bloqué (aria-hidden/pointer-events non nettoyés par la pile de calques
 * Radix), rendant le second Select impossible à ouvrir.
 */
export function LogementCascadeField({
	value,
	onChange,
	disponibleUniquement = false,
	occupeUniquement = false,
	batimentInitial,
	logementActuel,
	periode,
}: LogementCascadeFieldProps) {
	const [batimentId, setBatimentId] = useState(batimentInitial ?? "");

	// `batimentInitial` peut arriver en async (détail du logement chargé en
	// parallèle) : l'appliquer tant qu'aucun bâtiment n'a été choisi à la
	// main — le Select n'a pas d'option « vide », `batimentId` ne reste vide
	// qu'avant le premier choix.
	useEffect(() => {
		if (!batimentId && batimentInitial) setBatimentId(batimentInitial);
	}, [batimentInitial, batimentId]);
	const batimentsQuery = useBatiments();
	const statutFiltre = disponibleUniquement
		? "DISPONIBLE"
		: occupeUniquement
			? "OCCUPE"
			: "tous";
	const logementsQuery = useLogements(batimentId, "tous", statutFiltre);
	const batiment = batimentsQuery.data?.find((item) => item.id === batimentId);

	// Filtre de période (création/validation de séjour) : recomposé en local
	// depuis séjours + contrats — le lister logements ignore les dates.
	const { occupes, enAttente } = useOccupationPeriode(
		disponibleUniquement ? periode?.debut : null,
		disponibleUniquement ? periode?.fin : null,
	);

	// Un logement choisi qui devient occupé sur la nouvelle période est
	// désélectionné (le backend renverrait un 409 à l'enregistrement) ;
	// `logementActuel` est conservé : il doit rester sélectionnable.
	useEffect(() => {
		if (value && occupes.has(value) && value !== logementActuel?.id) {
			onChange("");
		}
	}, [value, occupes, logementActuel?.id, onChange]);

	// `logementActuel` est fusionné dans la liste (dédupliqué, en tête) plutôt
	// que rendu comme item conditionnel : tous les `SelectItem` gardent une
	// `key` et une position stable entre les rendus.
	const logements = useMemo(() => {
		const liste = (logementsQuery.data ?? []).filter(
			(logement) => !occupes.has(logement.id),
		);
		if (
			!logementActuel ||
			batimentId !== logementActuel.id_batiment ||
			liste.some((logement) => logement.id === logementActuel.id)
		) {
			return liste;
		}
		return [logementActuel, ...liste];
	}, [logementsQuery.data, logementActuel, batimentId, occupes]);

	return (
		<div className="space-y-4">
			<SelectField
				id="logement-batiment"
				label="Bâtiment"
				placeholder="Sélectionner un bâtiment"
				value={batimentId}
				onValueChange={(valeur) => {
					setBatimentId(valeur);
					onChange("");
				}}
			>
				{(batimentsQuery.data ?? []).map((item) => (
					<SelectItem key={item.id} value={item.id}>
						{item.code} — {item.nom}
					</SelectItem>
				))}
			</SelectField>

			<SelectField
				id="logement-logement"
				label="Logement"
				placeholder={
					batiment
						? "Sélectionner un logement"
						: "Choisissez d'abord un bâtiment"
				}
				value={value}
				onValueChange={onChange}
				disabled={!batiment}
			>
				{logements.map((logement) => (
					<SelectItem key={logement.id} value={logement.id}>
						{logement.numero} — {LOGEMENT_TYPE_LABELS[logement.type]}
						{enAttente.has(logement.id) ? " · demande en attente" : ""}
					</SelectItem>
				))}
			</SelectField>

			{periode?.debut && periode.fin && disponibleUniquement ? (
				<p className="text-xs text-muted-foreground">
					Seuls les logements libres sur la période saisie sont proposés (séjour
					en cours ou contrat actif exclus).
				</p>
			) : null}
		</div>
	);
}
