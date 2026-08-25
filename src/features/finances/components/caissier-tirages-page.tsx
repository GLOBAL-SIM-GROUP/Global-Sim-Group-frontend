import { Plus } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Breadcrumb } from "#/components/ui/breadcrumb";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useCan } from "#/core/auth";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { cn } from "#/lib/utils";
import { useMesCaisses } from "../hooks/use-mes-caisses";
import { useCreerTirage, useTirages } from "../hooks/use-tirages";
import type { CreerTirageDto } from "../models/tirages";

/**
 * Tirages (fermetures de caisse) du caissier connecté (M8). Même résolution
 * de caisse que le dashboard — pas d'ID dans l'URL, `GET /finances/caisses`
 * scopé par le backend.
 */
export function CaissierTiragesPage() {
	const canVoir = useCan("FINANCES.VOIR");
	const canCreer = useCan("FINANCES.CREER");
	const { data: caisses, isLoading: caissesLoading } = useMesCaisses();
	const [openCreate, setOpenCreate] = useState(false);

	const idCaisse = caisses?.length === 1 ? caisses[0].id_caisse : null;

	const [formData, setFormData] = useState<CreerTirageDto>({
		montant_compte: "",
		date: new Date().toISOString().split("T")[0],
		id_caisse: "",
		note: "",
	});

	const { data: tirages = [], isLoading: tiragesLoading } = useTirages(
		idCaisse ? { id_caisse: idCaisse, limit: 50 } : undefined,
	);

	const createMut = useCreerTirage();

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux caisses.
			</div>
		);
	}

	if (caissesLoading) {
		return (
			<div className="p-6 text-center text-sm text-muted-foreground">
				Chargement…
			</div>
		);
	}

	if (!caisses || caisses.length === 0) {
		return (
			<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
				<Breadcrumb
					items={[{ label: "Accueil", to: "/" }, { label: "Tirages" }]}
				/>
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune caisse ne vous est assignée.
				</div>
			</div>
		);
	}

	if (caisses.length > 1) {
		return (
			<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
				<Breadcrumb
					items={[{ label: "Accueil", to: "/" }, { label: "Tirages" }]}
				/>
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Plusieurs caisses accessibles — ouvrez le tableau de bord pour en
					choisir une d'abord.
				</div>
			</div>
		);
	}

	const handleOpenCreate = () => {
		setFormData({
			montant_compte: "",
			date: new Date().toISOString().split("T")[0],
			id_caisse: idCaisse ?? "",
			note: "",
		});
		setOpenCreate(true);
	};

	const handleCreate = () => {
		if (!formData.montant_compte || !idCaisse) return;
		createMut.mutate(
			{ ...formData, id_caisse: idCaisse },
			{ onSuccess: () => setOpenCreate(false) },
		);
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Ma caisse", to: "/finances/caissier/dashboard" },
					{ label: "Tirages" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">
					Tirages de caisse
				</h1>
				<p className="text-muted-foreground">
					Fermeture et reconciliation de votre caisse
				</p>
			</section>

			<Dialog.Root open={openCreate} onOpenChange={setOpenCreate}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
						<Dialog.Title className="text-base font-semibold text-foreground">
							Enregistrer un tirage
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-muted-foreground">
							Remplissez le montant compté et la date du tirage.
						</Dialog.Description>
						<div className="mt-6 space-y-4">
							<div>
								<label htmlFor="tirage-date" className="text-sm font-medium">
									Date du tirage
								</label>
								<input
									id="tirage-date"
									type="date"
									value={formData.date}
									onChange={(e) =>
										setFormData({ ...formData, date: e.target.value })
									}
									className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
								/>
							</div>
							<div>
								<label htmlFor="tirage-montant" className="text-sm font-medium">
									Montant compté
								</label>
								<Input
									id="tirage-montant"
									type="number"
									value={formData.montant_compte}
									onChange={(e) =>
										setFormData({ ...formData, montant_compte: e.target.value })
									}
									placeholder="0.00"
									step="0.01"
								/>
							</div>
							<div>
								<label htmlFor="tirage-note" className="text-sm font-medium">
									Note (optionnel)
								</label>
								<textarea
									id="tirage-note"
									value={formData.note || ""}
									onChange={(e) =>
										setFormData({ ...formData, note: e.target.value })
									}
									placeholder="Ex: Manque de 5000 FCFA dû à..."
									className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
								/>
							</div>
							<div className="flex gap-2 justify-end pt-2">
								<Button variant="outline" onClick={() => setOpenCreate(false)}>
									Annuler
								</Button>
								<Button onClick={handleCreate} disabled={createMut.isPending}>
									{createMut.isPending ? "Enregistrement…" : "Enregistrer"}
								</Button>
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			{canCreer && (
				<div className="flex justify-end">
					<Button onClick={handleOpenCreate}>
						<Plus className="size-4 mr-2" />
						Nouveau tirage
					</Button>
				</div>
			)}

			{tiragesLoading ? (
				<div className="p-6 text-center text-muted-foreground">Chargement…</div>
			) : tirages.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucun tirage enregistré. Créez-en un pour commencer.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-6 py-3 font-medium">
									DATE
								</th>
								<th scope="col" className="px-6 py-3 text-right font-medium">
									MONTANT ATTENDU
								</th>
								<th scope="col" className="px-6 py-3 text-right font-medium">
									MONTANT COMPTÉ
								</th>
								<th scope="col" className="px-6 py-3 text-right font-medium">
									ÉCART
								</th>
								<th scope="col" className="px-6 py-3 font-medium">
									NOTE
								</th>
							</tr>
						</thead>
						<tbody>
							{tirages.map((tirage) => {
								const ecartVal = tirage.ecart || 0;
								return (
									<tr
										key={tirage.id}
										className="border-t border-border transition-colors hover:bg-accent/40"
									>
										<td className="px-6 py-3 text-muted-foreground">
											{new Date(tirage.date).toLocaleDateString("fr-FR")}
										</td>
										<td className="px-6 py-3 text-right">
											{formatMontantFCFA(
												(tirage.montant_attendu ?? 0).toString(),
											)}
										</td>
										<td className="px-6 py-3 text-right font-semibold">
											{formatMontantFCFA(tirage.montant_compte.toString())}
										</td>
										<td
											className={cn(
												"px-6 py-3 text-right font-semibold",
												ecartVal === 0
													? "text-green-700 dark:text-green-400"
													: ecartVal > 0
														? "text-blue-700 dark:text-blue-400"
														: "text-red-700 dark:text-red-400",
											)}
										>
											{formatMontantFCFA(Math.abs(ecartVal).toString())}
											{ecartVal > 0 ? " +" : ecartVal < 0 ? " -" : ""}
										</td>
										<td className="px-6 py-3 text-muted-foreground">
											{tirage.note || "—"}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
