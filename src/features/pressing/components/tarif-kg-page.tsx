import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import {
	normaliserMontantPourBackend,
	validerMontant,
} from "#/core/forms/montant";
import {
	formatDateHeureISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

import { useDefinirTarifKg, useTarifKg } from "../hooks/use-commandes";

/**
 * Page « Tarif au kilo — Pressing » (permission `PRESSING.GERER_TARIFS`,
 * accordée au Responsable pressing et à qui a `PRESSING.SUPERVISER`) :
 * affiche le tarif au kilo courant (et sa date d'entrée en vigueur) et un
 * formulaire pour en définir un nouveau. Append-only côté backend — pas de
 * modification ni de suppression, seulement « ajouter un nouveau tarif
 * courant » : les commandes déjà créées gardent leur total, calculé avec le
 * tarif en vigueur au moment de leur création/modification.
 */
export function TarifKgPage() {
	const tarifQuery = useTarifKg();
	const mutation = useDefinirTarifKg();
	const [prixKg, setPrixKg] = useState("");
	const [erreur, setErreur] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState(false);

	const soumettre = async (event: React.FormEvent) => {
		event.preventDefault();
		setErreur(null);
		setConfirmation(false);
		if (!prixKg.trim()) {
			setErreur("Indiquez le nouveau tarif.");
			return;
		}
		const messageFormat = validerMontant(prixKg, "Le tarif");
		if (messageFormat) {
			setErreur(messageFormat);
			return;
		}
		if (Number(prixKg) <= 0) {
			setErreur("Le tarif doit être positif.");
			return;
		}
		try {
			await mutation.mutateAsync(normaliserMontantPourBackend(prixKg));
			setPrixKg("");
			setConfirmation(true);
		} catch (error) {
			const apiError = toApiError(error);
			setErreur(
				getErrorMessageForCode(apiError.code) ??
					(apiError.message || "Une erreur est survenue."),
			);
		}
	};

	return (
		<div className="w-full space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Commandes — Pressing", to: "/pressing/commandes" },
					{ label: "Tarif au kilo" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Tarif au kilo — Pressing
				</h1>
				<p className="text-muted-foreground">
					Tarif appliqué aux commandes en tarification au kilo. Historique
					append-only : définir un nouveau tarif ne change jamais le total des
					commandes déjà créées.
				</p>
			</section>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-base font-semibold text-foreground">
					Tarif courant
				</h2>
				{tarifQuery.isLoading ? (
					<p className="mt-2 text-sm text-muted-foreground">Chargement…</p>
				) : tarifQuery.isError ? (
					<p className="mt-2 text-sm text-destructive">
						Impossible de charger le tarif courant.
					</p>
				) : !tarifQuery.data ? (
					<p className="mt-2 text-sm text-muted-foreground">
						Aucun tarif au kilo n'a encore été configuré.
					</p>
				) : (
					<dl className="mt-3 grid gap-3 sm:grid-cols-2">
						<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
							<dt className="text-muted-foreground">Prix au kilo</dt>
							<dd className="font-medium text-foreground">
								{formatMontantFCFA(tarifQuery.data.prix_kg)} / kg
							</dd>
						</div>
						<div className="grid grid-cols-[10rem_1fr] gap-3 text-sm">
							<dt className="text-muted-foreground">En vigueur depuis</dt>
							<dd className="text-foreground">
								{formatDateHeureISO(tarifQuery.data.date_effet)}
							</dd>
						</div>
					</dl>
				)}
			</section>

			<section className="rounded-lg border border-border bg-card p-5 shadow-sm">
				<h2 className="text-base font-semibold text-foreground">
					Définir un nouveau tarif
				</h2>
				<form
					className="mt-3 space-y-4"
					onSubmit={(event) => void soumettre(event)}
				>
					<div className="max-w-xs">
						<InputField
							id="tarif-kg-prix"
							name="prix_kg"
							label="Nouveau tarif (FCFA / kg)"
							placeholder="ex : 1500"
							inputMode="numeric"
							autoComplete="off"
							value={prixKg}
							onChange={(event) => setPrixKg(event.target.value)}
							error={erreur ?? undefined}
						/>
					</div>

					{confirmation ? (
						<p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
							<CheckCircle2 className="size-4" aria-hidden />
							Nouveau tarif enregistré.
						</p>
					) : null}

					<Button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : null}
						{mutation.isPending ? "Enregistrement…" : "Définir le tarif"}
					</Button>
				</form>
			</section>
		</div>
	);
}
