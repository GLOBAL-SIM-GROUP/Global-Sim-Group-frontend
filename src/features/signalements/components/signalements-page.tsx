import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Loader2,
	Plus,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { InputField } from "#/components/ui/input-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { listSignalements } from "#/core/api/signalements";

export interface SignalementsSearch {
	recherche?: string;
	statut?: string;
	sort?: string;
	order?: "asc" | "desc";
	page?: number;
}

const LIMIT = 10;

export function SignalementsPage({
	initialSearch = {},
	onSearchChange,
}: {
	initialSearch?: SignalementsSearch;
	onSearchChange?: (update: (prev: SignalementsSearch) => SignalementsSearch) => void;
}) {
	const navigate = useNavigate();
	const [search, setSearch] = useState<SignalementsSearch>(initialSearch);

	const page = search.page ?? 1;
	const offset = (page - 1) * LIMIT;

	const {
		data: signalements,
		isLoading,
		error,
	} = useQuery({
		queryKey: [
			"signalements",
			search.recherche,
			search.statut,
			search.sort,
			search.order,
			page,
		],
		queryFn: () =>
			listSignalements({
				recherche: search.recherche,
				statut: search.statut as any,
				sort: search.sort,
				order: search.order,
				limit: LIMIT,
				offset,
			}),
		enabled: typeof window !== "undefined",
	});

	const handleSearchChange = (
		update: (prev: SignalementsSearch) => SignalementsSearch,
	) => {
		const newSearch = update(search);
		setSearch(newSearch);
		onSearchChange?.(update);
	};

	const getStatusIcon = (statut: string) => {
		switch (statut) {
			case "OUVERT":
				return <AlertCircle className="size-4 text-yellow-500" />;
			case "EN_COURS":
				return <Clock className="size-4 text-blue-500" />;
			case "RESOLU":
				return <CheckCircle2 className="size-4 text-green-500" />;
			case "REJETE":
				return <XCircle className="size-4 text-red-500" />;
			default:
				return null;
		}
	};

	const getStatusLabel = (statut: string) => {
		const labels: Record<string, string> = {
			OUVERT: "Ouvert",
			EN_COURS: "En cours",
			RESOLU: "Résolu",
			REJETE: "Rejeté",
		};
		return labels[statut] || statut;
	};

	const getStatusBadge = (statut: string) => {
		const styles: Record<string, string> = {
			OUVERT: "bg-yellow-100 text-yellow-800",
			EN_COURS: "bg-blue-100 text-blue-800",
			RESOLU: "bg-green-100 text-green-800",
			REJETE: "bg-red-100 text-red-800",
		};
		return styles[statut] || "bg-gray-100 text-gray-800";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Signalements</h1>
					<p className="mt-1 text-muted-foreground">
						Gérez les signalements et problèmes signalés
					</p>
				</div>
				<Button
					className="bg-lagoon hover:bg-lagoon/90"
					onClick={() => navigate({ to: "/signalements/creer" })}
				>
					<Plus className="size-4 mr-2" />
					Nouveau signalement
				</Button>
			</div>

			{/* Filtres */}
			<Card>
				<CardContent className="pt-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<InputField
							label="Recherche"
							placeholder="Rechercher..."
							value={search.recherche ?? ""}
							onChange={(e) =>
								handleSearchChange((prev) => ({
									...prev,
									recherche: e.target.value || undefined,
									page: 1,
								}))
							}
						/>

						<div>
							<label className="text-sm font-medium text-foreground block mb-2">
								Statut
							</label>
							<Select
								value={search.statut ?? ""}
								onValueChange={(value) =>
									handleSearchChange((prev) => ({
										...prev,
										statut: value || undefined,
										page: 1,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Tous les statuts" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Tous les statuts</SelectItem>
									<SelectItem value="OUVERT">Ouvert</SelectItem>
									<SelectItem value="EN_COURS">En cours</SelectItem>
									<SelectItem value="RESOLU">Résolu</SelectItem>
									<SelectItem value="REJETE">Rejeté</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="text-sm font-medium text-foreground block mb-2">
								Tri
							</label>
							<Select
								value={search.order ?? ""}
								onValueChange={(value) =>
									handleSearchChange((prev) => ({
										...prev,
										order: (value as "asc" | "desc") || undefined,
										page: 1,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Tri" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Par défaut</SelectItem>
									<SelectItem value="asc">Croissant</SelectItem>
									<SelectItem value="desc">Décroissant</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Contenu */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="size-8 animate-spin text-lagoon" />
				</div>
			) : error ? (
				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6 flex gap-3">
						<AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
						<div className="text-sm text-destructive">
							Erreur lors du chargement des signalements
						</div>
					</CardContent>
				</Card>
			) : signalements && signalements.length > 0 ? (
				<div className="space-y-3">
					{signalements.map((signalement) => (
						<Card
							key={signalement.id_signalement}
							className="cursor-pointer hover:shadow-md transition-shadow"
							onClick={() =>
								navigate({ to: `/signalements/${signalement.id_signalement}` })
							}
						>
							<CardContent className="pt-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-3">
											{getStatusIcon(signalement.statut)}
											<h3 className="text-lg font-semibold text-foreground">
												{signalement.titre}
											</h3>
										</div>
										<p className="text-sm text-muted-foreground line-clamp-2">
											{signalement.description}
										</p>
									</div>
									<div className="flex-shrink-0 text-right">
										<span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(signalement.statut)}`}>
											{getStatusLabel(signalement.statut)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="pt-6 text-center text-muted-foreground py-12">
						Aucun signalement trouvé
					</CardContent>
				</Card>
			)}
		</div>
	);
}
