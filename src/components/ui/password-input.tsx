import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import * as m from "#/paraglide/messages";

import { InputField, type InputFieldProps } from "./input-field";

/** Champ mot de passe avec bascule d'affichage (oeil) et label i18n. */
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
						visible
							? m.auth_login_hide_password()
							: m.auth_login_show_password()
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
