import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState } from "react";

import { cn } from "#/lib/utils";

export interface ComboboxOption {
	value: string;
	label: string;
	/** Texte additionnel inclus dans la recherche (ex. référence, code), non affiché s'il diffère du label. */
	keywords?: string;
	/**
	 * Libellé court affiché sur le déclencheur en mobile (< `sm`) une fois
	 * l'option sélectionnée — le `label` complet reste utilisé dans la liste
	 * déroulante et sur écran large.
	 */
	selectedLabel?: string;
}

interface ComboboxProps {
	options: ComboboxOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	/** Associe un `<Label htmlFor={id}>` externe au déclencheur. */
	id?: string;
	ariaLabel?: string;
	className?: string;
	disabled?: boolean;
}

const normalise = (texte: string) =>
	texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Select avec recherche — alternative à `Select` pour une liste longue
 * chargée côté client (produits, prestations…) où retrouver une entrée en
 * faisant défiler n'est pas praticable. Recherche sur `label` + `keywords`,
 * insensible à la casse/accents.
 */
export function Combobox({
	options,
	value,
	onValueChange,
	placeholder = "Sélectionner…",
	searchPlaceholder = "Rechercher…",
	emptyText = "Aucun résultat.",
	id,
	ariaLabel,
	className,
	disabled,
}: ComboboxProps) {
	const [open, setOpen] = useState(false);
	const [terme, setTerme] = useState("");

	const selectionne = options.find((option) => option.value === value);

	const resultats = useMemo(() => {
		const recherche = normalise(terme.trim());
		if (!recherche) return options;
		return options.filter((option) =>
			normalise(`${option.label} ${option.keywords ?? ""}`).includes(recherche),
		);
	}, [options, terme]);

	return (
		<PopoverPrimitive.Root
			open={open}
			onOpenChange={(prochainOuvert) => {
				setOpen(prochainOuvert);
				if (!prochainOuvert) setTerme("");
			}}
		>
			<PopoverPrimitive.Trigger asChild>
				<button
					type="button"
					id={id}
					data-slot="combobox-trigger"
					aria-label={ariaLabel}
					disabled={disabled}
					className={cn(
						"flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
						!selectionne && "text-muted-foreground",
						className,
					)}
				>
					{selectionne?.selectedLabel ? (
						<>
							<span className="truncate sm:hidden">
								{selectionne.selectedLabel}
							</span>
							<span className="hidden truncate sm:inline">
								{selectionne.label}
							</span>
						</>
					) : (
						<span className="truncate">
							{selectionne ? selectionne.label : placeholder}
						</span>
					)}
					<ChevronDownIcon className="size-4 shrink-0 opacity-50" aria-hidden />
				</button>
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					data-slot="combobox-content"
					align="start"
					sideOffset={4}
					className="z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
				>
					<div className="flex items-center gap-2 border-b px-3">
						<SearchIcon
							className="size-4 shrink-0 text-muted-foreground"
							aria-hidden
						/>
						{/* Pas de `autoFocus` : `Popover.Content` de Radix place déjà le
						    focus sur son premier élément focusable (cet input) à
						    l'ouverture — un `autoFocus` React serait redondant et
						    signalé par la règle d'accessibilité `noAutofocus`. */}
						<input
							value={terme}
							onChange={(event) => setTerme(event.target.value)}
							placeholder={searchPlaceholder}
							className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						/>
					</div>
					<div className="max-h-64 overflow-y-auto p-1">
						{resultats.length === 0 ? (
							<p className="px-2 py-3 text-center text-sm text-muted-foreground">
								{emptyText}
							</p>
						) : (
							resultats.map((option) => (
								<button
									key={option.value}
									type="button"
									data-slot="combobox-item"
									onClick={() => {
										onValueChange(option.value);
										setOpen(false);
										setTerme("");
									}}
									className="flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-2 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
								>
									<span className="flex size-3.5 shrink-0 items-center justify-center">
										{option.value === value ? (
											<CheckIcon className="size-4" aria-hidden />
										) : null}
									</span>
									<span className="truncate">{option.label}</span>
								</button>
							))
						)}
					</div>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
}
