import { useState } from "react";

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
import { useCan } from "#/core/auth";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { usePaiements } from "../hooks/use-finances";
import { CaisseSelector } from "./caisse-selector";
import { useCurrentCaisse } from "../hooks/use-current-caisse";
import type { Paiement } from "../models/finances";
import { paginer } from "../models/finances";
import { PAIEMENTS_PAGE_SIZE } from "../permissions";

/** Filtres/pagination reflétés dans l'URL. */
export interface PaiementsSearch {
	du?: string;
	au?: string;
	type?: string;
	id_caisse?: string;
	page?: number;
}

interface PaiementsPageProps {
	initialSearch: PaiementsSearch;
	onSearchChange: (maj: (prev: PaiementsSearch) => PaiementsSearch) => void;
}

/**
 * Page « Encaissements » (module Finances, M8) : historique des paiements reçus,
 * filtrables par période (serveur) et par type (serveur).
 */
export function PaiementsPage({
	initialSearch,
	onSearchChange,
}: PaiementsPageProps) {
	const canVoir = useCan("FINANCES.VOIR");
	const userCaisse = useCurrentCaisse();
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [type, setType] = useState(initialSearch.type ?? "tous");
	const [idCaisse, setIdCaisse] = useState(initialSearch.id_caisse ?? userCaisse ?? "");
	const [page, setPage] = useState(initialSearch.page ?? 1);

	const paiementsQuery = usePaiements(
		initialSearch.du ?? "",
		initialSearch.au ?? "",
		initialSearch.type && initialSearch.type !== "tous"
			? initialSearch.type
			: undefined,
		idCaisse || userCaisse || undefined,
	);

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux encaissements.
			</div>
		);
	}

	const changerFiltre = (patch: {
		du?: string;
		au?: string;
		type?: string;
		id_caisse?: string;
	}) => {
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setType(patch.type ?? type);
		if (patch.id_caisse !== undefined) setIdCaisse(patch.id_caisse);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, ...patch, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const paiements = paiementsQuery.data ?? [];
	const pagination = paginer(paiements, page, PAIEMENTS_PAGE_SIZE);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Encaissements" }]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Encaissements
				</h1>
				<p className="text-muted-foreground">
					Historique des paiements reçus sur la plateforme.
				</p>
			</section>

			<div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<div className="flex flex-wrap items-center gap-3">
					<Select
						value={type}
						onValueChange={(valeur) => changerFiltre({ type: valeur })}
					>
						<SelectTrigger aria-label="Type de paiement" className="w-48">
							<SelectValue placeholder="Type de paiement" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="tous">Tous les types</SelectItem>
							<SelectItem value="ENCAISSEMENT">Encaissement</SelectItem>
							<SelectItem value="DECAISSEMENT">Décaissement</SelectItem>
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
				{!userCaisse && (
					<CaisseSelector
						value={idCaisse}
						onChange={(id) => changerFiltre({ id_caisse: id })}
					/>
				)}
			</div>

			{paiementsQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : paiementsQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les paiements.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void paiementsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : paiements.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun encaissement trouvé.
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
									RÉFÉRENCE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									TYPE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									MOTIF
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									MONTANT
								</th>
							</tr>
						</thead>
						<tbody>
							{pagination.items.map((paiement) => (
								<tr
									key={paiement.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(paiement.date)}
									</td>
									<td className="px-4 py-3 font-medium text-foreground">
										{paiement.reference ?? "—"}
									</td>
									<td className="px-4 py-3">
										<BadgeType type={paiement.type} />
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{paiement.motif ?? "—"}
									</td>
									<td className="px-4 py-3 text-right font-semibold text-foreground">
										{formatMontantFCFA(paiement.montant)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des encaissements"
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

function BadgeType({ type }: { type: string }) {
	// `type` du wire est le sens du flux (ENCAISSEMENT/DECAISSEMENT), le motif
	// (ex. « Loyer CON-2026-003 ») vit dans `motif`.
	const couleurs: Record<string, string> = {
		ENCAISSEMENT: "bg-[#27AE60] text-white",
		DECAISSEMENT: "bg-[#E74C3C] text-white",
	};
	const libelles: Record<string, string> = {
		ENCAISSEMENT: "Encaissement",
		DECAISSEMENT: "Décaissement",
	};
	const label = libelles[type] ?? type;
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
				couleurs[type] ?? "bg-[#95A5A6] text-white"
			}`}
		>
			{label}
		</span>
	);
}

export type { Paiement };
