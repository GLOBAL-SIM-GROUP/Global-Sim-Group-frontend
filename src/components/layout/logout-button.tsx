import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useAuth } from "#/core/auth";

/**
 * Déconnexion : révoque le refresh token (best-effort), purge la session
 * locale, puis redirige vers /login. À utiliser sous `<AuthProvider>`.
 *
 * `className` permet de restyler le bouton (ex. footer de la sidebar sombre) —
 * le `Button` shadcn fusionne ses classes avec `cn`.
 * `showLabel` contrôle l'affichage du texte (par défaut true).
 */
export function LogoutButton({
	className,
	showLabel = true,
}: {
	className?: string;
	showLabel?: boolean;
}) {
	const { logout } = useAuth();
	const router = useRouter();

	return (
		<Button
			variant="ghost"
			size={showLabel ? "sm" : "icon"}
			className={className}
			title={showLabel ? undefined : "Se déconnecter"}
			aria-label="Se déconnecter"
			onClick={() => {
				void logout().then(() => router.navigate({ to: "/login" }));
			}}
		>
			<LogOut className="size-4" />
			{showLabel && <span className="hidden sm:inline">Se déconnecter</span>}
		</Button>
	);
}
