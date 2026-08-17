import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useAuth } from "#/core/auth";
import * as m from "#/paraglide/messages";

/**
 * Déconnexion : révoque le refresh token (best-effort), purge la session
 * locale, puis redirige vers /login. À utiliser sous `<AuthProvider>`.
 *
 * `className` permet de restyler le bouton (ex. footer de la sidebar sombre) —
 * le `Button` shadcn fusionne ses classes avec `cn`.
 */
export function LogoutButton({ className }: { className?: string }) {
	const { logout } = useAuth();
	const router = useRouter();

	return (
		<Button
			variant="ghost"
			size="sm"
			className={className}
			onClick={() => {
				void logout().then(() => router.navigate({ to: "/login" }));
			}}
		>
			<LogOut />
			{m.auth_logout()}
		</Button>
	);
}
