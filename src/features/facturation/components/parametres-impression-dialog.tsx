import { Loader2, Printer, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	getImprimanteThermique,
	setImprimanteThermique,
} from "#/lib/imprimante-thermique-store";
import { imprimerTicketQZ, qzEtatEtImprimantes } from "#/lib/qz-tray-client";

/** Ticket minimal auto-suffisant, pour tester l'impression sans facture réelle. */
function ticketDeTest(): string {
	const maintenant = new Date().toLocaleString("fr-FR");
	return `<html><head><style>
body { text-align: center; }
p { margin: 2px 0; }
</style></head><body>
<p><strong>GLOBAL SIM GROUP</strong></p>
<p>Ticket de test d'impression</p>
<p>${maintenant}</p>
<p>------------------------------</p>
<p>Si ce ticket s'imprime correctement,</p>
<p>l'impression thermique via QZ Tray</p>
<p>fonctionne sur ce poste.</p>
</body></html>`;
}

type Statut = "verification" | "indisponible" | "disponible";

interface ParametresImpressionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Modale « Paramètres d'impression » : choix de l'imprimante thermique QZ
 * Tray pour CE poste (réglage local, `localStorage` — jamais envoyé au
 * backend). Une fois configurée, `printFactureTicket` l'utilise
 * automatiquement pour tous les tickets, sans repasser par la boîte
 * d'impression du navigateur (voir `docs.global-sim-group.com/frontend/impression/`).
 */
export function ParametresImpressionDialog({
	open,
	onOpenChange,
}: ParametresImpressionDialogProps) {
	const [statut, setStatut] = useState<Statut>("verification");
	const [imprimantes, setImprimantes] = useState<string[]>([]);
	const [choix, setChoix] = useState<string>("");
	const [testEnCours, setTestEnCours] = useState(false);
	const [messageTest, setMessageTest] = useState<string | null>(null);

	const rafraichir = () => {
		setStatut("verification");
		setMessageTest(null);
		void qzEtatEtImprimantes().then(({ disponible, imprimantes: liste }) => {
			setStatut(disponible ? "disponible" : "indisponible");
			setImprimantes(liste);
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: ne doit s'exécuter qu'à l'ouverture, pas à chaque nouvelle référence de `rafraichir`
	useEffect(() => {
		if (!open) return;
		setChoix(getImprimanteThermique() ?? "");
		rafraichir();
	}, [open]);

	const handleEnregistrer = () => {
		setImprimanteThermique(choix || null);
		onOpenChange(false);
	};

	const handleTest = async () => {
		if (!choix) return;
		setTestEnCours(true);
		setMessageTest(null);
		try {
			await imprimerTicketQZ(ticketDeTest(), 58, choix);
			setMessageTest("Ticket de test envoyé.");
		} catch (error) {
			setMessageTest(
				error instanceof Error
					? error.message
					: "Échec de l'impression du ticket de test.",
			);
		} finally {
			setTestEnCours(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogTitle>Paramètres d'impression</DialogTitle>
				<DialogDescription>
					Imprime directement sur une imprimante thermique via QZ Tray, sans
					passer par la boîte d'impression du navigateur.
				</DialogDescription>

				<div className="mt-4 space-y-4">
					{statut === "verification" ? (
						<p className="flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" aria-hidden />
							Vérification de QZ Tray…
						</p>
					) : statut === "indisponible" ? (
						<div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
							<p>
								QZ Tray n'est pas détecté sur ce poste. Les tickets s'impriment
								via la boîte d'impression du navigateur.
							</p>
							<p>
								Pour une impression directe, installez l'agent{" "}
								<a
									href="https://qz.io"
									target="_blank"
									rel="noreferrer"
									className="underline"
								>
									QZ Tray
								</a>{" "}
								sur ce poste puis rafraîchissez.
							</p>
							<Button variant="outline" size="sm" onClick={rafraichir}>
								<RefreshCw className="size-4" aria-hidden />
								Rafraîchir
							</Button>
						</div>
					) : (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="imprimante-qz">Imprimante thermique</Label>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									title="Rafraîchir la liste"
									onClick={rafraichir}
								>
									<RefreshCw className="size-4" aria-hidden />
								</Button>
							</div>
							<Select value={choix} onValueChange={setChoix}>
								<SelectTrigger
									id="imprimante-qz"
									aria-label="Imprimante thermique"
									className="w-full"
								>
									<SelectValue placeholder="Aucune (boîte d'impression navigateur)" />
								</SelectTrigger>
								<SelectContent>
									{imprimantes.map((nom) => (
										<SelectItem key={nom} value={nom}>
											{nom}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{imprimantes.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									QZ Tray est connecté mais ne voit aucune imprimante système
									sur ce poste.
								</p>
							) : null}
						</div>
					)}

					{statut === "disponible" && choix ? (
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={testEnCours}
								onClick={() => void handleTest()}
							>
								{testEnCours ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<Printer className="size-4" aria-hidden />
								)}
								Imprimer un ticket de test
							</Button>
							{messageTest ? (
								<p className="text-xs text-muted-foreground">{messageTest}</p>
							) : null}
						</div>
					) : null}
				</div>

				<div className="mt-6 flex items-center justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
					>
						Annuler
					</Button>
					<Button type="button" onClick={handleEnregistrer}>
						Enregistrer
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
