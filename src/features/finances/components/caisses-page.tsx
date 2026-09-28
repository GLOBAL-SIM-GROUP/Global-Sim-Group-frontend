import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";
import { Input } from "#/components/ui/input";
import { PageHeader } from "#/components/ui/page-header";
import {
	DataTable,
	DataTableHead,
	TableShell,
	Td,
	Th,
	Tr,
} from "#/components/ui/table";
import { useCan } from "#/core/auth";

import { creerCaisse, listerCaisses, modifierCaisse } from "../api/caisses";
import type { Caisse, CreerCaisseDto } from "../models/caisses";

/**
 * Page des caisses : liste (tout titulaire de `FINANCES.VOIR` — filtrée par
 * activité côté backend pour un responsable de service sans caisse propre)
 * + création/modification (`FINANCES.MODIFIER`, masqué sinon).
 */
export function CaissesPage() {
	const canVoir = useCan("FINANCES.VOIR");
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

	if (!canVoir) {
		return (
			<div className="p-6 text-sm text-muted-foreground">
				Vous n'avez pas accès aux caisses.
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="p-6 text-center text-muted-foreground">Chargement…</div>
		);
	}

	return (
		<div className="w-full space-y-6 p-6">
			<PageHeader
				breadcrumb={[
					{ label: "Accueil", to: "/" },
					{ label: "Finances", to: "/finances/tableau-de-bord" },
					{ label: "Caisses" },
				]}
				title="Caisses"
				description={
					canModifier
						? "Gérez les points d'encaissement par activité."
						: "Points d'encaissement de votre activité."
				}
			/>

			{canModifier ? (
				<>
					{/* Create Dialog */}
					<Dialog open={openCreate} onOpenChange={setOpenCreate}>
						<DialogContent className="max-w-md">
							<DialogTitle>Créer une caisse</DialogTitle>
							<DialogDescription>
								Remplissez les informations de la nouvelle caisse.
							</DialogDescription>
							<div className="mt-6 space-y-4">
								<div>
									<label
										htmlFor="caisse-libelle-create"
										className="text-sm font-medium"
									>
										Libellé
									</label>
									<Input
										id="caisse-libelle-create"
										value={formData.libelle}
										onChange={(e) =>
											setFormData({ ...formData, libelle: e.target.value })
										}
										placeholder="ex. Caisse 1 - Restaurant"
									/>
								</div>
								<div>
									<label
										htmlFor="caisse-activite-create"
										className="text-sm font-medium"
									>
										Activité
									</label>
									<select
										id="caisse-activite-create"
										value={formData.id_activite}
										onChange={(e) =>
											setFormData({
												...formData,
												id_activite: e.target.value,
											})
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
									<Button onClick={handleCreate} disabled={createMut.isPending}>
										{createMut.isPending ? "Création…" : "Créer"}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>

					{/* Edit Dialog */}
					<Dialog
						open={openEdit !== null}
						onOpenChange={(open) => !open && setOpenEdit(null)}
					>
						<DialogContent className="max-w-md">
							<DialogTitle>Modifier la caisse</DialogTitle>
							<DialogDescription>
								Mettez à jour les informations de la caisse.
							</DialogDescription>
							<div className="mt-6 space-y-4">
								<div>
									<label
										htmlFor="caisse-libelle-edit"
										className="text-sm font-medium"
									>
										Libellé
									</label>
									<Input
										id="caisse-libelle-edit"
										value={formData.libelle}
										onChange={(e) =>
											setFormData({ ...formData, libelle: e.target.value })
										}
									/>
								</div>
								<div className="flex gap-2 justify-end pt-2">
									<Button variant="outline" onClick={() => setOpenEdit(null)}>
										Annuler
									</Button>
									<Button onClick={handleSaveEdit} disabled={editMut.isPending}>
										{editMut.isPending ? "Modification…" : "Modifier"}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>

					{/* Create button */}
					<div className="flex justify-end">
						<Button onClick={() => setOpenCreate(true)}>
							<Plus className="size-4 mr-2" />
							Nouvelle caisse
						</Button>
					</div>
				</>
			) : null}

			{/* Table */}
			{caisses.length === 0 ? (
				<EmptyState title="Aucune caisse trouvée. Créez-en une pour commencer." />
			) : (
				<TableShell>
					<DataTable>
						<DataTableHead>
							<tr>
								<Th>LIBELLÉ</Th>
								<Th>ACTIVITÉ</Th>
								<Th>STATUT</Th>
								{canModifier ? <Th className="text-right">ACTIONS</Th> : null}
							</tr>
						</DataTableHead>
						<tbody>
							{caisses.map((caisse) => (
								<Tr key={caisse.id_caisse}>
									<Td className="font-medium text-foreground">
										{caisse.libelle}
									</Td>
									<Td className="text-muted-foreground">
										{caisse.activite_libelle || caisse.id_activite || "—"}
									</Td>
									<Td>
										<Badge variant={caisse.actif ? "success" : "neutral"}>
											{caisse.actif ? "Active" : "Inactive"}
										</Badge>
									</Td>
									{canModifier ? (
										<Td className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													size="sm"
													variant="ghost"
													onClick={() => handleEdit(caisse)}
												>
													<Edit className="size-4" />
												</Button>
											</div>
										</Td>
									) : null}
								</Tr>
							))}
						</tbody>
					</DataTable>
				</TableShell>
			)}
		</div>
	);
}
