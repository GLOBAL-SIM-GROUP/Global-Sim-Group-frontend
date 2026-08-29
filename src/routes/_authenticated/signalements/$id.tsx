import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Loader2,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { requirePermissions, useCan } from "#/core/auth";
import { formatDateHeureISO } from "#/features/residence/models/format";
import {
	usePrendreEnChargeSignalement,
	useRejeterSignalement,
	useResoudreSignalement,
	useSignalement,
} from "#/features/signalements/hooks/use-signalements";
import {
	nomDeclarant,
	SIGNALEMENT_STATUT_BADGE,
	SIGNALEMENT_STATUT_LABELS,
} from "#/features/signalements/models/signalements";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_authenticated/signalements/$id")({
	beforeLoad: ({ context, params, navigate }) => {
		requirePermissions(context.auth, "SIGNALEMENT.VOIR");
		if (!params.id || params.id === "undefined") {
			navigate({ to: "/signalements" });
		}
	},
	component: DetailSignalementPage,
});

/** Ligne lecture seule de la fiche (même pattern que les autres fiches). */
function Ligne({ label, valeur }: { label: string; valeur: string }) {
	return (
		<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground">{valeur}</dd>
		</div>
	);
}

function DetailSignalementPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const canModifier = useCan("SIGNALEMENT.MODIFIER");
	const [actionNote, setActionNote] = useState("");
	const [selectedAction, setSelectedAction] = useState<
		"resoudre" | "rejeter" | null
	>(null);

	const { data: signalement, isLoading, error } = useSignalement(id);

	const { mutate: prendreEnCharge, isPending: isPendingCharge } =
		usePrendreEnChargeSignalement();
	const { mutate: resoudre, isPending: isPendingResoudre } =
		useResoudreSignalement();
	const { mutate: rejeter, isPending: isPendingRejeter } =
		useRejeterSignalement();

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
				<div className="flex justify-center py-12">
					<Loader2 className="size-8 animate-spin text-lagoon" />
				</div>
			</div>
		);
	}

	if (error || !signalement) {
		return (
			<div className="mx-auto w-full max-w-4xl space-y-4 p-6">
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/signalements" })}
				>
					Retour
				</Button>
				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6">
						<div className="flex gap-3">
							<AlertCircle
								className="size-5 shrink-0 text-destructive"
								aria-hidden
							/>
							<p className="text-destructive">
								Impossible de charger ce signalement.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const estClos =
		signalement.statut === "RESOLU" || signalement.statut === "REJETE";
	const canModify = canModifier && !estClos;
	const isPending = isPendingCharge || isPendingResoudre || isPendingRejeter;

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Signalements", to: "/signalements" },
					{ label: signalement.titre },
				]}
			/>

			<div className="flex flex-wrap items-end justify-between gap-4">
				<section className="space-y-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold text-foreground">
							{signalement.titre}
						</h1>
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
								SIGNALEMENT_STATUT_BADGE[signalement.statut],
							)}
						>
							{SIGNALEMENT_STATUT_LABELS[signalement.statut]}
						</span>
					</div>
					<p className="text-muted-foreground">
						Signalé par {nomDeclarant(signalement)} le{" "}
						{formatDateHeureISO(signalement.date_signalement)}
					</p>
				</section>
				<Button variant="outline" asChild>
					<Link to="/signalements">Retour aux signalements</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Détails</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<dl className="grid gap-3 sm:grid-cols-2">
						<Ligne label="Déclarant" valeur={nomDeclarant(signalement)} />
						<Ligne
							label="Signalé le"
							valeur={formatDateHeureISO(signalement.date_signalement)}
						/>
						{signalement.activite_libelle ? (
							<Ligne label="Activité" valeur={signalement.activite_libelle} />
						) : null}
						{signalement.date_resolution ? (
							<Ligne
								label={
									signalement.statut === "REJETE" ? "Rejeté le" : "Résolu le"
								}
								valeur={formatDateHeureISO(signalement.date_resolution)}
							/>
						) : null}
					</dl>

					<div>
						<p className="text-sm font-medium text-foreground">Description</p>
						<p className="mt-1 whitespace-pre-wrap text-foreground">
							{signalement.description}
						</p>
					</div>

					{signalement.note_resolution ? (
						<div>
							<p className="text-sm font-medium text-foreground">
								Note de résolution
							</p>
							<p className="mt-1 whitespace-pre-wrap text-foreground">
								{signalement.note_resolution}
							</p>
						</div>
					) : null}
				</CardContent>
			</Card>

			{canModify ? (
				<Card>
					<CardHeader>
						<CardTitle>Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{selectedAction === null ? (
							<div className="flex flex-wrap gap-3">
								{signalement.statut === "OUVERT" ? (
									<Button
										variant="outline"
										disabled={isPendingCharge}
										onClick={() => prendreEnCharge(id)}
									>
										{isPendingCharge ? (
											<Loader2 className="size-4 animate-spin" aria-hidden />
										) : (
											<Clock className="size-4 text-lagoon" aria-hidden />
										)}
										Prendre en charge
									</Button>
								) : null}
								<Button onClick={() => setSelectedAction("resoudre")}>
									<CheckCircle2 className="size-4" aria-hidden />
									Résoudre
								</Button>
								<Button
									variant="destructive"
									onClick={() => setSelectedAction("rejeter")}
								>
									<XCircle className="size-4" aria-hidden />
									Rejeter
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								<div>
									<label
										htmlFor="action-note"
										className="mb-2 block text-sm font-medium text-foreground"
									>
										Note de{" "}
										{selectedAction === "resoudre" ? "résolution" : "rejet"}
									</label>
									<textarea
										id="action-note"
										className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
										placeholder="Ajoutez une note…"
										value={actionNote}
										onChange={(event) => setActionNote(event.target.value)}
									/>
								</div>

								<div className="flex gap-3">
									<Button
										variant={
											selectedAction === "rejeter" ? "destructive" : "default"
										}
										disabled={isPending}
										onClick={() => {
											const noteResolution = actionNote.trim();
											if (selectedAction === "resoudre") {
												resoudre(
													{ id, noteResolution },
													{ onSuccess: () => setSelectedAction(null) },
												);
											} else {
												rejeter(
													{ id, noteResolution },
													{ onSuccess: () => setSelectedAction(null) },
												);
											}
										}}
									>
										{isPending ? (
											<>
												<Loader2 className="size-4 animate-spin" aria-hidden />
												En cours…
											</>
										) : (
											"Confirmer"
										)}
									</Button>
									<Button
										variant="outline"
										disabled={isPending}
										onClick={() => {
											setSelectedAction(null);
											setActionNote("");
										}}
									>
										Annuler
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
