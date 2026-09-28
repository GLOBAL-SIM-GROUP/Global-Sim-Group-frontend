import { useForm } from "@tanstack/react-form";
import { Loader2, MapPin } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
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
import {
	TYPE_COMMANDE_PORTAIL_LABELS,
	type TypeCommandePortail,
} from "#/features/portail/models/restaurant";
import { formatMontantFCFA } from "#/features/residence/models/format";

import type { LigneArticlePanier } from "../models/panier-articles";

interface CommanderDialogProps {
	open: boolean;
	lignes: LigneArticlePanier[];
	total: number;
	isPending: boolean;
	erreur?: string | null;
	onSubmit: (valeurs: {
		type: TypeCommandePortail;
		adresseLivraison?: string;
		notes?: string;
	}) => void;
	onOpenChange: (open: boolean) => void;
}

type CommanderField = "type" | "adresseLivraison";

const LABELS_CHAMPS: Record<CommanderField, string> = {
	type: "Le type de commande",
	adresseLivraison: "L'adresse de livraison",
};

/**
 * Finalisation d'une commande restaurant depuis le panier (espace client) :
 * type de commande, adresse si livraison, note libre. Le total affiché est
 * indicatif — le serveur le recalcule depuis les prix des plats (aucun
 * montant n'est envoyé). Pas de paiement en ligne : règlement au comptoir.
 */
export function CommanderDialog({
	open,
	lignes,
	total,
	isPending,
	erreur,
	onSubmit,
	onOpenChange,
}: CommanderDialogProps) {
	const form = useForm({
		defaultValues: {
			type: "" as TypeCommandePortail | "",
			adresseLivraison: "",
			notes: "",
		},
		validators: {
			onSubmit: ({ value }) => {
				const fields: Partial<Record<CommanderField, string>> = {};
				if (!value.type) {
					fields.type = `${LABELS_CHAMPS.type} est requis.`;
				}
				if (value.type === "LIVRAISON" && !value.adresseLivraison.trim()) {
					fields.adresseLivraison = `${LABELS_CHAMPS.adresseLivraison} est requise pour une livraison.`;
				}
				return { fields };
			},
		},
		onSubmit: ({ value }) => {
			onSubmit({
				type: value.type as TypeCommandePortail,
				adresseLivraison:
					value.type === "LIVRAISON"
						? value.adresseLivraison.trim()
						: undefined,
				notes: value.notes.trim() || undefined,
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Envoyer ma commande</DialogTitle>
					<DialogDescription>
						Votre commande sera validée par le personnel du restaurant —
						paiement au comptoir, pas de paiement en ligne.
					</DialogDescription>
				</DialogHeader>

				<ul className="mt-3 space-y-1 rounded-lg border border-border bg-accent/20 p-3 text-sm">
					{lignes.map((ligne) => (
						<li key={ligne.id} className="flex justify-between gap-3">
							<span className="truncate text-foreground">
								{ligne.quantite}× {ligne.nom}
							</span>
							<span className="shrink-0 tabular-nums text-muted-foreground">
								{formatMontantFCFA(String(Number(ligne.prix) * ligne.quantite))}
							</span>
						</li>
					))}
					<li className="flex justify-between gap-3 border-t border-border pt-1 font-semibold text-foreground">
						<span>Total estimé</span>
						<span className="tabular-nums">
							{formatMontantFCFA(String(total))}
						</span>
					</li>
				</ul>

				<form
					className="mt-4 space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="type">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Type de commande</Label>
								<Select
									value={field.state.value}
									onValueChange={(valeur) =>
										field.handleChange(valeur as TypeCommandePortail)
									}
								>
									<SelectTrigger
										id={field.name}
										className="w-full"
										aria-label="Type de commande"
									>
										<SelectValue placeholder="Sur place, à emporter, livraison…" />
									</SelectTrigger>
									<SelectContent>
										{(
											Object.entries(TYPE_COMMANDE_PORTAIL_LABELS) as [
												TypeCommandePortail,
												string,
											][]
										).map(([valeur, label]) => (
											<SelectItem key={valeur} value={valeur}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.errors[0] ? (
									<p className="text-sm text-destructive">
										{field.state.meta.errors[0]}
									</p>
								) : null}
							</div>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.values.type}>
						{(type) =>
							type === "LIVRAISON" ? (
								<form.Field name="adresseLivraison">
									{(field) => (
										<InputField
											id={field.name}
											name={field.name}
											label="Adresse de livraison"
											placeholder="Bâtiment, logement, précisions…"
											icon={<MapPin className="size-4" aria-hidden />}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
											error={field.state.meta.errors[0]}
										/>
									)}
								</form.Field>
							) : null
						}
					</form.Subscribe>

					<form.Field name="notes">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Note (optionnel)</Label>
								<Textarea
									id={field.name}
									name={field.name}
									maxLength={500}
									placeholder="Allergies, précisions de préparation…"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</div>
						)}
					</form.Field>

					{erreur ? (
						<p
							role="alert"
							className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
						>
							{erreur}
						</p>
					) : null}

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							className="rounded-full"
							disabled={isPending}
							onClick={() => onOpenChange(false)}
						>
							Annuler
						</Button>
						<Button type="submit" className="rounded-full" disabled={isPending}>
							{isPending ? (
								<Loader2 className="size-4 animate-spin" aria-hidden />
							) : null}
							Envoyer la commande
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
