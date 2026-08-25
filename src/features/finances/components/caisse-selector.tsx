import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { listerCaisses } from "../api/caisses";
import { useCurrentCaisse } from "../hooks/use-current-caisse";

interface CaisseSelectorProps {
	value?: string | null;
	onChange?: (id: string) => void;
	disabled?: boolean;
	filtreActivite?: string;
	showCreateQuick?: boolean;
	onCreateQuick?: () => void;
}

/**
 * Sélecteur de caisse réutilisable.
 * - Si utilisateur scopé: affiche sa caisse (non modifiable)
 * - Si admin: dropdown de toutes les caisses
 */
export function CaisseSelector({
	value,
	onChange,
	disabled = false,
	filtreActivite,
	showCreateQuick = false,
	onCreateQuick,
}: CaisseSelectorProps) {
	const userCaisse = useCurrentCaisse();
	const [showCreate, setShowCreate] = useState(false);

	const { data: caisses = [] } = useQuery({
		queryKey: ["caisses", filtreActivite],
		queryFn: () => listerCaisses({ id_activite: filtreActivite }),
	});

	// Si utilisateur scopé: afficher uniquement sa caisse
	if (userCaisse) {
		const maCaisse = caisses.find((c) => c.id_caisse === userCaisse);
		return (
			<div className="space-y-1">
				<label className="text-sm font-medium text-foreground">Caisse</label>
				<div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
					<span className="flex-1">{maCaisse?.libelle || userCaisse}</span>
					<span className="text-xs text-muted-foreground">(personnel)</span>
				</div>
			</div>
		);
	}

	// Admin: sélecteur dropdown
	if (caisses.length === 0) {
		return (
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">Caisse</label>
				<div className="rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
					Aucune caisse disponible. Créez-en une d'abord.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<label className="text-sm font-medium text-foreground">Caisse</label>
			<div className="flex gap-2">
				<select
					value={value ?? ""}
					onChange={(e) => onChange?.(e.target.value)}
					disabled={disabled}
					className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
				>
					<option value="">Sélectionner une caisse...</option>
					{caisses.map((caisse) => (
						<option key={caisse.id_caisse} value={caisse.id_caisse}>
							{caisse.libelle}
						</option>
					))}
				</select>

				{showCreateQuick && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setShowCreate(true)}
						title="Créer une caisse rapide"
					>
						<Plus className="size-4" />
					</Button>
				)}
			</div>

			{showCreate && (
				<div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
					<div className="flex gap-2">
						<AlertCircle className="size-4 shrink-0 mt-0.5" />
						<div>
							<p className="font-medium">
								Créer une caisse d'abord dans Finances → Caisses
							</p>
							<p className="text-xs mt-1 opacity-75">
								Puis revenir ici pour l'assigner à cet employé.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
