/** Type de sauvegarde : automatique ou manuelle. */
export type SauvegardeType = "automatique" | "manuelle";

/** Statut d'une sauvegarde. */
export type SauvegardeStatut = "succes" | "echec" | "en_cours";

/** Enregistrement d'une sauvegarde dans l'historique. */
export interface Sauvegarde {
	id: string;
	date: string; // ISO 8601
	type: SauvegardeType;
	taille: number; // en octets
	statut: SauvegardeStatut;
}

/** Configuration de la sauvegarde automatique. */
export interface ConfigurationSauvegardes {
	frequence: "quotidienne" | "hebdomadaire";
	activee: boolean;
}

export const SAUVEGARDE_TYPE_LABELS: Record<SauvegardeType, string> = {
	automatique: "Automatique",
	manuelle: "Manuelle",
};

export const SAUVEGARDE_STATUT_LABELS: Record<SauvegardeStatut, string> = {
	succes: "Succès",
	echec: "Échec",
	en_cours: "En cours",
};

export const SAUVEGARDE_STATUT_COULEURS: Record<SauvegardeStatut, string> = {
	succes: "bg-[#27AE60] text-white",
	echec: "bg-[#E74C3C] text-white",
	en_cours: "bg-[#F39C12] text-white",
};

/** Formate une taille en octets en format lisible. */
export function formatTailleSauvegarde(octets: number): string {
	const unites = ["B", "KB", "MB", "GB"];
	let taille = octets;
	let index = 0;
	while (taille >= 1024 && index < unites.length - 1) {
		taille /= 1024;
		index++;
	}
	return `${taille.toFixed(2)} ${unites[index]}`;
}

/** Formate une date ISO en format lisible. */
export function formatDateSauvegarde(dateISO: string): string {
	const date = new Date(dateISO);
	return date.toLocaleString("fr-FR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}
