import { Loader2, Printer, Search } from "lucide-react";
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
	type FactureSourceType,
	type FactureStatut,
	printFacturePdf,
} from "#/core/api/facturation";
import { useListFactures } from "#/core/api/hooks/use-factures";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";

/** Libellés français des types de source de facture. */
const SOURCE_TYPE_LABELS: Record<FactureSourceType, string> = {
	VENTE: "Vente (Boutique)",
	COMMANDE_PRESSING: "Pressing",
	COMMANDE_RESTAURANT: "Restaurant",
	SEJOUR: "Séjour",
	CHARGE: "Charge",
	LOCATION: "Location",
	RESERVATION_FETE: "Réservation Fête",
	PRESTATION: "Prestation",
	AUTRE: "Autre",
};

/** Libellés français du statut de facture. */
const FACTURE_STATUT_LABELS: Record<FactureStatut, string> = {
	PAYEE: "Payée",
	PARTIELLE: "Partielle",
	IMPAYEE: "Impayée",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut de facture — palette du projet. */
const FACTURE_STATUT_BADGE: Record<FactureStatut, string> = {
	PAYEE: "bg-[#27AE60] text-white",
	PARTIELLE: "bg-[#E67E22] text-white",
	IMPAYEE: "bg-[#E74C3C] text-white",
	ANNULEE: "bg-[#95A5A6] text-white",
};

/**
 * Page « Facturation ponctuelle » (M12) : consultation de toutes les factures
 * (tous modules confondus), filtres serveur (type/statut/recherche) et
 * téléchargement du PDF. Gated par `FACTURATION.VOIR` (route).
 */
export function FacturesPage() {
	const [sourceType, setSourceType] = useState<FactureSourceType | "tous">(
		"tous",
	);
	const [statut, setStatut] = useState<FactureStatut | "tous">("tous");
	const [recherche, setRecherche] = useState("");
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

	const {
		data: factures,
		isLoading,
		isError,
		refetch,
	} = useListFactures({
		sourceType: sourceType === "tous" ? undefined : sourceType,
		statut: statut === "tous" ? undefined : statut,
		recherche: recherche || undefined,
		limit: 100,
	});

	const handlePrint = async (id: string) => {
		setDownloadingId(id);
		try {
			await printFacturePdf(id);
		} catch (err) {
			console.error("Erreur impression:", err);
		} finally {
			setDownloadingId(null);
		}
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Facturation ponctuelle" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Facturation ponctuelle
				</h1>
				<p className="text-muted-foreground">
					Consulter et télécharger les factures de tous les services.
				</p>
			</section>

			<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
				<div className="relative min-w-56 flex-1">
					<Search
						className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden
					/>
					<Input
						value={recherche}
						onChange={(event) => setRecherche(event.target.value)}
						placeholder="Rechercher par numéro ou libellé…"
						aria-label="Rechercher une facture"
						className="pl-9"
					/>
				</div>

				<Select
					value={sourceType}
					onValueChange={(valeur) =>
						setSourceType(valeur as FactureSourceType | "tous")
					}
				>
					<SelectTrigger aria-label="Type" className="w-48">
						<SelectValue placeholder="Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tous">Tous les types</SelectItem>
						{(Object.keys(SOURCE_TYPE_LABELS) as FactureSourceType[]).map(
							(valeur) => (
								<SelectItem key={valeur} value={valeur}>
									{SOURCE_TYPE_LABELS[valeur]}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>

				<Select
					value={statut}
					onValueChange={(valeur) =>
						setStatut(valeur as FactureStatut | "tous")
					}
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

				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						setSourceType("tous");
						setStatut("tous");
						setRecherche("");
					}}
				>
					Réinitialiser
				</Button>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les factures.</p>
					<Button variant="outline" size="sm" onClick={() => void refetch()}>
						Réessayer
					</Button>
				</div>
			) : !factures || factures.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune facture trouvée.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									NUMÉRO
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									TYPE
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									MONTANT
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{factures.map((facture) => {
								const enCoursDeTelechargement = downloadingId === facture.id;
								return (
									<tr
										key={facture.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-4 py-3 font-medium text-foreground">
											{facture.numero}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{facture.libelle}
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{SOURCE_TYPE_LABELS[facture.source_type]}
										</td>
										<td className="px-4 py-3 text-right text-foreground">
											{formatMontantFCFA(facture.montant_total)}
										</td>
										<td className="px-4 py-3">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
													FACTURE_STATUT_BADGE[facture.statut],
												)}
											>
												{FACTURE_STATUT_LABELS[facture.statut]}
											</span>
										</td>
										<td className="px-4 py-3 text-right">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => void handlePrint(facture.id)}
												disabled={enCoursDeTelechargement}
											>
												{enCoursDeTelechargement ? (
													<Loader2
														className="size-4 animate-spin"
														aria-hidden
													/>
												) : (
													<Printer className="size-4" aria-hidden />
												)}
												PDF
											</Button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
