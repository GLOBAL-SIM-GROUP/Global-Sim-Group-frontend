import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { PageHeader } from "#/components/ui/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { useCan } from "#/core/auth";
import { listFactures } from "#/features/facturation/api/factures";
import { facturesKeys } from "#/features/facturation/permissions";
import { listContrats } from "#/features/residence/api/contrats";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { contratsKeys } from "#/features/residence/permissions";
import { cn } from "#/lib/utils";

import { useImpayes } from "../hooks/use-finances";
import {
	type CibleImpaye,
	cibleImpaye,
	filtrerImpayes,
	paginer,
} from "../models/finances";
import { IMPAYES_PAGE_SIZE } from "../permissions";

/** Filtre/pagination reflétés dans l'URL. */
export interface ImpayesSearch {
	type?: string;
	page?: number;
}

interface ImpayesPageProps {
	initialSearch: ImpayesSearch;
	onSearchChange: (maj: (prev: ImpayesSearch) => ImpayesSearch) => void;
}

const TYPES_IMPAYE: { valeur: string; libelle: string }[] = [
	{ valeur: "tous", libelle: "Tous les types" },
	{ valeur: "LOYER", libelle: "Loyer" },
	{ valeur: "CHARGE", libelle: "Charge" },
	{ valeur: "SEJOUR", libelle: "Séjour" },
	{ valeur: "FACTURE", libelle: "Facture" },
];

function titreCible(cible: CibleImpaye): string {
	switch (cible.kind) {
		case "contrat":
			return "Voir le contrat";
		case "facture":
			return "Voir la facture";
		case "charges":
			return "Voir les charges";
		case "sejours":
			return "Voir les séjours";
		case "aucune":
			return "";
	}
}

/**
 * Lien typé vers la page correspondante d'un impayé (fiche contrat/facture ou
 * liste charges/séjours) ; sans cible, simple texte — la ligne reste non
 * cliquable.
 */
function LienCibleImpaye({
	cible,
	className,
	children,
}: {
	cible: CibleImpaye;
	className: string;
	children: ReactNode;
}) {
	const titre = titreCible(cible);
	if (cible.kind === "contrat") {
		return (
			<Link
				to="/residence/contrats/$id"
				params={{ id: cible.id }}
				title={titre}
				className={className}
			>
				{children}
			</Link>
		);
	}
	if (cible.kind === "facture") {
		return (
			<Link
				to="/facturation/factures/$id"
				params={{ id: cible.id }}
				title={titre}
				className={className}
			>
				{children}
			</Link>
		);
	}
	if (cible.kind === "charges") {
		return (
			<Link to="/residence/charges" title={titre} className={className}>
				{children}
			</Link>
		);
	}
	if (cible.kind === "sejours") {
		return (
			<Link to="/residence/sejours-courts" title={titre} className={className}>
				{children}
			</Link>
		);
	}
	return <span className={className}>{children}</span>;
}

/**
 * Page « Impayés » (module Finances, M8) : créances en souffrance, filtrables
 * par type.
 */
export function ImpayesPage({
	initialSearch,
	onSearchChange,
}: ImpayesPageProps) {
	const canVoir = useCan("FINANCES.VOIR");
	const canResidence = useCan("RESIDENCE.VOIR");
	const canFacturation = useCan("FACTURATION.VOIR");
	const [type, setType] = useState(initialSearch.type ?? "tous");
	const [page, setPage] = useState(initialSearch.page ?? 1);

	const impayesQuery = useImpayes(initialSearch.type ?? "tous");

	// Résolution des références d'impayés (numéro de contrat / de facture) vers
	// les fiches — requêtes inactives si le module associé n'est pas visible.
	const contratsQuery = useQuery({
		queryKey: contratsKeys.list(),
		queryFn: listContrats,
		enabled: canResidence,
	});
	const facturesQuery = useQuery({
		queryKey: facturesKeys.list(),
		queryFn: listFactures,
		enabled: canFacturation,
	});
	const contratParNumero = useMemo(
		() =>
			new Map(
				(contratsQuery.data ?? []).map((contrat) => [
					contrat.numero_contrat,
					contrat.id,
				]),
			),
		[contratsQuery.data],
	);
	const factureParNumero = useMemo(
		() =>
			new Map(
				(facturesQuery.data ?? []).map((facture) => [
					facture.numero,
					facture.id,
				]),
			),
		[facturesQuery.data],
	);

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux impayés.
			</div>
		);
	}

	const changerType = (valeur: string) => {
		setType(valeur);
		setPage(1);
		onSearchChange((prev) => ({ ...prev, type: valeur, page: 1 }));
	};

	const allerPage = (pageSuivante: number) => {
		setPage(pageSuivante);
		onSearchChange((prev) => ({ ...prev, page: pageSuivante }));
	};

	const impayes = impayesQuery.data ?? [];
	const filtres = filtrerImpayes(impayes, { type });
	const pagination = paginer(filtres, page, IMPAYES_PAGE_SIZE);

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Impayés" }]}
				title="Impayés"
				description="Créances en souffrance et restes dus."
			/>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<Select value={type} onValueChange={changerType}>
					<SelectTrigger aria-label="Type d'impayé" className="w-48">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						{TYPES_IMPAYE.map((option) => (
							<SelectItem key={option.valeur} value={option.valeur}>
								{option.libelle}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{impayesQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : impayesQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les impayés.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void impayesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : pagination.total === 0 ? (
				<EmptyState title="Aucun impayé trouvé." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>TYPE</Th>
								<Th>CLIENT</Th>
								<Th>RÉFÉRENCE</Th>
								<Th className="text-right">MONTANT DÛ</Th>
								<Th className="text-right">PAYÉ</Th>
								<Th className="text-right">RESTE</Th>
								<Th>ÉCHÉANCE</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{pagination.items.map((impaye) => {
								const cible = cibleImpaye(
									impaye,
									contratParNumero,
									factureParNumero,
									{ residence: canResidence, facturation: canFacturation },
								);
								return (
									<Tr
										key={`${impaye.type}-${impaye.reference}-${impaye.client}-${impaye.montant_du}`}
									>
										<Td>
											<BadgeImpayeType type={impaye.type} />
										</Td>
										<Td>
											{/* Toute la ligne ouvre la page correspondante (stretched
											    link) quand une cible existe. */}
											<LienCibleImpaye
												cible={cible}
												className={cn(
													"font-medium after:absolute after:inset-0",
													cible.kind === "aucune"
														? "text-foreground"
														: "text-lagoon transition-colors hover:underline",
												)}
											>
												{impaye.client}
											</LienCibleImpaye>
										</Td>
										<Td className="text-muted-foreground">
											{impaye.reference}
										</Td>
										<Td className="text-right text-foreground">
											{formatMontantFCFA(impaye.montant_du)}
										</Td>
										<Td className="text-right text-success">
											{formatMontantFCFA(impaye.montant_paye)}
										</Td>
										<Td className="text-right font-semibold text-destructive">
											{formatMontantFCFA(impaye.reste)}
										</Td>
										<Td className="text-muted-foreground">
											{formatDateISO(impaye.date_echeance)}
										</Td>
									</Tr>
								);
							})}
						</tbody>
					</DataTable>
				</TableShell>
			)}

			{pagination.total > 0 ? (
				<nav
					aria-label="Pagination des impayés"
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

function BadgeImpayeType({ type }: { type: string }) {
	const libelles: Record<string, string> = {
		LOYER: "Loyer",
		CHARGE: "Charge",
		SEJOUR: "Séjour",
		FACTURE: "Facture",
	};
	const variantes: Record<string, "info" | "warning" | "danger"> = {
		LOYER: "info",
		CHARGE: "warning",
		SEJOUR: "warning",
		FACTURE: "danger",
	};
	return (
		<Badge variant={variantes[type] ?? "neutral"}>
			{libelles[type] ?? type}
		</Badge>
	);
}
