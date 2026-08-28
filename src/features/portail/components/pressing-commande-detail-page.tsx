import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { cn } from "#/lib/utils";
import { usePressingCommande } from "../hooks/use-pressing";
import {
	PRESSING_STATUT_COLORS,
	PRESSING_STATUT_LABELS,
	PROGRESSION_ETAPES,
	calculerProgression,
	getEtapeActuelle,
} from "../models/pressing";

interface PressingCommandeDetailPageProps {
	id: string;
	onBack: () => void;
}

/**
 * Page de détail d'une commande de pressing avec suivi détaillé des étapes.
 */
export function PressingCommandeDetailPage({
	id,
	onBack,
}: PressingCommandeDetailPageProps) {
	const { data: commande, isLoading, error } = usePressingCommande(id);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-lagoon" />
			</div>
		);
	}

	if (error || !commande) {
		return (
			<div className="space-y-4">
				<Button variant="outline" onClick={onBack}>
					<ArrowLeft className="size-4 mr-2" />
					Retour
				</Button>
				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6">
						<div className="flex gap-3">
							<AlertCircle className="size-5 text-destructive flex-shrink-0" />
							<p className="text-destructive">
								Erreur lors du chargement de la commande
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const progression = calculerProgression(commande.statut);
	const etape = getEtapeActuelle(commande.statut);
	const couleur =
		PRESSING_STATUT_COLORS[commande.statut] ?? "bg-gray-100 text-gray-800";

	const getEtapeIcon = (statut: string) => {
		if (PROGRESSION_ETAPES.indexOf(statut as any) < etape.actuelle - 1) {
			return <CheckCircle2 className="size-6 text-green-600" />;
		}
		if (PROGRESSION_ETAPES.indexOf(statut as any) === etape.actuelle - 1) {
			return <Clock className="size-6 text-lagoon animate-pulse" />;
		}
		return <div className="size-6 rounded-full border-2 border-gray-300" />;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<Button variant="outline" onClick={onBack}>
				<ArrowLeft className="size-4 mr-2" />
				Retour
			</Button>

			{/* Title and status */}
			<div className="space-y-4">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-2xl font-bold text-foreground">
							{commande.numero_commande}
						</h1>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
								couleur,
							)}
						>
							{PRESSING_STATUT_LABELS[commande.statut]}
						</span>
					</div>
					<p className="text-muted-foreground">
						Déposé le{" "}
						{new Date(commande.date_depot).toLocaleDateString("fr-FR")}
					</p>
				</div>

				{/* Info cards */}
				<div className="grid grid-cols-2 gap-4">
					<Card>
						<CardContent className="pt-6">
							<p className="text-sm text-muted-foreground mb-1">
								Montant total
							</p>
							<p className="text-xl font-semibold text-foreground">
								{commande.montant_total} FCFA
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-sm text-muted-foreground mb-1">
								Montant payé
							</p>
							<p className="text-xl font-semibold text-foreground">
								{commande.montant_paye} FCFA
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Progress */}
			<Card>
				<CardHeader>
					<CardTitle>Progression du traitement</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Overall progress bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								Étape {etape.actuelle} sur {etape.total}
							</span>
							<span className="font-semibold">{progression}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
							<div
								className="bg-lagoon h-full rounded-full transition-all"
								style={{ width: `${progression}%` }}
							/>
						</div>
					</div>

					{/* Steps */}
					<div className="space-y-4 mt-8">
						{PROGRESSION_ETAPES.map((statut, index) => {
							const isCompleted =
								index < etape.actuelle - 1;
							const isCurrent =
								index === etape.actuelle - 1;

							return (
								<div key={statut} className="flex gap-4">
									<div className="flex flex-col items-center">
										{getEtapeIcon(statut)}
										{index < PROGRESSION_ETAPES.length - 1 && (
											<div
												className={cn(
													"w-1 flex-1 my-2",
													isCompleted || isCurrent
														? "bg-green-600"
														: "bg-gray-300",
												isCurrent && "bg-lagoon",
											)}
											style={{ minHeight: "3rem" }}
											/>
										)}
									</div>
									<div className="pt-1">
										<p className="font-medium text-foreground">
											{PRESSING_STATUT_LABELS[statut]}
										</p>
										<p className="text-sm text-muted-foreground">
											{isCompleted && "Complété"}
											{isCurrent && "En cours"}
											{!isCompleted && !isCurrent && "À venir"}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Articles */}
			{commande.articles && commande.articles.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Articles ({commande.articles.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{commande.articles.map((article) => (
								<div
									key={article.id}
									className="flex items-start justify-between pb-3 border-b last:border-b-0"
								>
									<div>
										<p className="font-medium text-foreground">
											{article.libelle}
										</p>
										<p className="text-sm text-muted-foreground">
											Quantité: {article.quantite}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium text-foreground">
											{article.prix_unitaire} FCFA
										</p>
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1",
												PRESSING_STATUT_COLORS[
													article.statut as any
												] ?? "bg-gray-100 text-gray-800",
											)}
										>
											{PRESSING_STATUT_LABELS[
												article.statut as any
											] ?? article.statut}
										</span>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Notes */}
			{commande.notes && (
				<Card>
					<CardHeader>
						<CardTitle>Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-foreground whitespace-pre-wrap">
							{commande.notes}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
