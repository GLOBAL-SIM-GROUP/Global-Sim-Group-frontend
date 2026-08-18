import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

import { useRechercherClients } from "../hooks/use-clients";
import { nomComplet } from "../models/clients";
import { CreerClientInlineForm } from "./creer-client-inline-form";

// ═══ DEBUG création client — CANARY ═══
// Exécuté au chargement de ce module (c.-à-d. quand un formulaire qui utilise
// la recherche client est ouvert). S'il n'apparaît PAS dans la console,
// l'application en cours d'exécution ne contient pas le code de débug.
console.log(
	"[DEBUG-client] CANARY — module client-recherche-field chargé (le code de débug est actif)",
);
// ═══ fin DEBUG ═══

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
}: ClientRechercheFieldProps) {
	const [terme, setTerme] = useState("");
	const termeDebounced = useDebouncedValue(terme, 300);
	const recherche = useRechercherClients(termeDebounced);
	const [selectionne, setSelectionne] = useState<{
		id: string;
		label: string;
	} | null>(null);
	const [creationOuverte, setCreationOuverte] = useState(false);

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
							onClick={() => {
								console.log(
									"[DEBUG-client] bouton 'Créer un client' cliqué — ouverture du formulaire inline",
								);
								setCreationOuverte(true);
							}}
						>
							<Plus className="size-4" aria-hidden />
							Créer un client
						</Button>
					) : (
						<CreerClientInlineForm
							onCancel={() => setCreationOuverte(false)}
							onSaved={(id, label) => {
								console.log(
									"[DEBUG-client] 4. onSaved appelé — id =",
									id,
									"label =",
									label,
								);
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
