import { Link } from "@tanstack/react-router";
import { FileDown } from "lucide-react";
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
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { usePortailPaiements } from "../hooks/use-portail";
import {
	filtrerPaiements,
	PAIEMENT_TYPE_LABELS,
	type PortailPaiementType,
} from "../models/portail";
import { RecuDialog } from "./recu-dialog";

/** Filtres reflétés dans l'URL. */
export interface PortailPaiementsSearch {
	du?: string;
	au?: string;
	type?: string;
}

interface PortailPaiementsPageProps {
	initialSearch: PortailPaiementsSearch;
	onSearchChange: (
		maj: (prev: PortailPaiementsSearch) => PortailPaiementsSearch,
	) => void;
}

function BadgeType({ type }: { type: string }) {
	const libelle = PAIEMENT_TYPE_LABELS[type] ?? type;
	const variant =
		type === "LOYER" ? "info" : type === "CHARGE" ? "warning" : "neutral";
	return <Badge variant={variant}>{libelle}</Badge>;
}

/**
 * Page « Mon historique de paiements » (M2.5.3) : paiements du résident
 * (loyers, charges, autres), filtrables par période et type, avec reçu.
 */
export function PortailPaiementsPage({
	initialSearch,
	onSearchChange,
}: PortailPaiementsPageProps) {
	const paiementsQuery = usePortailPaiements();
	const [du, setDu] = useState(initialSearch.du ?? "");
	const [au, setAu] = useState(initialSearch.au ?? "");
	const [type, setType] = useState(initialSearch.type ?? "tous");
	const [recuId, setRecuId] = useState<string | null>(null);

	const changerFiltre = (patch: {
		du?: string;
		au?: string;
		type?: string;
	}) => {
		setDu(patch.du ?? du);
		setAu(patch.au ?? au);
		setType(patch.type ?? type);
		onSearchChange((prev) => ({ ...prev, ...patch }));
	};

	if (paiementsQuery.isLoading) {
		return (
			<div className="w-full space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (paiementsQuery.isError || !paiementsQuery.data) {
		return (
			<div className="w-full space-y-3 p-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Mon historique de paiements
				</h1>
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger vos paiements.</p>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full"
						onClick={() => void paiementsQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			</div>
		);
	}

	const paiements = filtrerPaiements(paiementsQuery.data.paiements, {
		du,
		au,
		type,
	});

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Mon historique de paiements" },
				]}
				title="Mon historique de paiements"
				description="Loyers, charges et autres paiements effectués."
				actions={
					<Button variant="outline" size="sm" className="rounded-full" asChild>
						<Link to="/residence/portail">Retour à mon espace</Link>
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
					value={type}
					onValueChange={(valeur) => changerFiltre({ type: valeur })}
				>
					<SelectTrigger aria-label="Type" className="w-44">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les types</SelectItem>
						{(Object.keys(PAIEMENT_TYPE_LABELS) as PortailPaiementType[]).map(
							(valeur) => (
								<SelectItem key={valeur} value={valeur}>
									{PAIEMENT_TYPE_LABELS[valeur]}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
			</div>

			{paiements.length === 0 ? (
				<EmptyState title="Aucun paiement trouvé." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>DATE</Th>
								<Th className="text-right">MONTANT</Th>
								<Th>TYPE</Th>
								<Th>MODE</Th>
								<Th>RÉFÉRENCE</Th>
								<Th className="text-right">REÇU</Th>
							</tr>
						</DataTableHead>
						<tbody>
							{paiements.map((paiement) => (
								<Tr key={paiement.id}>
									<Td className="text-muted-foreground">
										{formatDateHeureISO(paiement.date)}
									</Td>
									<Td className="text-right font-medium text-foreground">
										{formatMontantFCFA(paiement.montant)}
									</Td>
									<Td>
										<BadgeType type={paiement.type} />
									</Td>
									<Td className="text-foreground">{paiement.mode_paiement}</Td>
									<Td className="text-muted-foreground">
										{paiement.reference ?? "—"}
									</Td>
									<Td>
										<div className="flex items-center justify-end">
											<Button
												variant="ghost"
												size="sm"
												className="rounded-full"
												onClick={() => setRecuId(paiement.id)}
											>
												<FileDown className="size-4" aria-hidden />
												Reçu
											</Button>
										</div>
									</Td>
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
			)}

			<RecuDialog
				open={recuId !== null}
				kind="paiement"
				id={recuId}
				onOpenChange={(ouvert) => {
					if (!ouvert) setRecuId(null);
				}}
			/>
		</div>
	);
}
