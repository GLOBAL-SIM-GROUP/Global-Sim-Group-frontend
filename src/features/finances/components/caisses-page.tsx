import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Breadcrumb } from "#/components/ui/breadcrumb";
import { useCan } from "#/core/auth";
import { cn } from "#/lib/utils";

import {
	creerCaisse,
	listerCaisses,
	modifierCaisse,
} from "../api/caisses";
import type { Caisse, CreerCaisseDto } from "../models/caisses";

/**
 * Page de gestion des caisses (liste + CRUD).
 * Admins uniquement.
 */
export function CaissesPage() {
	const canModifier = useCan("FINANCES.MODIFIER");
	const queryClient = useQueryClient();
	const [openCreate, setOpenCreate] = useState(false);
	const [openEdit, setOpenEdit] = useState<string | null>(null);
	const [formData, setFormData] = useState<CreerCaisseDto>({
		libelle: "",
		id_activite: "",
	});

	const { data: caisses = [], isLoading } = useQuery({
		queryKey: ["caisses"],
		queryFn: () => listerCaisses(),
	});

	const createMut = useMutation({
		mutationFn: (dto: CreerCaisseDto) => creerCaisse(dto),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["caisses"] });
			setFormData({ libelle: "", id_activite: "" });
			setOpenCreate(false);
		},
	});

	const editMut = useMutation({
		mutationFn: (dto: { id: string; data: Partial<CreerCaisseDto> }) =>
			modifierCaisse(dto.id, dto.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["caisses"] });
			setOpenEdit(null);
		},
	});

	const handleCreate = () => {
		if (!formData.libelle.trim() || !formData.id_activite) return;
		createMut.mutate(formData);
	};

	const handleEdit = (caisse: Caisse) => {
		setOpenEdit(caisse.id_caisse);
		setFormData({
			libelle: caisse.libelle,
			id_activite: caisse.id_activite,
		});
	};

	const handleSaveEdit = () => {
		if (!openEdit) return;
		editMut.mutate({
			id: openEdit,
			data: { libelle: formData.libelle },
		});
	};

	if (!canModifier) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès à la gestion des caisses.
			</div>
		);
	}

	if (isLoading) {
		return <div className="p-6 text-center text-muted-foreground">Chargement…</div>;
	}

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 p-6">
			<Breadcrumb
				items={[
					{ label: "Accueil", to: "/" },
					{ label: "Finances", to: "/finances/tableau-de-bord" },
					{ label: "Caisses" },
				]}
			/>

			<section className="space-y-1">
				<h1 className="text-2xl font-semibold text-foreground">Caisses</h1>
				<p className="text-muted-foreground">
					Gérez les points d'encaissement par activité.
				</p>
			</section>

			{/* Create Dialog */}
			<Dialog.Root open={openCreate} onOpenChange={setOpenCreate}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
						<Dialog.Title className="text-base font-semibold text-foreground">
							Créer une caisse
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-muted-foreground">
							Remplissez les informations de la nouvelle caisse.
						</Dialog.Description>
						<div className="mt-6 space-y-4">
							<div>
								<label className="text-sm font-medium">Libellé</label>
								<Input
									value={formData.libelle}
									onChange={(e) =>
										setFormData({ ...formData, libelle: e.target.value })
									}
									placeholder="ex. Caisse 1 - Restaurant"
								/>
							</div>
							<div>
								<label className="text-sm font-medium">Activité</label>
								<select
									value={formData.id_activite}
									onChange={(e) =>
										setFormData({ ...formData, id_activite: e.target.value })
									}
									className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
								>
									<option value="">Sélectionner une activité</option>
									<option value="restaurant">Restaurant</option>
									<option value="pressing">Pressing</option>
									<option value="residence">Résidence</option>
									<option value="salle_fete">Salle de Fête</option>
									<option value="market">Marché</option>
								</select>
							</div>
							<div className="flex gap-2 justify-end pt-2">
								<Button
									variant="outline"
									onClick={() => setOpenCreate(false)}
								>
									Annuler
								</Button>
								<Button
									onClick={handleCreate}
									disabled={createMut.isPending}
								>
									{createMut.isPending ? "Création…" : "Créer"}
								</Button>
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			{/* Edit Dialog */}
			<Dialog.Root open={openEdit !== null} onOpenChange={(open) => !open && setOpenEdit(null)}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
					<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
						<Dialog.Title className="text-base font-semibold text-foreground">
							Modifier la caisse
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-muted-foreground">
							Mettez à jour les informations de la caisse.
						</Dialog.Description>
						<div className="mt-6 space-y-4">
							<div>
								<label className="text-sm font-medium">Libellé</label>
								<Input
									value={formData.libelle}
									onChange={(e) =>
										setFormData({ ...formData, libelle: e.target.value })
									}
								/>
							</div>
							<div className="flex gap-2 justify-end pt-2">
								<Button
									variant="outline"
									onClick={() => setOpenEdit(null)}
								>
									Annuler
								</Button>
								<Button
									onClick={handleSaveEdit}
									disabled={editMut.isPending}
								>
									{editMut.isPending ? "Modification…" : "Modifier"}
								</Button>
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			{/* Create button */}
			<div className="flex justify-end">
				<Button onClick={() => setOpenCreate(true)}>
					<Plus className="size-4 mr-2" />
					Nouvelle caisse
				</Button>
			</div>

			{/* Table */}
			{caisses.length === 0 ? (
				<div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
					Aucune caisse trouvée. Créez-en une pour commencer.
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-sea-ink text-left text-white">
							<tr>
								<th scope="col" className="px-4 py-3 font-medium">
									LIBELLÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									ACTIVITÉ
								</th>
								<th scope="col" className="px-4 py-3 font-medium">
									STATUT
								</th>
								<th scope="col" className="px-4 py-3 text-right font-medium">
									ACTIONS
								</th>
							</tr>
						</thead>
						<tbody>
							{caisses.map((caisse) => (
								<tr
									key={caisse.id_caisse}
									className="border-t border-border transition-colors hover:bg-accent/40"
								>
									<td className="px-4 py-3 font-medium text-foreground">
										{caisse.libelle}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{caisse.activite_libelle || caisse.id_activite || "—"}
									</td>
									<td className="px-4 py-3">
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												caisse.actif
													? "bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
													: "bg-gray-100/50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
											)}
										>
											{caisse.actif ? "Active" : "Inactive"}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										<div className="flex justify-end gap-2">
											<Button
												size="sm"
												variant="ghost"
												onClick={() => handleEdit(caisse)}
											>
												<Edit className="size-4" />
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
