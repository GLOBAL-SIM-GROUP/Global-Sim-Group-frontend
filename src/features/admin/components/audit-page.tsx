import { FileDown, FileText } from "lucide-react";
import { useMemo, useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { formatDateHeureISO } from "#/features/residence/models/format";
import { construirePdf, telechargerPdf } from "#/lib/pdf";

import { useJournal } from "../hooks/use-audit";
import { useUtilisateurs } from "../hooks/use-utilisateurs";
import { paginerAudit, rechercherAudit } from "../models/audit";
import { JOURNAL_PAGE_SIZE } from "../permissions";

/** Filtres reflétés dans l'URL. */
export interface AuditSearch {
	utilisateur?: string;
	module?: string;
	du?: string;
	au?: string;
	recherche?: string;
	page?: number;
}

interface AuditPageProps {
	initialSearch: AuditSearch;
	onSearchChange: (maj: (prev: AuditSearch) => AuditSearch) => void;
}

/** CSV minimal (séparateur `;`, guillemets si besoin). */
function construireCsv(lignes: (string | number)[][]): string {
	return lignes
		.map((ligne) =>
			ligne
				.map((cellule) => {
					const valeur = String(cellule ?? "");
					return /[";\n]/.test(valeur)
						? `"${valeur.replace(/"/g, '""')}"`
						: valeur;
				})
				.join(";"),
		)
		.join("\n");
}

function telechargerTexte(nomFichier: string, contenu: string): void {
	const blob = new Blob([`﻿${contenu}`], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}

/**
 * Page « Historique des opérations » (M11, 12.5) : journal d'audit avec filtres
 * (utilisateur, module, période), recherche libre et export CSV/PDF.
 */
export function AuditPage({ initialSearch, onSearchChange }: AuditPageProps) {
	const [utilisateur, setUtilisateur] = useState(
		initialSearch.utilisateur ?? "tous",
	);
	const [module, setModule] = useState(initialSearch.module ?? "tous");
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [recherche, setRecherche] = useState(initialSearch.recherche ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);

	const journalQuery = useJournal({
		du: du || undefined,
		au: au || undefined,
		module,
		utilisateur,
		recherche: recherche || undefined,
	});
	const utilisateursQuery = useUtilisateurs();

	const utilisateurs = utilisateursQuery.data ?? [];
	const loginParId = useMemo(
		() => new Map(utilisateurs.map((u) => [u.id, u.login])),
		[utilisateurs],
	);
	const modules = useMemo(
		() => [...new Set((journalQuery.data ?? []).map((t) => t.module))].sort(),
		[journalQuery.data],
	);

	const changerFiltre = (patch: Partial<AuditSearch>) => {
		setUtilisateur(patch.utilisateur ?? utilisateur);
		setModule(patch.module ?? module);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setRecherche(patch.recherche ?? recherche);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const traces = rechercherAudit(journalQuery.data ?? [], recherche);
	const pagination = paginerAudit(traces, page, JOURNAL_PAGE_SIZE);

	const lignesExport = (): (string | number)[][] => [
		["Date", "Utilisateur", "Module", "Action", "Objet", "Détail"],
		...traces.map((t) => [
			t.date_heure,
			t.id_utilisateur
				? (loginParId.get(t.id_utilisateur) ?? t.id_utilisateur)
				: "—",
			t.module,
			t.operation,
			`${t.entite ?? ""} ${t.entite_id ?? ""}`.trim() || "—",
			t.description ?? "",
		]),
	];

	const exporterCsv = () => {
		telechargerTexte(
			`journal-audit-${du || "toutes"}-${au || "dates"}.csv`,
			construireCsv(lignesExport()),
		);
	};

	const exporterPdf = () => {
		telechargerPdf(
			construirePdf(
				lignesExport(),
				`Journal d'audit — ${du || "toutes"} → ${au || "dates"}`,
			),
			`journal-audit-${du || "toutes"}-${au || "dates"}.pdf`,
		);
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Historique des opérations" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Historique des opérations
					</h1>
					<p className="text-muted-foreground">
						Journal d'audit — qui, quoi, quand.
					</p>
				</section>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="outline"
						onClick={exporterCsv}
						disabled={traces.length === 0}
					>
						<FileDown className="size-4" aria-hidden />
						Exporter en Excel (CSV)
					</Button>
					<Button
						size="sm"
						onClick={exporterPdf}
						disabled={traces.length === 0}
					>
						<FileText className="size-4" aria-hidden />
						Exporter en PDF
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Input
					value={recherche}
					onChange={(event) => changerFiltre({ recherche: event.target.value })}
					placeholder="Recherche libre…"
					aria-label="Recherche"
					className="w-56"
				/>
				<Select
					value={utilisateur}
					onValueChange={(valeur) => changerFiltre({ utilisateur: valeur })}
				>
					<SelectTrigger aria-label="Utilisateur" className="w-44">
						<SelectValue placeholder="Utilisateur" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les utilisateurs</SelectItem>
						{utilisateurs.map((u) => (
							<SelectItem key={u.id} value={u.id}>
								{u.login}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={module}
					onValueChange={(valeur) => changerFiltre({ module: valeur })}
				>
					<SelectTrigger aria-label="Module" className="w-44">
						<SelectValue placeholder="Module" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les modules</SelectItem>
						{modules.map((m) => (
							<SelectItem key={m} value={m}>
								{m}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					type="date"
					value={du}
					onChange={(event) => changerFiltre({ du: event.target.value })}
					aria-label="Début de période"
					className="w-40"
				/>
				<Input
					type="date"
					value={au}
					onChange={(event) => changerFiltre({ au: event.target.value })}
					aria-label="Fin de période"
					className="w-40"
				/>
			</div>

			{journalQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : journalQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger le journal.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void journalQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune opération trouvée.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									DATE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									UTILISATEUR
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									MODULE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ACTION
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									OBJET
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									DÉTAIL
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((trace) => (
								<tr
									key={trace.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(trace.date_heure)}
									</td>
									<td className="px-4 py-3 text-foreground">
										{trace.id_utilisateur
											? (loginParId.get(trace.id_utilisateur) ??
												trace.id_utilisateur)
											: "—"}
									</td>
									<td className="px-4 py-3 text-foreground">{trace.module}</td>
									<td className="px-4 py-3 text-foreground">
										{trace.operation}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{`${trace.entite ?? ""} ${trace.entite_id ?? ""}`.trim() ||
											"—"}
									</td>
									<td className="max-w-md truncate px-4 py-3 text-muted-foreground">
										{trace.description ?? "—"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination du journal"
					className="flex flex-wrap items-center justify-between gap-4"
				>
					<p className="text-sm text-muted-foreground">
						Affichage de {pagination.start} à {pagination.end} sur{" "}
						{pagination.total} résultats
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page <= 1}
							onClick={() => allerPage(pagination.page - 1)}
						>
							Précédent
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={pagination.page >= pagination.totalPages}
							onClick={() => allerPage(pagination.page + 1)}
						>
							Suivant
						</Button>
					</div>
				</nav>
			) : null}
		</div>
	);
}
