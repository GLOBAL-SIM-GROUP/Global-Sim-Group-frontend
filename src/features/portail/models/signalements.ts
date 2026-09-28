import type { ModuleCible, Signalement } from "#/core/api/signalements";

/**
 * Modules proposables au client/résident dans le formulaire portail
 * (`CreerSignalementPortailDto.module_cible`, backend 091) — sous-ensemble
 * strict du catalogue staff `ModuleCible` : le client ne connaît que les
 * services qu'il consomme, pas les modules internes (RH, FINANCES, AUDIT…).
 * Absent du corps = signalement `GENERAL` affecté ensuite par le personnel.
 */
export const MODULES_CIBLE_PORTAIL = [
	"RESIDENCE",
	"MARCHANDISE",
	"PRESSING",
	"RESTAURANT",
	"SALLE_FETE",
] as const satisfies readonly ModuleCible[];

export type ModuleCiblePortail = (typeof MODULES_CIBLE_PORTAIL)[number];

/** Libellés client-facing — « Marchandise » devient « Boutique » côté client. */
export const MODULE_CIBLE_PORTAIL_LABELS: Record<ModuleCiblePortail, string> = {
	RESIDENCE: "Résidence",
	MARCHANDISE: "Boutique",
	PRESSING: "Pressing",
	RESTAURANT: "Restaurant",
	SALLE_FETE: "Salle de fête",
};

/** Libellé de la cible côté portail : module choisi, sinon général. */
export function libelleCiblePortail(signalement: Signalement): string {
	if (signalement.cible_type === "GENERAL" || !signalement.module_cible) {
		return "Signalement général";
	}
	return (
		MODULE_CIBLE_PORTAIL_LABELS[
			signalement.module_cible as ModuleCiblePortail
		] ?? signalement.module_cible
	);
}
