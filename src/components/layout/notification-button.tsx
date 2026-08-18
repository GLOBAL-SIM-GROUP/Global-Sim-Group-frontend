import { Bell } from "lucide-react";
import { Button } from "#/components/ui/button";

/**
 * Cloche de notifications — placeholder : aucun endpoint de notifications
 * n'existe côté backend pour l'instant, le clic ne déclenche rien. `className`
 * permet de restyler (ex. header clair) ; l'icône seule est accessible via
 * `aria-label`/`title`.
 */
export function NotificationButton({ className }: { className?: string }) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className={className}
			aria-label="Notifications"
			title="Notifications"
		>
			<Bell />
		</Button>
	);
}
