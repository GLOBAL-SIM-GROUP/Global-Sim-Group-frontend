import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { ClientForm } from "#/features/clients/components/client-form";

import { useRechercherClients } from "../hooks/use-clients";
import { nomComplet } from "../models/clients";
import { CreerClientInlineForm } from "./creer-client-inline-form";

/** Mini-hook de debounce (aucune dépendance ajoutée). */
function useDebouncedValue<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return debounced;
}

interface ClientRechercheFieldProps {
	/** Id du client sélectionné (champ `idClient` du formulaire). */
	value: string;
	/** Pose l'id (et le libellé affiché) au moment du choix. */
	onChange: (id: string, label: string) => void;
	/**
	 * Si aucun client ne correspond à la recherche, affiche le formulaire
	 * complet de création d'un locataire (état civil, coordonnées…, type
	 * imposé à LOCATAIRE) plutôt que le formulaire rapide (nom, prénoms,
	 * téléphone, type). Utilisé par le formulaire de contrat de location : un
	 * locataire mérite un dossier complet, pas une fiche minimale pensée pour
	 * un client de passage au pressing/restaurant/boutique.
	 */
	creationLocataireComplete?: boolean;
	/**
	 * Notifie le formulaire parent quand le formulaire de création inline
	 * s'ouvre/se ferme, pour qu'il puisse masquer ses propres boutons
	 * « Enregistrer » / « Annuler » (évite deux paires de boutons visibles).
	 */
	onCreationOuverteChange?: (ouverte: boolean) => void;
}

/**
 * Champ « Client » du formulaire de contrat : recherche serveur (obligatoire,
 * débouncée, seuil ≥ 2 caractères), liste de résultats cliquables, et création
 * inline si aucun résultat. La sélection est affichée comme une puce
 * remplaçable.
 */
export function ClientRechercheField({
	value,
	onChange,
	creationLocataireComplete = false,
	onCreationOuverteChange,
}: ClientRechercheFieldProps) {
	const [terme, setTerme] = useState("");
	const termeDebounced = useDebouncedValue(terme, 300);
	const recherche = useRechercherClients(termeDebounced);
	const [selectionne, setSelectionne] = useState<{
		id: string;
		label: string;
	} | null>(null);
	const [creationOuverte, setCreationOuverte] = useState(false);

	useEffect(() => {
		onCreationOuverteChange?.(creationOuverte);
	}, [creationOuverte, onCreationOuverteChange]);

	if (selectionne) {
		return (
			<div className="space-y-2">
				<Label>Client</Label>
				<div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
					<span className="text-sm font-medium text-foreground">
						{selectionne.label}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => {
							setSelectionne(null);
							onChange("", "");
						}}
					>
						Changer
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<Label htmlFor="client-recherche">Client</Label>
			<Input
				id="client-recherche"
				value={terme}
				onChange={(event) => setTerme(event.target.value)}
				placeholder="Rechercher par nom, prénom, téléphone…"
				autoComplete="off"
			/>

			{terme.trim().length < 2 ? (
				<p className="text-xs text-muted-foreground">
					Saisissez au moins 2 caractères pour rechercher un client.
				</p>
			) : recherche.isLoading ? (
				<p className="text-xs text-muted-foreground">Recherche…</p>
			) : recherche.isError ? (
				<p role="alert" className="text-sm text-destructive">
					Impossible de rechercher les clients.
				</p>
			) : recherche.data && recherche.data.length > 0 ? (
				<ul className="divide-y divide-border rounded-md border border-border">
					{recherche.data.map((client) => (
						<li key={client.id}>
							<button
								type="button"
								onClick={() => {
									setSelectionne({ id: client.id, label: nomComplet(client) });
									onChange(client.id, nomComplet(client));
								}}
								className="w-full px-3 py-2 text-left transition-colors hover:bg-accent/40"
							>
								<span className="block text-sm font-medium text-foreground">
									{nomComplet(client)}
								</span>
								<span className="block text-xs text-muted-foreground">
									{client.tel_principal ?? ""}
								</span>
							</button>
						</li>
					))}
				</ul>
			) : (
				<div className="space-y-2 rounded-md border border-dashed border-border p-3">
					<p className="text-sm text-muted-foreground">Aucun client trouvé.</p>
					{!creationOuverte ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setCreationOuverte(true)}
						>
							<Plus className="size-4" aria-hidden />
							{creationLocataireComplete
								? "Créer un locataire"
								: "Créer un client"}
						</Button>
					) : creationLocataireComplete ? (
						<ClientForm
							client={null}
							typeClientCree="LOCATAIRE"
							embedded
							onCancel={() => setCreationOuverte(false)}
							onSaved={(id, label) => {
								if (!id) return;
								setSelectionne({ id, label: label ?? "" });
								onChange(id, label ?? "");
								setCreationOuverte(false);
								setTerme("");
							}}
						/>
					) : (
						<CreerClientInlineForm
							onCancel={() => setCreationOuverte(false)}
							onSaved={(id, label) => {
								setSelectionne({ id, label });
								onChange(id, label);
								setCreationOuverte(false);
								setTerme("");
							}}
						/>
					)}
				</div>
			)}

			{/* value est posé uniquement via selectionne ; champ a11y neutre. */}
			<input type="hidden" value={value} readOnly aria-hidden />
		</div>
	);
}
