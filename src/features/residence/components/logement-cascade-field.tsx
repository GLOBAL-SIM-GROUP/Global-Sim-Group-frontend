import { useState } from "react";

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
import { LOGEMENT_TYPE_LABELS } from "../models/logements";

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
}

/** Champ Select avec label visible (le contenu s'ouvre en portal). */
function SelectField({
	id,
	label,
	placeholder,
	value,
	onValueChange,
	children,
}: {
	id: string;
	label: string;
	placeholder?: string;
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Select value={value} onValueChange={onValueChange}>
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
 */
export function LogementCascadeField({
	value,
	onChange,
	disponibleUniquement = false,
}: LogementCascadeFieldProps) {
	const [batimentId, setBatimentId] = useState("");
	const batimentsQuery = useBatiments();
	const logementsQuery = useLogements(
		batimentId,
		"tous",
		disponibleUniquement ? "DISPONIBLE" : "tous",
	);
	const batiment = batimentsQuery.data?.find((item) => item.id === batimentId);

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

			{batiment ? (
				<SelectField
					id="logement-logement"
					label="Logement"
					placeholder="Sélectionner un logement"
					value={value}
					onValueChange={onChange}
				>
					{(logementsQuery.data ?? []).map((logement) => (
						<SelectItem key={logement.id} value={logement.id}>
							{logement.numero} — {LOGEMENT_TYPE_LABELS[logement.type]}
						</SelectItem>
					))}
				</SelectField>
			) : null}
		</div>
	);
}
