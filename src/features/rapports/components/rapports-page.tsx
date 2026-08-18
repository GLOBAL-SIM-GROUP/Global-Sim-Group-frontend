import { useNavigate } from "@tanstack/react-router";
import { FileDown } from "lucide-react";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCan } from "#/core/auth";

import { periodeParType, type TypePeriodeRapport } from "../models/rapports";

const TYPES_RAPPORT: { valeur: string; libelle: string }[] = [
	{ valeur: "synthese", libelle: "Synthèse globale" },
	{ valeur: "financier", libelle: "Financier" },
	{ valeur: "residence", libelle: "Résidence" },
	{ valeur: "market", libelle: "Market" },
	{ valeur: "pressing", libelle: "Pressing" },
	{ valeur: "restaurant", libelle: "Restaurant" },
	{ valeur: "salle_fete", libelle: "Salle de fête" },
	{ valeur: "rh", libelle: "RH" },
];

const PERIODES: { valeur: TypePeriodeRapport; libelle: string }[] = [
	{ valeur: "ce_mois", libelle: "Ce mois" },
	{ valeur: "mois_precedent", libelle: "Mois précédent" },
	{ valeur: "annee", libelle: "Cette année" },
	{ valeur: "personnalisee", libelle: "Période personnalisée" },
];

const ACTIVITE_PAR_TYPE: Record<string, string> = {
	residence: "LOCATION_RESIDENTIEL",
	market: "VENTE_MARCHANDISES",
	pressing: "PRESSING",
	restaurant: "RESTAURATION",
	salle_fete: "SALLE_FETE",
};

/**
 * Page « Rapports » (M10) : choix du type de rapport, de la période (puis
 * personnalisation) et lancement de la génération — la vue du rapport est
 * ouverte avec la période dans l'URL (export CSV disponible sur chaque page).
 */
export function RapportsPage() {
	const canVoir = useCan("ADMIN.VOIR");
	const navigate = useNavigate();

	const [type, setType] = useState("synthese");
	const [periode, setPeriode] = useState<TypePeriodeRapport>("ce_mois");
	const [du, setDu] = useState("");
	const [au, setAu] = useState("");

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux rapports.
			</div>
		);
	}

	const generer = () => {
		const calculee = periodeParType(periode);
		const periodeDu = du || calculee.du;
		const periodeAu = au || calculee.au;
		const search = { du: periodeDu, au: periodeAu };
		if (type === "synthese") {
			void navigate({ to: "/rapports/synthese-globale", search });
		} else if (type === "financier") {
			void navigate({ to: "/rapports/financier", search });
		} else if (type === "rh") {
			void navigate({ to: "/rapports/rh", search });
		} else {
			void navigate({
				to: "/rapports/activites/$code",
				params: { code: ACTIVITE_PAR_TYPE[type] },
				search,
			});
		}
	};

	return (
		<div className="mx-auto w-full max-w-3xl space-y-6 p-6">
			<Breadcrumb
				items={[{ label: "Accueil", to: "/" }, { label: "Rapports" }]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Rapports</h1>
				<p className="text-muted-foreground">
					Génération des rapports de synthèse, financiers, par activité et RH.
				</p>
			</section>

			<section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
				<div className="space-y-1.5">
					<Select value={type} onValueChange={setType}>
						<SelectTrigger aria-label="Type de rapport" className="w-full">
							<SelectValue placeholder="Type de rapport" />
						</SelectTrigger>
						<SelectContent>
							{TYPES_RAPPORT.map((option) => (
								<SelectItem key={option.valeur} value={option.valeur}>
									{option.libelle}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Select
						value={periode}
						onValueChange={(valeur) => setPeriode(valeur as TypePeriodeRapport)}
					>
						<SelectTrigger aria-label="Période" className="w-full">
							<SelectValue placeholder="Période" />
						</SelectTrigger>
						<SelectContent>
							{PERIODES.map((option) => (
								<SelectItem key={option.valeur} value={option.valeur}>
									{option.libelle}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{periode === "personnalisee" ? (
					<div className="flex flex-wrap items-center gap-3">
						<Input
							type="date"
							value={du}
							onChange={(event) => setDu(event.target.value)}
							aria-label="Début de période"
							className="w-44"
						/>
						<Input
							type="date"
							value={au}
							onChange={(event) => setAu(event.target.value)}
							aria-label="Fin de période"
							className="w-44"
						/>
					</div>
				) : null}

				<div className="flex items-center justify-end gap-3 border-t border-border pt-4">
					<p className="text-xs text-muted-foreground">
						Export disponible en Excel (CSV) sur la page du rapport.
					</p>
					<Button onClick={generer}>
						<FileDown className="size-4" aria-hidden />
						Générer le rapport
					</Button>
				</div>
			</section>
		</div>
	);
}
