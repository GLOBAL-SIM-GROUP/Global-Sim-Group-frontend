import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
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
import { toApiError } from "#/core/api";
import { ClientRechercheField } from "#/features/residence/components/client-recherche-field";
import { useMoyensPaiement } from "#/features/residence/hooks/use-moyens-paiement";
import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";
import { useOffres } from "../hooks/use-offres";
import { useVendreSouscription } from "../hooks/use-souscriptions";
import type { Souscription } from "../models/abonnements";
import {
	ACTIVITE_LABELS,
	type Offre,
	UNITE_LABELS,
} from "../models/abonnements";

interface VendreSouscriptionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: (souscription: Souscription) => void;
}

function VendreSouscriptionForm({
	onOpenChange,
	onSaved,
}: Omit<VendreSouscriptionDialogProps, "open">) {
	const mutation = useVendreSouscription();
	const offresQuery = useOffres({ actif: true });
	const moyensQuery = useMoyensPaiement();

	const [globalError, setGlobalError] = useState<string | null>(null);
	const [idClient, setIdClient] = useState("");
	const [idOffre, setIdOffre] = useState("");
	const [dateDebut, setDateDebut] = useState("");
	const [prix, setPrix] = useState("");
	const [prixTouche, setPrixTouche] = useState(false);
	const [montantPaiement, setMontantPaiement] = useState("");
	const [idMoyen, setIdMoyen] = useState("");
	const [note, setNote] = useState("");
	// Après une vente partielle/sans paiement, on affiche le reste à payer
	// renvoyé par le backend plutôt que de fermer sec.
	const [vendue, setVendue] = useState<Souscription | null>(null);

	const offres = offresQuery.data ?? [];
	const offreChoisie: Offre | undefined = useMemo(
		() => offres.find((offre) => offre.id_offre === idOffre),
		[offres, idOffre],
	);
	const prixEffectif = prixTouche ? prix : (offreChoisie?.prix ?? "");

	const valider = (): string | null => {
		if (!idClient) return "Sélectionnez un client.";
		if (!idOffre) return "Sélectionnez une offre.";
		if (prixTouche && prix.trim() && Number(prix) < 0) {
			return "Le prix négocié ne peut pas être négatif.";
		}
		if (montantPaiement.trim()) {
			if (Number(montantPaiement) <= 0) {
				return "Le paiement doit être un montant positif (ou vide).";
			}
			if (!idMoyen) return "Sélectionnez le moyen de paiement.";
		}
		return null;
	};

	const soumettre = async () => {
		setGlobalError(null);
		const erreur = valider();
		if (erreur) {
			setGlobalError(erreur);
			return;
		}
		try {
			const cree = await mutation.mutateAsync({
				idClient,
				idOffre,
				...(dateDebut ? { dateDebut } : {}),
				...(prixTouche && prix.trim() ? { prix: prix.trim() } : {}),
				...(montantPaiement.trim()
					? { paiement: { montant: montantPaiement.trim(), idMoyen } }
					: {}),
				...(note.trim() ? { note: note.trim() } : {}),
			});
			setVendue(cree);
		} catch (error) {
			setGlobalError(
				toApiError(error).message || "Impossible de vendre la souscription.",
			);
		}
	};

	return vendue ? (
		<div className="mt-4 space-y-4">
			<output className="block rounded-lg border border-[#27AE60]/30 bg-[#27AE60]/10 px-4 py-3 text-sm text-[#27AE60]">
				Souscription vendue — {vendue.offre_libelle} ({vendue.quota}{" "}
				{UNITE_LABELS[vendue.unite] ?? vendue.unite}), valide jusqu'au{" "}
				{formatDateISO(vendue.date_fin)}.
			</output>
			{Number(vendue.reste_a_payer) > 0 ? (
				<p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
					Paiement partiel : reste à payer{" "}
					{formatMontantFCFA(vendue.reste_a_payer)} — encaissable plus tard
					depuis la fiche de la souscription.
				</p>
			) : null}
			<div className="flex items-center justify-end gap-2 pt-2">
				<Button type="button" onClick={() => onSaved(vendue)}>
					Voir la souscription
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() => onOpenChange(false)}
				>
					Fermer
				</Button>
			</div>
		</div>
	) : (
		<form
			className="mt-4 space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void soumettre();
			}}
		>
			<ClientRechercheField
				value={idClient}
				onChange={(id) => setIdClient(id)}
			/>

			<div className="space-y-2">
				<Label htmlFor="vente-offre">Offre *</Label>
				<Select
					value={idOffre}
					onValueChange={(valeur) => {
						setIdOffre(valeur);
						setPrixTouche(false);
					}}
				>
					<SelectTrigger id="vente-offre" className="w-full">
						<SelectValue placeholder="Sélectionner une offre" />
					</SelectTrigger>
					<SelectContent>
						{offres.map((offre) => (
							<SelectItem key={offre.id_offre} value={offre.id_offre}>
								{offre.libelle} — {offre.quota}{" "}
								{UNITE_LABELS[offre.unite] ?? offre.unite} ·{" "}
								{formatMontantFCFA(offre.prix)} ·{" "}
								{ACTIVITE_LABELS[offre.activite]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{offres.length === 0 && !offresQuery.isLoading ? (
					<p className="text-xs text-muted-foreground">
						Aucune offre active — créez-en une dans « Offres ».
					</p>
				) : null}
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="vente-debut">
						Début de validité (défaut : aujourd'hui)
					</Label>
					<Input
						id="vente-debut"
						type="date"
						value={dateDebut}
						onChange={(event) => setDateDebut(event.target.value)}
					/>
				</div>
				<InputField
					id="vente-prix"
					label={`Prix (FCFA${offreChoisie ? ` — défaut ${formatMontantFCFA(offreChoisie.prix)}` : ""})`}
					inputMode="numeric"
					placeholder={offreChoisie?.prix ?? ""}
					value={prixEffectif}
					onChange={(event) => {
						setPrixTouche(true);
						setPrix(event.target.value);
					}}
					error={undefined}
				/>
			</div>

			<div className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
				<InputField
					id="vente-paiement"
					label="Paiement encaissé (FCFA, optionnel — partiel accepté)"
					inputMode="numeric"
					value={montantPaiement}
					onChange={(event) => setMontantPaiement(event.target.value)}
					error={undefined}
				/>
				{montantPaiement.trim() ? (
					<div className="space-y-2">
						<Label htmlFor="vente-moyen">Moyen de paiement</Label>
						<Select value={idMoyen} onValueChange={setIdMoyen}>
							<SelectTrigger id="vente-moyen" className="w-full">
								<SelectValue placeholder="Sélectionner un moyen" />
							</SelectTrigger>
							<SelectContent>
								{(moyensQuery.data ?? []).map((moyen) => (
									<SelectItem key={moyen.id} value={moyen.id}>
										{moyen.libelle}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				) : null}
				<p className="text-xs text-muted-foreground sm:col-span-2">
					Vide = vente sans paiement — le reste à payer reste encaissable plus
					tard.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="vente-note">Note (optionnel)</Label>
				<Textarea
					id="vente-note"
					rows={2}
					value={note}
					onChange={(event) => setNote(event.target.value)}
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
				<Button type="submit" disabled={mutation.isPending}>
					{mutation.isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{mutation.isPending ? "Vente…" : "Vendre la souscription"}
				</Button>
			</div>
		</form>
	);
}

/**
 * Modale « Vendre une souscription » (`ABONNEMENT.VENDRE`) : client + offre
 * active + début/prix négocié/paiement optionnel — intégral, partiel ou
 * absent, jamais bloquant (le `reste_a_payer` de la réponse est affiché pour
 * encaissement ultérieur).
 */
export function VendreSouscriptionDialog({
	open,
	onOpenChange,
	onSaved,
}: VendreSouscriptionDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Vendre une souscription
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Quota prépayé rattaché au client — payable en intégral, en partie ou
						plus tard.
					</Dialog.Description>
					{open ? (
						<VendreSouscriptionForm
							onOpenChange={onOpenChange}
							onSaved={onSaved}
						/>
					) : null}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
