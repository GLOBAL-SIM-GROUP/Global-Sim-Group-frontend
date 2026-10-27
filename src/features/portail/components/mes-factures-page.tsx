import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { EmptyState } from "#/components/ui/empty-state";
import { Input } from "#/components/ui/input";
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
import {
	FACTURE_SOURCE_LABELS,
	FACTURE_STATUT_LABELS,
	FACTURE_STATUT_VARIANT,
	type FactureStatut,
} from "#/features/facturation/models/factures";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useMesFactures } from "../hooks/use-factures";
import { FactureDocuments } from "./facture-documents";

/** Filtres reflétés dans l'URL (et envoyés au serveur). */
export interface MesFacturesSearch {
	statut?: string;
	source?: string;
	du?: string;
	au?: string;
}

interface MesFacturesPageProps {
	breadcrumb: { label: string; to?: string }[];
	retourTo: string;
	retourLabel: string;
	initialSearch: MesFacturesSearch;
	onSearchChange: (maj: (prev: MesFacturesSearch) => MesFacturesSearch) => void;
}

/**
 * « Mes factures » — façade GET /facturation/portail/factures, partagée
 * entre l'espace client et le portail résident : toutes les factures des
 * services (restaurant, super-marché, pressing, salle de fête, abonnement,
 * séjour, résidence) avec téléchargement facture/reçu PDF et ticket.
 */
export function MesFacturesPage({
	breadcrumb,
	retourTo,
	retourLabel,
	initialSearch,
	onSearchChange,
}: MesFacturesPageProps) {
	const [statut, setStatut] = useState(initialSearch.statut ?? "tous");
	const [source, setSource] = useState(initialSearch.source ?? "tous");
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");

	const facturesQuery = useMesFactures({
		statut: statut === "tous" ? undefined : statut,
		source_type: source === "tous" ? undefined : source,
		du: du || undefined,
		au: au || undefined,
	});

	const changerFiltre = (patch: Partial<MesFacturesSearch>) => {
		setStatut(patch.statut ?? statut);
		setSource(patch.source ?? source);
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		onSearchChange((prev) => ({ ...prev, ...patch }));
	};

	if (facturesQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (facturesQuery.isError || !facturesQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">Mes factures</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos factures.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={() => void facturesQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const factures = facturesQuery.data;
	const sourcesPresentes = [
		...new Set(factures.map((f) => f.source_type).filter(Boolean)),
	] as string[];

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={breadcrumb}
				title="Mes factures"
				description="Factures, reçus et tickets de tous vos services."
				actions={
					<Button variant="outline" size="sm" className="rounded-full" asChild>
						<Link to={retourTo}>{retourLabel}</Link>
					</Button>
				}
			/>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
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
				<Select
					value={statut}
					onValueChange={(valeur) => changerFiltre({ statut: valeur })}
				>
					<SelectTrigger aria-label="Statut" className="w-44">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les statuts</SelectItem>
						{(Object.keys(FACTURE_STATUT_LABELS) as FactureStatut[]).map(
							(valeur) => (
								<SelectItem key={valeur} value={valeur}>
									{FACTURE_STATUT_LABELS[valeur]}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
				<Select
					value={source}
					onValueChange={(valeur) => changerFiltre({ source: valeur })}
				>
					<SelectTrigger aria-label="Service" className="w-52">
						<SelectValue placeholder="Service" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les services</SelectItem>
						{sourcesPresentes.map((valeur) => (
							<SelectItem key={valeur} value={valeur}>
								{FACTURE_SOURCE_LABELS[valeur] ?? valeur}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{factures.length === 0 ? (
				<EmptyState title="Aucune facture trouvée." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>DATE</Th>
								<Th>NUMÉRO</Th>
								<Th>SERVICE</Th>
								<Th>LIBELLÉ</Th>
								<Th className="text-right">MONTANT</Th>
								<Th className="text-right">RESTE</Th>
								<Th>STATUT</Th>
								<Th className="text-right">DOCUMENTS</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{factures.map((facture) => (
								<Tr key={facture.id}>
									<Td className="text-muted-foreground whitespace-nowrap">
										{formatDateHeureISO(facture.date)}
									</Td>
									<Td className="font-medium text-foreground whitespace-nowrap">
										{facture.numero}
									</Td>
									<Td className="text-muted-foreground">
										{FACTURE_SOURCE_LABELS[facture.source_type ?? ""] ??
											facture.source_type ??
											"—"}
									</Td>
									<Td className="max-w-56 truncate text-muted-foreground">
										{facture.libelle ?? "—"}
									</Td>
									<Td className="text-right font-medium text-foreground whitespace-nowrap">
										{formatMontantFCFA(facture.montant_total)}
									</Td>
									<Td className="text-right text-muted-foreground whitespace-nowrap">
										{formatMontantFCFA(facture.reste)}
									</Td>
									<Td>
										<Badge
											variant={
												FACTURE_STATUT_VARIANT[
													facture.statut as FactureStatut
												] ?? "neutral"
											}
										>
											{FACTURE_STATUT_LABELS[facture.statut as FactureStatut] ??
												facture.statut}
										</Badge>
									</Td>
									<Td>
										<FactureDocuments facture={facture} showLabel={false} />
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
			)}
		</div>
	);
}
