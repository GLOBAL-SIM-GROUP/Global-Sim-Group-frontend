import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
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

	if (isLoading) {
		return <div className="p-6 text-center text-muted-foreground">Chargement…</div>;
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Caisses</h1>
					<p className="text-sm text-muted-foreground">
						Gérez les points d'encaissement par activité
					</p>
				</div>

				<Dialog open={openCreate} onOpenChange={setOpenCreate}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="size-4 mr-2" />
							Nouvelle caisse
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Créer une caisse</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
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
							<div className="flex gap-2 justify-end">
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
					</DialogContent>
				</Dialog>
			</div>

			{/* Tableau */}
			<div className="rounded-lg border border-border overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Libellé</TableHead>
							<TableHead>Activité</TableHead>
							<TableHead>Statut</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{caisses.map((caisse) => (
							<TableRow key={caisse.id_caisse}>
								<TableCell className="font-medium">
									{caisse.libelle}
								</TableCell>
								<TableCell>{caisse.id_activite}</TableCell>
								<TableCell>
									<span
										className={`text-xs px-2 py-1 rounded-full ${
											caisse.actif
												? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
												: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
										}`}
									>
										{caisse.actif ? "Active" : "Inactive"}
									</span>
								</TableCell>
								<TableCell className="text-right">
									<Dialog
										open={openEdit === caisse.id_caisse}
										onOpenChange={(open) =>
											!open && setOpenEdit(null)
										}
									>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEdit(caisse)}
											>
												<Edit className="size-4" />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Modifier caisse</DialogTitle>
											</DialogHeader>
											<div className="space-y-4">
												<div>
													<label className="text-sm font-medium">
														Libellé
													</label>
													<Input
														value={formData.libelle}
														onChange={(e) =>
															setFormData({
																...formData,
																libelle: e.target.value,
															})
														}
													/>
												</div>
												<div className="flex gap-2 justify-end">
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
														{editMut.isPending
															? "Modification…"
															: "Modifier"}
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>

									<Button
										variant="ghost"
										size="sm"
										className="text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="size-4" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{caisses.length === 0 && (
				<div className="text-center py-12 text-muted-foreground">
					<p>Aucune caisse créée. Créez-en une pour commencer!</p>
				</div>
			)}
		</div>
	);
}
