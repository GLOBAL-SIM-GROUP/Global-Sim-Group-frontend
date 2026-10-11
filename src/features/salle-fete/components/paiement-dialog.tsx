import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { messageErreurPaiement } from "#/core/api";
import { CaissePicker } from "#/features/finances/components/caisse-picker";
import { useCaissesAccessibles } from "#/features/finances/hooks/use-caisses-accessibles";
import {
	erreurCaisseRequise,
	idCaisseAEnvoyer,
} from "#/features/finances/models/caisses";

/**
 * Dialog de paiement partagé (Confirmer / Réaliser une réservation, paie
 * RH, paiement de facture).
 *
 * `montantFige` : le montant est le reste dû exact (endpoints « solde » —
 * `realiser`, paie) — affiché en lecture seule, le serveur exige l'égalité
 * stricte (`SOLDE_INCOMPLET`). À `montantDefaut` nul ('0.00'), aucun
 * mouvement n'a lieu : moyen + caisse sont masqués et omis du corps
 * (`MOYEN_PAIEMENT_SUPERFLU`).
 *
 * `onValider` est `async` : la modale reste ouverte et affiche l'erreur
 * codée (`MONTANT_*`, `CAISSE_*`, `STATUT_INCOMPATIBLE`) si l'appel échoue.
 */
export function PaiementDialog({
	titre,
	montantDefaut,
	moyens,
	sens = "destination",
	montantFige = false,
	onOpenChange,
	onValider,
}: {
	titre: string;
	montantDefaut: string;
	moyens: { id: string; libelle: string }[];
	/** « source » pour les décaissements (remboursement, paie). */
	sens?: "destination" | "source";
	/** Montant figé au reste dû exact (solde). */
	montantFige?: boolean;
	onOpenChange: (open: boolean) => void;
	onValider: (
		montant: string,
		idMoyen: string,
		idCaisse?: string,
	) => Promise<unknown>;
}) {
	const [montant, setMontant] = useState(montantDefaut);
	const [idMoyen, setIdMoyen] = useState(moyens[0]?.id ?? "");
	const [idCaisse, setIdCaisse] = useState("");
	const [enCours, setEnCours] = useState(false);
	const [erreur, setErreur] = useState<string | null>(null);
	const caissesQuery = useCaissesAccessibles();
	const rienAPayer = Number(montantDefaut) === 0;
	const erreurCaisse = rienAPayer
		? null
		: erreurCaisseRequise(caissesQuery.data, idCaisse, sens);
	const montantInvalide =
		!rienAPayer && (!montant.trim() || Number(montant) <= 0);

	const valider = async () => {
		setErreur(null);
		setEnCours(true);
		try {
			await onValider(
				rienAPayer ? montantDefaut : montant,
				rienAPayer ? "" : idMoyen,
				rienAPayer ? undefined : idCaisseAEnvoyer(caissesQuery.data, idCaisse),
			);
			onOpenChange(false);
		} catch (error) {
			setErreur(messageErreurPaiement(error));
		} finally {
			setEnCours(false);
		}
	};

	return (
		<div className="space-y-3">
			<div>
				<Label htmlFor="paie-montant">Montant (FCFA)</Label>
				<input
					id="paie-montant"
					className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none read-only:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
					type="number"
					min="0"
					value={rienAPayer ? montantDefaut : montant}
					readOnly={montantFige || rienAPayer}
					onChange={(event) => setMontant(event.target.value)}
				/>
				{montantFige && !rienAPayer ? (
					<p className="mt-1 text-xs text-muted-foreground">
						Le règlement final exige le reste dû exact.
					</p>
				) : null}
			</div>
			{rienAPayer ? (
				<p className="rounded-md border border-success/30 bg-success-bg px-3 py-2 text-sm text-success">
					Rien à encaisser — l'opération se soldera sans mouvement de caisse.
				</p>
			) : (
				<>
					<div className="space-y-2">
						<Label htmlFor="paie-moyen">Moyen de paiement</Label>
						<Select value={idMoyen} onValueChange={setIdMoyen}>
							<SelectTrigger id="paie-moyen" className="w-full">
								<SelectValue placeholder="Sélectionner un moyen" />
							</SelectTrigger>
							<SelectContent>
								{moyens.map((moyen) => (
									<SelectItem key={moyen.id} value={moyen.id}>
										{moyen.libelle}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{moyens.length === 0 ? (
							<p className="text-xs text-muted-foreground">
								Aucun moyen de paiement configuré (module Finances).
							</p>
						) : null}
					</div>
					<CaissePicker
						id="paie-caisse"
						sens={sens}
						caisses={caissesQuery.data}
						chargement={caissesQuery.isLoading}
						value={idCaisse}
						onChange={setIdCaisse}
						erreur={erreurCaisse}
					/>
				</>
			)}
			{erreur ? (
				<p role="alert" className="text-sm font-medium text-destructive">
					{erreur}
				</p>
			) : null}
			<div className="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					disabled={enCours}
					onClick={() => onOpenChange(false)}
				>
					Annuler
				</Button>
				<Button
					type="button"
					disabled={enCours || erreurCaisse !== null || montantInvalide}
					onClick={() => void valider()}
				>
					{enCours ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : null}
					{titre}
				</Button>
			</div>
		</div>
	);
}
