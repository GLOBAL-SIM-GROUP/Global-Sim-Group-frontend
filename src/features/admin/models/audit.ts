/**
 * Journal d'audit (module M11, 12.5). Hand-typed revalidé sur le backend réel
 * (GET /audit/journal). Clé primaire wire `id_trace` → `id`.
 */
export interface TraceAudit {
	id: string;
	date_heure: string;
	id_utilisateur: string | null;
	module: string;
	operation: string;
	entite: string | null;
	entite_id: string | null;
	description: string | null;
	montant: string | null;
	avant: string | null;
}

/** Filtres du journal d'audit (URL + serveur). */
export interface AuditFiltres {
	utilisateur: string;
	module: string;
	operation: string;
	du: string;
	au: string;
	recherche: string;
}

/** Filtre côté client : texte libre sur module/entité/description. */
export function rechercherAudit(
	traces: readonly TraceAudit[],
	terme: string,
): TraceAudit[] {
	const t = terme.trim().toLowerCase();
	if (!t) return [...traces];
	return traces.filter((trace) => {
		const champs = [
			String(trace.module),
			trace.entite,
			trace.description,
			trace.operation,
		].filter((valeur): valeur is string => Boolean(valeur));
		return champs.some((valeur) => valeur.toLowerCase().includes(t));
	});
}

/** Résultat de la pagination client. */
export interface PageAudit {
	items: TraceAudit[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerAudit(
	traces: readonly TraceAudit[],
	page: number,
	pageSize: number,
): PageAudit {
	const total = traces.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = traces.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
