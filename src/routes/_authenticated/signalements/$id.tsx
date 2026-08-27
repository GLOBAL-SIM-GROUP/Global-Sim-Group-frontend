import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle2,
	Clock,
	Loader2,
	XCircle,
	AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { InputField } from "#/components/ui/input-field";
import { requirePermissions } from "#/core/auth";
import {
	getSignalement,
	prendre_en_charge_signalement,
	resoudre_signalement,
	rejeter_signalement,
} from "#/core/api/signalements";

export const Route = createFileRoute("/_authenticated/signalements/$id")({
	beforeLoad: ({ context, params, navigate }) => {
		requirePermissions(context.auth, "SIGNALEMENT.VOIR");
		// Rediriger vers la liste si l'ID est invalide
		if (!params.id || params.id === "undefined") {
			navigate({ to: "/signalements" });
		}
	},
	component: DetailSignalementPage,
});

function DetailSignalementPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [actionNote, setActionNote] = useState("");
	const [selectedAction, setSelectedAction] = useState<
		"prendre-en-charge" | "resoudre" | "rejeter" | null
	>(null);

	const { data: signalement, isLoading, error } = useQuery({
		queryKey: ["signalement", id],
		queryFn: () => getSignalement(id),
		enabled: typeof window !== "undefined" && !!id,
	});

	const { mutate: prendreEnCharge, isPending: isPendingCharge } = useMutation({
		mutationFn: () => prendre_en_charge_signalement(id),
		onSuccess: async () => {
			await navigate({ to: "/signalements" });
		},
	});

	const { mutate: resoudre, isPending: isPendingResoudre } = useMutation({
		mutationFn: () =>
			resoudre_signalement(id, { note_resolution: actionNote.trim() }),
		onSuccess: async () => {
			await navigate({ to: "/signalements" });
		},
	});

	const { mutate: rejeter, isPending: isPendingRejeter } = useMutation({
		mutationFn: () =>
			rejeter_signalement(id, { note_resolution: actionNote.trim() }),
		onSuccess: async () => {
			await navigate({ to: "/signalements" });
		},
	});

	const getStatusBadge = (statut: string) => {
		const styles: Record<string, string> = {
			OUVERT: "bg-yellow-100 text-yellow-800",
			EN_COURS: "bg-blue-100 text-blue-800",
			RESOLU: "bg-green-100 text-green-800",
			REJETE: "bg-red-100 text-red-800",
		};
		return styles[statut] || "bg-gray-100 text-gray-800";
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-lagoon" />
			</div>
		);
	}

	if (error || !signalement) {
		return (
			<div className="space-y-4">
				<Button variant="outline" onClick={() => navigate({ to: "/signalements" })}>
					<ArrowLeft className="size-4 mr-2" />
					Retour
				</Button>
				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6">
						<div className="flex gap-3">
							<AlertCircle className="size-5 text-destructive flex-shrink-0" />
							<p className="text-destructive">
								Erreur lors du chargement du signalement
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const canModify =
		signalement.statut === "OUVERT" || signalement.statut === "EN_COURS";

	return (
		<div className="space-y-6">
			<Button variant="outline" onClick={() => navigate({ to: "/signalements" })}>
				<ArrowLeft className="size-4 mr-2" />
				Retour
			</Button>

			<div className="space-y-4">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-3xl font-bold text-foreground">
							{signalement.titre}
						</h1>
						<span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(signalement.statut)}`}>
							{signalement.statut}
						</span>
					</div>
					<p className="text-muted-foreground">ID: {signalement.id_signalement}</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Détails</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium text-foreground">
								Description
							</label>
							<p className="mt-1 text-foreground whitespace-pre-wrap">
								{signalement.description}
							</p>
						</div>

						{signalement.note_resolution && (
							<div>
								<label className="text-sm font-medium text-foreground">
									Note de résolution
								</label>
								<p className="mt-1 text-foreground whitespace-pre-wrap">
									{signalement.note_resolution}
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{canModify && (
					<Card>
						<CardHeader>
							<CardTitle>Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{selectedAction === null ? (
								<div className="flex gap-3 flex-wrap">
									{signalement.statut === "OUVERT" && (
										<Button
											className="bg-blue-600 hover:bg-blue-700"
											onClick={() => setSelectedAction("prendre-en-charge")}
										>
											<Clock className="size-4 mr-2" />
											Prendre en charge
										</Button>
									)}

									{signalement.statut !== "RESOLU" &&
										signalement.statut !== "REJETE" && (
											<>
												<Button
													className="bg-green-600 hover:bg-green-700"
													onClick={() => setSelectedAction("resoudre")}
												>
													<CheckCircle2 className="size-4 mr-2" />
													Résoudre
												</Button>
												<Button
													variant="outline"
													className="text-red-600 border-red-200 hover:bg-red-50"
													onClick={() => setSelectedAction("rejeter")}
												>
													<XCircle className="size-4 mr-2" />
													Rejeter
												</Button>
											</>
										)}
								</div>
							) : (
								<div className="space-y-4">
									<div>
										<label className="text-sm font-medium text-foreground block mb-2">
											Note de {selectedAction === "prendre-en-charge" ? "prise en charge" : selectedAction}
										</label>
										<textarea
											className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
											placeholder="Ajoutez une note..."
											value={actionNote}
											onChange={(e) => setActionNote(e.target.value)}
										/>
									</div>

									<div className="flex gap-3">
										<Button
											className={`${
												selectedAction === "resoudre"
													? "bg-green-600 hover:bg-green-700"
													: selectedAction === "rejeter"
														? "bg-red-600 hover:bg-red-700"
														: "bg-blue-600 hover:bg-blue-700"
											}`}
											onClick={() => {
												if (selectedAction === "prendre-en-charge") {
													prendreEnCharge();
												} else if (selectedAction === "resoudre") {
													resoudre();
												} else if (selectedAction === "rejeter") {
													rejeter();
												}
											}}
											disabled={
												isPendingCharge || isPendingResoudre || isPendingRejeter
											}
										>
											{isPendingCharge || isPendingResoudre || isPendingRejeter ? (
												<>
													<Loader2 className="size-4 mr-2 animate-spin" />
													En cours…
												</>
											) : (
												"Confirmer"
											)}
										</Button>
										<Button
											variant="outline"
											onClick={() => setSelectedAction(null)}
											disabled={
												isPendingCharge || isPendingResoudre || isPendingRejeter
											}
										>
											Annuler
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
