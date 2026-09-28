import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SignalementPage } from "./signalement-page";

const mocks = vi.hoisted(() => ({
	useCreerSignalementPortail: vi.fn(),
	useUploaderPhotoSignalementPortail: vi.fn(),
	creerMutateAsync: vi.fn(),
	uploadMutateAsync: vi.fn(),
}));

vi.mock("#/features/portail/hooks/use-signalements", () => ({
	useMesSignalements: vi.fn(() => ({ data: [], isLoading: false })),
	useSignalementPortail: vi.fn(() => ({ data: undefined })),
	useCreerSignalementPortail: mocks.useCreerSignalementPortail,
	useUploaderPhotoSignalementPortail: mocks.useUploaderPhotoSignalementPortail,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		Link: ({
			to,
			children,
			...props
		}: {
			to: string;
			children?: React.ReactNode;
		}) => (
			<a href={to} {...props}>
				{children}
			</a>
		),
	};
});

function saisirFormulaire(valeurs: Record<string, string>) {
	for (const [name, valeur] of Object.entries(valeurs)) {
		const champ = document.getElementsByName(name)[0] as HTMLElement;
		fireEvent.change(champ, { target: { value: valeur } });
	}
}

describe("SignalementPage", () => {
	beforeEach(() => {
		mocks.creerMutateAsync.mockReset().mockResolvedValue({
			id: "42",
			titre: "Climatiseur en panne",
			description: "Le climatiseur ne s'allume plus depuis hier.",
			cible_type: "GENERAL",
			module_cible: null,
			lieu: "Chambre 12",
			statut: "OUVERT",
			id_utilisateur_declarant: "7",
			date_signalement: "2026-09-15T10:00:00.000Z",
		});
		mocks.uploadMutateAsync.mockReset().mockResolvedValue({ id: "p1" });
		mocks.useCreerSignalementPortail.mockReturnValue({
			mutateAsync: mocks.creerMutateAsync,
			isPending: false,
		});
		mocks.useUploaderPhotoSignalementPortail.mockReturnValue({
			mutateAsync: mocks.uploadMutateAsync,
			isPending: false,
		});
	});

	it("affiche une erreur par champ obligatoire manquant à la soumission", async () => {
		const user = userEvent.setup();
		render(<SignalementPage />);

		await user.click(
			screen.getByRole("button", { name: /envoyer mon signalement/i }),
		);

		expect(await screen.findByText("Le sujet est requis.")).toBeInTheDocument();
		expect(screen.getByText("La description est requis.")).toBeInTheDocument();
		expect(mocks.creerMutateAsync).not.toHaveBeenCalled();
	});

	it("soumet le signalement à POST /signalements/portail, sans module_cible si général", async () => {
		const user = userEvent.setup();
		render(<SignalementPage />);

		saisirFormulaire({
			titre: "  Climatiseur en panne  ",
			lieu: "Chambre 12",
			description: "Le climatiseur ne s'allume plus depuis hier.",
		});
		await user.click(
			screen.getByRole("button", { name: /envoyer mon signalement/i }),
		);

		expect(mocks.creerMutateAsync).toHaveBeenCalledWith({
			titre: "Climatiseur en panne",
			description: "Le climatiseur ne s'allume plus depuis hier.",
			lieu: "Chambre 12",
		});
		expect(await screen.findByText("Signalement envoyé")).toBeInTheDocument();
		// Lien de suivi vers la fiche du signalement créé.
		expect(
			screen.getByRole("link", { name: /suivre mon signalement/i }),
		).toHaveAttribute("href", "/espace-client/signalement/$id");
	});

	it("propose les 5 modules du portail et laisse le choix « général » par défaut", () => {
		render(<SignalementPage />);

		expect(
			screen.getByText("Service concerné (optionnel)"),
		).toBeInTheDocument();
		// Le Select affiche « général » par défaut — rien n'est envoyé.
		// (Le libellé apparaît aussi dans l'item Radix caché : on cible le
		// combobox déclencheur pour lever l'ambiguïté.)
		expect(screen.getByRole("combobox")).toHaveTextContent(
			"Je ne sais pas / signalement général",
		);
	});
});
