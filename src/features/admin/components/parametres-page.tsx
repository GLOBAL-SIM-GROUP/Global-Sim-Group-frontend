import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useCan } from "#/core/auth";

import { useMajParametre, useParametres } from "../hooks/use-parametres";
import type { Parametre } from "../models/parametres";

/** Ligne paramètre : valeur éditable + enregistrement dédié. */
function LigneParametre({ parametre }: { parametre: Parametre }) {
	const majMutation = useMajParametre();
	const [valeur, setValeur] = useState(parametre.valeur);
	const modifiee = valeur !== parametre.valeur;

	return (
		<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-sea-ink/5 p-4">
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-foreground">{parametre.cle}</p>
				<p className="text-xs text-muted-foreground">
					{parametre.description ?? "—"}
				</p>
			</div>
			<Input
				value={valeur}
				onChange={(event) => setValeur(event.target.value)}
				className="w-64"
				aria-label={`Valeur de ${parametre.cle}`}
			/>
			<Button
				size="sm"
				onClick={() => majMutation.mutate({ cle: parametre.cle, valeur })}
				disabled={!modifiee || majMutation.isPending}
			>
				{majMutation.isPending ? (
					<Loader2 className="size-4 animate-spin" aria-hidden />
				) : (
					<Check className="size-4" aria-hidden />
				)}
				Enregistrer
			</Button>
		</div>
	);
}

/**
 * Page « Paramètres » (M11, 12.6) : paramétrage évolutif clé/valeur (devise,
 * délais, préfixes…). Les listes configurables (catégories, prestations, moyens
 * de paiement) vivent dans leurs modules respectifs.
 */
export function ParametresPage() {
	const canModifier = useCan("ADMIN.MODIFIER");
	const parametresQuery = useParametres();

	const parametres = parametresQuery.data ?? [];
	const devise = parametres.find((p) => p.cle === "devise");

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Paramètres" }]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Paramètres</h1>
				<p className="text-muted-foreground">
					Paramétrage de l'application :
					{devise ? ` monnaie ${devise.valeur}.` : ""}
				</p>
			</section>

			{parametresQuery.isLoading ? (
				<p className="text-sm text-muted-foreground">Chargement…</p>
			) : parametresQuery.isError ? (
				<div
					role="alert"
					className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
				>
					<p>Impossible de charger les paramètres.</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void parametresQuery.refetch()}
					>
						Réessayer
					</Button>
				</div>
			) : parametres.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun paramètre trouvé.
				</div>
			) : (
				<div className="space-y-3">
					{parametres.map((parametre) => (
						<LigneParametre key={parametre.id} parametre={parametre} />
					))}
				</div>
			)}

			{!canModifier ? (
				<p className="text-xs text-muted-foreground">
					Vous n'avez pas la permission de modifier les paramètres.
				</p>
			) : null}
		</div>
	);
}
