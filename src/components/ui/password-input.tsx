import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { InputField, type InputFieldProps } from "./input-field";

/** Champ mot de passe avec bascule d'affichage (oeil). */
type PasswordInputProps = Omit<
	InputFieldProps,
	"type" | "autoComplete" | "trailing"
>;

function PasswordInput({ label, ...props }: PasswordInputProps) {
	const [visible, setVisible] = useState(false);

	return (
		<InputField
			{...props}
			label={label}
			type={visible ? "text" : "password"}
			autoComplete="current-password"
			trailing={
				<button
					type="button"
					onClick={() => setVisible((current) => !current)}
					aria-label={
						visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
					}
					className="flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					{visible ? (
						<EyeOff className="size-4" aria-hidden />
					) : (
						<Eye className="size-4" aria-hidden />
					)}
				</button>
			}
		/>
	);
}

export { PasswordInput };
