import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { InputField } from "#/components/ui/input-field";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { listPlats } from "#/features/restaurant/api/plats";
import type { Plat } from "#/features/restaurant/models/plats";
import { platsKeys } from "#/features/restaurant/permissions";

import type { CommandeRestaurantPortailBody } from "../api/restaurant";
import {
	TYPE_COMMANDE_PORTAIL_LABELS,
	type TypeCommandePortail,
} from "../models/restaurant";

interface CommanderDialogProps {
	open: boolean;
	isPending: boolean;
	erreur?: string | null;
	onSubmit: (body: CommandeRestaurantPortailBody) => void;
	onOpenChange: (open: boolean) => void;
}

/** Ligne éditable : clé React stable (ajout/suppression de lignes). */
interface LigneEditable {
	cle: string;
	idPlat: string;
	quantite: string;
}

let compteurCle = 0;
const nouvelleCle = () => `plat-${++compteurCle}`;

/**
 * « Commander au restaurant » (portail résident) — compose une commande à
 * partir du menu public (`GET /restaurant/plats`, plats `disponible`
 * uniquement). Aucun montant ni `id_client` n'est envoyé : le backend déduit
 * le résident du JWT et recalcule le total. `adresse_livraison` est requise
 * uniquement pour `LIVRAISON`.
 */
export function CommanderDialog({
	open,
	isPending,
	erreur,
	onSubmit,
	onOpenChange,
}: CommanderDialogProps) {
	const platsQuery = useQuery({
		queryKey: platsKeys.list(),
		queryFn: listPlats,
		enabled: open,
	});
	const plats = useMemo(
		() => (platsQuery.data ?? []).filter((plat) => plat.disponible),
		[platsQuery.data],
	);

	const [lignes, setLignes] = useState<LigneEditable[]>([
		{ cle: nouvelleCle(), idPlat: "", quantite: "1" },
	]);
	const [type, setType] = useState<TypeCommandePortail>("SUR_PLACE");
	const [adresseLivraison, setAdresseLivraison] = useState("");
	const [notes, setNotes] = useState("");
	const [erreurLocale, setErreurLocale] = useState<string | null>(null);

	const majLigne = (index: number, patch: Partial<LigneEditable>) => {
		setLignes((precedent) =>
			precedent.map((ligne, i) =>
				i === index ? { ...ligne, ...patch } : ligne,
			),
		);
	};

	const soumettre = (event: React.FormEvent) => {
		event.preventDefault();
		const lignesCorps = lignes.map((ligne) => ({
			id_plat: ligne.idPlat,
			quantite: ligne.quantite.trim(),
		}));
		if (
			lignesCorps.length === 0 ||
			lignesCorps.some(
				(ligne) =>
					!ligne.id_plat ||
					!/^\d+$/.test(ligne.quantite) ||
					Number(ligne.quantite) < 1,
			)
		) {
			setErreurLocale(
				"Choisissez un plat et une quantité entière ≥ 1 pour chaque ligne.",
			);
			return;
		}
		const ids = lignesCorps.map((ligne) => ligne.id_plat);
		if (new Set(ids).size !== ids.length) {
			setErreurLocale("Un même plat ne peut figurer qu'une seule fois.");
			return;
		}
		if (type === "LIVRAISON" && !adresseLivraison.trim()) {
			setErreurLocale("Saisissez l'adresse de livraison.");
			return;
		}
		setErreurLocale(null);
		onSubmit({
			type,
			lignes: lignesCorps,
			adresseLivraison:
				type === "LIVRAISON" ? adresseLivraison.trim() : undefined,
			notes: notes.trim() || undefined,
		});
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Passer une commande au restaurant
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Votre commande est envoyée au personnel pour validation — le
						règlement se fait au comptoir.
					</Dialog.Description>

					<form className="mt-4 space-y-4" onSubmit={soumettre}>
						<div className="space-y-3">
							{lignes.map((ligne, index) => (
								<div
									key={ligne.cle}
									className="grid grid-cols-[1fr_5rem_auto] items-end gap-2 rounded-lg border border-border p-3"
								>
									<div className="space-y-2">
										{index === 0 ? <Label>Plat</Label> : null}
										<Select
											value={ligne.idPlat}
											onValueChange={(valeur) =>
												majLigne(index, { idPlat: valeur })
											}
											disabled={platsQuery.isLoading}
										>
											<SelectTrigger aria-label={`Plat ${index + 1}`}>
												<SelectValue
													placeholder={
														platsQuery.isLoading
															? "Chargement du menu…"
															: "Choisir un plat"
													}
												/>
											</SelectTrigger>
											<SelectContent>
												{plats.map((plat: Plat) => (
													<SelectItem key={plat.id} value={plat.id}>
														{plat.nom} — {formatMontantFCFA(plat.prix)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<InputField
										id={`quantite-plat-${index}`}
										label={index === 0 ? "Qté" : undefined}
										type="number"
										min={1}
										step={1}
										value={ligne.quantite}
										onChange={(event) =>
											majLigne(index, { quantite: event.target.value })
										}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										aria-label={`Retirer la ligne ${index + 1}`}
										disabled={lignes.length <= 1}
										onClick={() =>
											setLignes((precedent) =>
												precedent.filter((_, i) => i !== index),
											)
										}
									>
										<Trash2 className="size-4" aria-hidden />
									</Button>
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									setLignes((precedent) => [
										...precedent,
										{ cle: nouvelleCle(), idPlat: "", quantite: "1" },
									])
								}
							>
								<Plus className="size-4" aria-hidden />
								Ajouter un plat
							</Button>
							{platsQuery.isError ? (
								<p role="alert" className="text-sm text-destructive">
									Impossible de charger le menu — réessayez plus tard.
								</p>
							) : null}
						</div>

						<div className="space-y-2">
							<Label>Type de commande</Label>
							<Select
								value={type}
								onValueChange={(valeur) =>
									setType(valeur as TypeCommandePortail)
								}
							>
								<SelectTrigger aria-label="Type de commande">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(
										Object.keys(
											TYPE_COMMANDE_PORTAIL_LABELS,
										) as TypeCommandePortail[]
									).map((valeur) => (
										<SelectItem key={valeur} value={valeur}>
											{TYPE_COMMANDE_PORTAIL_LABELS[valeur]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{type === "LIVRAISON" ? (
							<InputField
								id="adresse-livraison"
								label="Adresse de livraison"
								placeholder="Bâtiment, appartement…"
								maxLength={200}
								value={adresseLivraison}
								onChange={(event) => setAdresseLivraison(event.target.value)}
							/>
						) : null}

						<div className="space-y-2">
							<Label htmlFor="notes-commande">Note (optionnel)</Label>
							<Textarea
								id="notes-commande"
								maxLength={500}
								placeholder="Allergies, précisions…"
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
							/>
						</div>

						{erreurLocale || erreur ? (
							<p
								role="alert"
								className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
							>
								{erreurLocale ?? erreur}
							</p>
						) : null}

						<div className="flex items-center justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								disabled={isPending}
								onClick={() => onOpenChange(false)}
							>
								Annuler
							</Button>
							<Button
								type="submit"
								disabled={isPending || platsQuery.isLoading}
								className="bg-lagoon text-white hover:bg-lagoon/90"
							>
								{isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Envoyer la commande
							</Button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
