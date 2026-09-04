import { Loader2, Printer } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { getErrorMessageForCode, toApiError } from "#/core/api";
import { useCan } from "#/core/auth";
import { imprimerImageBlob } from "#/lib/print-pdf";

import {
	useEtiquetteBlobUrl,
	useGenererCodeBarre,
	useModifierProduit,
} from "../hooks/use-produits";
import type { Produit } from "../models/produits";

interface ProduitCodeBarreDialogProps {
	open: boolean;
	/** Produit affiché ; null = fermé. */
	produit: Produit | null;
	onOpenChange: (open: boolean) => void;
}

/**
 * Dialogue « Code-barres » d'un produit (M3) : génère un code interne EAN-13
 * si absent, affiche l'étiquette à imprimer si présent, permet de retirer un
 * code pour en regénérer un (le backend refuse d'écraser un code existant).
 */
export function ProduitCodeBarreDialog({
	open,
	produit,
	onOpenChange,
}: ProduitCodeBarreDialogProps) {
	const canModifier = useCan("MARCHANDISE.MODIFIER");
	const genererMutation = useGenererCodeBarre();
	const retirerMutation = useModifierProduit();
	const [erreur, setErreur] = useState<string | null>(null);
	const [impressionEnCours, setImpressionEnCours] = useState(false);

	const codeBarre = produit?.code_barre ?? null;
	const { blobUrl, isLoading: etiquetteEnChargement } = useEtiquetteBlobUrl(
		codeBarre ? (produit?.id ?? null) : null,
	);

	const generer = async () => {
		if (!produit) return;
		setErreur(null);
		try {
			await genererMutation.mutateAsync(produit.id);
		} catch (error) {
			setErreur(
				getErrorMessageForCode(toApiError(error).code) ??
					(toApiError(error).message || "Une erreur est survenue."),
			);
		}
	};

	const retirer = async () => {
		if (!produit) return;
		setErreur(null);
		try {
			await retirerMutation.mutateAsync({
				id: produit.id,
				reference: produit.reference,
				nom: produit.nom,
				idCategorieProduit: produit.id_categorie_produit,
				prixAchat: produit.prix_achat,
				prixVente: produit.prix_vente,
				seuilAlerte: produit.seuil_alerte,
				idFournisseur: produit.id_fournisseur,
				actif: produit.actif,
				imageUrl: produit.image_url,
				codeBarre: null,
			});
		} catch (error) {
			setErreur(
				getErrorMessageForCode(toApiError(error).code) ??
					(toApiError(error).message || "Une erreur est survenue."),
			);
		}
	};

	const imprimer = async () => {
		// Réutilise le blob déjà chargé pour l'aperçu (`useEtiquetteBlobUrl`) —
		// un `blob:` URL se relit localement, pas de requête réseau supplémentaire.
		if (!blobUrl) return;
		setImpressionEnCours(true);
		try {
			const blob = await fetch(blobUrl).then((reponse) => reponse.blob());
			imprimerImageBlob(blob);
		} catch {
			setErreur("Impossible de charger l'étiquette à imprimer.");
		} finally {
			setImpressionEnCours(false);
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Code-barres — {produit?.nom ?? ""}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{codeBarre
							? "Étiquette à imprimer pour ce produit."
							: "Ce produit n'a pas encore de code-barres."}
					</Dialog.Description>

					<div className="mt-4 space-y-4">
						{codeBarre ? (
							<>
								<p className="font-mono text-sm text-foreground">{codeBarre}</p>
								<div className="rounded-lg border border-border bg-background p-4">
									{etiquetteEnChargement ? (
										<p className="text-sm text-muted-foreground">
											Chargement de l'étiquette…
										</p>
									) : blobUrl ? (
										<img
											src={blobUrl}
											alt={`Étiquette code-barres ${codeBarre}`}
											className="mx-auto max-w-full"
										/>
									) : (
										<p className="text-sm text-destructive">
											Impossible de charger l'étiquette.
										</p>
									)}
								</div>
								<div className="flex items-center justify-between gap-2">
									{canModifier ? (
										<Button
											variant="outline"
											size="sm"
											disabled={retirerMutation.isPending}
											onClick={() => void retirer()}
										>
											{retirerMutation.isPending ? (
												<Loader2 className="size-4 animate-spin" aria-hidden />
											) : null}
											Retirer
										</Button>
									) : (
										<span />
									)}
									<Button
										size="sm"
										disabled={impressionEnCours || !blobUrl}
										onClick={() => void imprimer()}
									>
										{impressionEnCours ? (
											<Loader2 className="size-4 animate-spin" aria-hidden />
										) : (
											<Printer className="size-4" aria-hidden />
										)}
										Imprimer
									</Button>
								</div>
							</>
						) : canModifier ? (
							<Button
								disabled={genererMutation.isPending}
								onClick={() => void generer()}
							>
								{genererMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : null}
								Générer un code-barres
							</Button>
						) : (
							<p className="text-sm text-muted-foreground">
								Vous n'avez pas la permission de générer un code-barres pour ce
								produit.
							</p>
						)}

						{erreur ? (
							<p role="alert" className="text-sm font-medium text-destructive">
								{erreur}
							</p>
						) : null}
					</div>

					<div className="mt-4 flex justify-end">
						<Button variant="ghost" onClick={() => onOpenChange(false)}>
							Fermer
						</Button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
