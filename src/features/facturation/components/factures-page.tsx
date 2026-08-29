import { AlertCircle, Download, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	downloadFacturePdf,
	type FactureSourceType,
	type FactureStatut,
} from "#/core/api/facturation";
import { useListFactures } from "#/core/api/hooks/use-factures";
import { cn } from "#/lib/utils";

const SOURCE_TYPES: { value: FactureSourceType; label: string }[] = [
	{ value: "VENTE", label: "Vente (Boutique)" },
	{ value: "COMMANDE_PRESSING", label: "Pressing" },
	{ value: "COMMANDE_RESTAURANT", label: "Restaurant" },
	{ value: "SEJOUR", label: "Séjour" },
	{ value: "CHARGE", label: "Charge" },
	{ value: "LOCATION", label: "Location" },
	{ value: "RESERVATION_FETE", label: "Réservation Fête" },
	{ value: "PRESTATION", label: "Prestation" },
	{ value: "AUTRE", label: "Autre" },
];

const STATUTS: { value: FactureStatut; label: string; color: string }[] = [
	{ value: "PAYEE", label: "Payée", color: "bg-green-100 text-green-800" },
	{
		value: "PARTIELLE",
		label: "Partielle",
		color: "bg-blue-100 text-blue-800",
	},
	{ value: "IMPAYEE", label: "Impayée", color: "bg-red-100 text-red-800" },
	{
		value: "ANNULEE",
		label: "Annulée",
		color: "bg-gray-100 text-gray-800",
	},
];

export function FacturesPage() {
	const [sourceType, setSourceType] = useState<FactureSourceType>();
	const [statut, setStatut] = useState<FactureStatut>();
	const [recherche, setRecherche] = useState("");
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

	const {
		data: factures,
		isLoading,
		error,
	} = useListFactures({
		sourceType,
		statut,
		recherche: recherche || undefined,
		limit: 100,
	});

	const handleDownload = async (id: string) => {
		setDownloadingId(id);
		try {
			await downloadFacturePdf(id);
		} catch (err) {
			console.error("Erreur téléchargement:", err);
		} finally {
			setDownloadingId(null);
		}
	};

	const getSourceTypeLabel = (type: FactureSourceType) => {
		return SOURCE_TYPES.find((t) => t.value === type)?.label || type;
	};

	const getStatutInfo = (s: FactureStatut) => {
		return STATUTS.find((st) => st.value === s);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<section className="space-y-1">
				<h1 className="text-2xl font-bold text-foreground">Factures</h1>
				<p className="text-muted-foreground">
					Consulter et télécharger les factures de tous les services
				</p>
			</section>

			{/* Filtres */}
			<Card>
				<CardContent className="pt-6">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{/* Recherche */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground">
								Recherche
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
								<Input
									placeholder="Numéro, libellé..."
									value={recherche}
									onChange={(e) => setRecherche(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>

						{/* Source Type */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground">
								Type
							</label>
							<Select
								value={sourceType || ""}
								onValueChange={(v) => setSourceType(v as FactureSourceType)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Tous les types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Tous les types</SelectItem>
									{SOURCE_TYPES.map((t) => (
										<SelectItem key={t.value} value={t.value}>
											{t.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Statut */}
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground">
								Statut
							</label>
							<Select
								value={statut || ""}
								onValueChange={(v) => setStatut(v as FactureStatut)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Tous les statuts" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Tous les statuts</SelectItem>
									{STATUTS.map((s) => (
										<SelectItem key={s.value} value={s.value}>
											{s.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Actions */}
						<div className="flex items-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setSourceType(undefined);
									setStatut(undefined);
									setRecherche("");
								}}
								className="w-full"
							>
								Réinitialiser
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Liste */}
			{isLoading && (
				<div className="flex justify-center py-12">
					<Loader2 className="size-8 animate-spin text-lagoon" />
				</div>
			)}

			{error && (
				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6">
						<div className="flex gap-3">
							<AlertCircle className="size-5 text-destructive flex-shrink-0" />
							<p className="text-destructive">
								Erreur lors du chargement des factures
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{!isLoading && !error && factures && factures.length === 0 && (
				<Card>
					<CardContent className="pt-6 text-center py-12 text-muted-foreground">
						Aucune facture trouvée
					</CardContent>
				</Card>
			)}

			{!isLoading && factures && factures.length > 0 && (
				<div className="space-y-3">
					{factures.map((facture) => {
						const statutInfo = getStatutInfo(facture.statut);
						const isDownloading = downloadingId === facture.id;

						return (
							<Card
								key={facture.id}
								className="hover:shadow-md transition-shadow"
							>
								<CardContent className="pt-6">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-3">
												<div>
													<h3 className="font-semibold text-foreground">
														{facture.numero}
													</h3>
													<p className="text-sm text-muted-foreground">
														{facture.libelle}
													</p>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div>
													<p className="text-muted-foreground">Type</p>
													<p className="font-medium text-foreground">
														{getSourceTypeLabel(facture.source_type)}
													</p>
												</div>
												<div>
													<p className="text-muted-foreground">Montant</p>
													<p className="font-medium text-foreground">
														{facture.montant_total} FCFA
													</p>
												</div>
											</div>
										</div>

										<div className="flex flex-col items-end gap-3">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
													statutInfo?.color || "bg-gray-100 text-gray-800",
												)}
											>
												{statutInfo?.label || facture.statut}
											</span>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => handleDownload(facture.id)}
												disabled={isDownloading}
											>
												{isDownloading ? (
													<Loader2 className="size-4 animate-spin" />
												) : (
													<Download className="size-4" />
												)}
												<span className="ml-1">PDF</span>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
