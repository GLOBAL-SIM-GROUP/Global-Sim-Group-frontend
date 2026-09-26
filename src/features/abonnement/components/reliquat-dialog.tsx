import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { toApiError } from "#/core/api";
import { formatDateISO } from "#/features/residence/models/format";

import {
	useDeciderReliquat,
	useSouscriptions,
} from "../hooks/use-souscriptions";
import type { DecisionReliquat, Souscription } from "../models/abonnements";
import { ETAT_LABELS, UNITE_LABELS } from "../models/abonnements";

interface ReliquatDialogProps {
	open: boolean;
	souscription: Souscription | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

const ETATS_ELIGIBLES = new Set(["ACTIVE", "A_VENIR", "EPUISEE"]);

function ReliquatForm({
	souscription,
	onOpenChange,
	onSaved,
}: Omit<ReliquatDialogProps, "open"> & { souscription: Souscription }) {
	const mutation = useDeciderReliquat();
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [decision, setDecision] = useState<DecisionReliquat>("REPORTE");
	const [idCible, setIdCible] = useState("");
	const [motif, setMotif] = useState("");

	// Cibles du report : autres souscriptions du MÊME client, même
	// activité/unité et même couverture (prestation/catégorie), encore
	// utilisables (ACTIVE/A_VENIR/EPUISEE) — le serveur renvoie 400 sinon.
	const ciblesQuery = useSouscriptions({
		id_client: souscription.id_client,
		activite: souscription.activite,
		unite: souscription.unite,
	});
	const cibles = useMemo(
		() =>
			(ciblesQuery.data ?? []).filter(
				(cible) =>
					cible.id_souscription !== souscription.id_souscription &&
					ETATS_ELIGIBLES.has(cible.etat) &&
					cible.id_prestation === souscription.id_prestation &&
					cible.id_categorie_plat === souscription.id_categorie_plat,
			),
		[ciblesQuery.data, souscription],
	);

	const soumettre = async () => {
		setGlobalError(null);
		if (decision === "REPORTE" && !idCible) {
			setGlobalError("Sélectionnez la souscription qui reçoit le reliquat.");
			return;
		}
		try {
			await mutation.mutateAsync({
				id: souscription.id_souscription,
				decision,
				...(decision === "REPORTE" ? { idSouscriptionCible: idCible } : {}),
				...(motif.trim() ? { motif: motif.trim() } : {}),
			});
			onSaved();
		} catch (error) {
			setGlobalError(
				toApiError(error).message || "Impossible d'enregistrer la décision.",
			);
		}
	};

	return (
		<form
			className="mt-4 space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void soumettre();
			}}
		>
			<p className="rounded-md border border-border bg-accent/30 px-3 py-2 text-sm text-muted-foreground">
				Reliquat à décider :{" "}
				<span className="font-semibold text-foreground">
					{souscription.solde}{" "}
					{UNITE_LABELS[souscription.unite] ?? souscription.unite}
				</span>{" "}
				(expirée le {formatDateISO(souscription.date_fin)}).
			</p>

			<div className="space-y-2">
				<Label>Décision</Label>
				<div className="flex gap-4">
					<label className="flex items-center gap-2 text-sm text-foreground">
						<input
							type="radio"
							name="reliquat-decision"
							checked={decision === "REPORTE"}
							onChange={() => setDecision("REPORTE")}
						/>
						Reporter sur une autre souscription
					</label>
					<label className="flex items-center gap-2 text-sm text-foreground">
						<input
							type="radio"
							name="reliquat-decision"
							checked={decision === "PERDU"}
							onChange={() => setDecision("PERDU")}
						/>
						Reliquat perdu
					</label>
				</div>
			</div>

			{decision === "REPORTE" ? (
				<div className="space-y-2">
					<Label htmlFor="reliquat-cible">Souscription cible *</Label>
					<Select value={idCible} onValueChange={setIdCible}>
						<SelectTrigger id="reliquat-cible" className="w-full">
							<SelectValue placeholder="Sélectionner une souscription" />
						</SelectTrigger>
						<SelectContent>
							{cibles.map((cible) => (
								<SelectItem
									key={cible.id_souscription}
									value={cible.id_souscription}
								>
									{cible.offre_libelle} — solde {cible.solde}{" "}
									{UNITE_LABELS[cible.unite] ?? cible.unite} · fin{" "}
									{formatDateISO(cible.date_fin)} ·{" "}
									{ETAT_LABELS[cible.etat] ?? cible.etat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-xs text-muted-foreground">
						Même client, même couverture (prestation/catégorie), encore
						utilisable — le serveur rejette toute autre cible (400).
					</p>
					{ciblesQuery.isSuccess && cibles.length === 0 ? (
						<p role="alert" className="text-xs text-amber-600">
							Aucune autre souscription compatible pour ce client — le report
							est impossible, choisissez « Reliquat perdu ».
						</p>
					) : null}
				</div>
			) : null}

			<div className="space-y-2">
				<Label htmlFor="reliquat-motif">Motif (optionnel)</Label>
				<Textarea
					id="reliquat-motif"
					rows={2}
					value={motif}
					onChange={(event) => setMotif(event.target.value)}
				/>
			</div>

			{globalError ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{globalError}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-2 pt-2">
				<Button
					type="button"
					variant="ghost"
					disabled={mutation.isPending}
					onClick={() => onOpenChange(false)}
				>
					Annuler
				</Button>
				<Button
					type="submit"
					disabled={
						mutation.isPending ||
						(decision === "REPORTE" && cibles.length === 0)
					}
				>
					{mutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{mutation.isPending ? "Enregistrement…" : "Enregistrer la décision"}
				</Button>
			</div>
		</form>
	);
}

/**
 * Décision du reliquat d'une souscription expirée (`POST /reliquat`,
 * `ABONNEMENT.DECIDER_RELIQUAT`) — affichée seulement quand
 * `reliquat_a_decider === true` : report vers une souscription compatible du
 * même client, ou perte du quota restant.
 */
export function ReliquatDialog({
	open,
	souscription,
	onOpenChange,
	onSaved,
}: ReliquatDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Décider du reliquat
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{souscription
							? `${souscription.offre_libelle} — ${souscription.client_nom} ${souscription.client_prenoms}`
							: "Reliquat d'une souscription expirée."}
					</Dialog.Description>
					{open && souscription ? (
						<ReliquatForm
							key={souscription.id_souscription}
							souscription={souscription}
							onOpenChange={onOpenChange}
							onSaved={onSaved}
						/>
					) : null}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
