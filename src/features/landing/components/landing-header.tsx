import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";

export function LandingHeader() {
	const currentUser = useCurrentUser();
	const navigate = useNavigate();

	return (
		<header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-2">
					<img
						src="/logo.png"
						alt="GLOBAL SIM GROUP"
						className="h-8 w-auto object-contain"
					/>
					<span className="hidden sm:inline text-lg font-bold text-foreground">
						GLOBAL SIM GROUP
					</span>
				</Link>

				<nav className="flex items-center gap-4">
					{currentUser ? (
						<>
							<span className="text-sm text-muted-foreground">
								Bienvenue, {currentUser.login}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate({ to: "/home" })}
							>
								Tableau de bord
							</Button>
						</>
					) : (
						<Button
							size="sm"
							className="bg-lagoon hover:bg-lagoon/90"
							onClick={() => navigate({ to: "/login" })}
						>
							Connexion
						</Button>
					)}
				</nav>
			</div>
		</header>
	);
}
