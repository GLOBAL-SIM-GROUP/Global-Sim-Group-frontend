import { Link } from "@tanstack/react-router";
import { FileDown } from "lucide-react";
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
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

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
	const couleur =
		type === "LOYER"
			? "bg-[#2E86C1] text-white"
			: type === "CHARGE"
				? "bg-[#D35400] text-white"
				: "bg-[#95A5A6] text-white";
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
				couleur,
			)}
		>
			{libelle}
		</span>
	);
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
			<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
				<p className="text-sm text-muted-foreground">Chargement…</p>
			</div>
		);
	}

	if (paiementsQuery.isError || !paiementsQuery.data) {
		return (
			<div className="mx-auto w-full max-w-5xl space-y-3 p-6">
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
		<div className="mx-auto w-full max-w-5xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Mon espace résident", to: "/residence/portail" },
					{ label: "Mon historique de paiements" },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<h1 className="text-2xl font-semibold text-foreground">
						Mon historique de paiements
					</h1>
					<p className="text-muted-foreground">
						Loyers, charges et autres paiements effectués.
					</p>
				</section>
				<Button variant="outline" size="sm" asChild>
					<Link to="/residence/portail">Retour à mon espace</Link>
				</Button>
			</div>

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
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun paiement trouvé.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									DATE
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									MONTANT
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									TYPE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									MODE
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									RÉFÉRENCE
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									REÇU
								</th>
							</tr>
						</thead>
						<tbody>
							{paiements.map((paiement) => (
								<tr
									key={paiement.id}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDateHeureISO(paiement.date)}
									</td>
									<td className="px-4 py-3 text-right font-medium text-foreground">
										{formatMontantFCFA(paiement.montant)}
									</td>
									<td className="px-4 py-3">
										<BadgeType type={paiement.type} />
									</td>
									<td className="px-4 py-3 text-foreground">
										{paiement.mode_paiement}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{paiement.reference ?? "—"}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setRecuId(paiement.id)}
											>
												<FileDown className="size-4" aria-hidden />
												Reçu
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
