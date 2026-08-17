import type * as React from "react";

import { cn } from "#/lib/utils.ts";

import { Input } from "./input";
import { Label } from "./label";

/**
 * Champ de saisie générique : label, icône décorative à gauche, élément
 * optionnel à droite (ex. bouton de visibilité), message d'erreur sous le
 * champ. Framework-agnostique — les props natives `input` passent telles
 * quelles (TanStack Form, react-hook-form, etc.).
 */
interface InputFieldProps extends React.ComponentProps<"input"> {
	/** Texte du label (rendu via `Label`). Requiert un `id` sur le champ. */
	label?: string;
	/** Icône décorative à gauche du champ (`aria-hidden`, non cliquable). */
	icon?: React.ReactNode;
	/** Élément interactif à droite du champ (cliquable, ex. toggle). */
	trailing?: React.ReactNode;
	/** Message d'erreur : affiché sous le champ et marque le champ `aria-invalid`. */
	error?: string;
}

function InputField({
	label,
	icon,
	trailing,
	error,
	className,
	...props
}: InputFieldProps) {
	return (
		<div className="space-y-2">
			{label ? <Label htmlFor={props.id}>{label}</Label> : null}
			<div className="relative">
				{icon ? (
					<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
						{icon}
					</span>
				) : null}
				<Input
					className={cn(icon && "pl-9", trailing && "pr-10", className)}
					aria-invalid={error ? true : undefined}
					{...props}
				/>
				{trailing ? (
					<span className="absolute inset-y-0 right-0 flex items-center pr-2">
						{trailing}
					</span>
				) : null}
			</div>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}

export { InputField, type InputFieldProps };
