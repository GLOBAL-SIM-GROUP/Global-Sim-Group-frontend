import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Produit } from "../models/produits";
import { BarcodeScanInput } from "./barcode-scan-input";

const mutateAsync = vi.fn();

vi.mock("../hooks/use-produits", () => ({
	useScannerProduit: () => ({ mutateAsync, isPending: false }),
}));

const PRODUIT = {
	id: "prod-1",
	nom: "Savon",
	reference: "SAV-001",
} as unknown as Produit;

function scannerAvecDouchette(code: string) {
	const champ = screen.getByPlaceholderText("Scannez ou saisissez un code…");
	fireEvent.change(champ, { target: { value: code } });
	fireEvent.keyDown(champ, { key: "Enter" });
	return champ;
}

beforeEach(() => {
	mutateAsync.mockReset();
});

describe("BarcodeScanInput", () => {
	it("ignore le double `Entrée` émis par la douchette pendant la résolution — la quantité ne doit pas doubler", async () => {
		let resoudreScan: (produit: Produit) => void = () => {};
		mutateAsync.mockImplementation(
			() =>
				new Promise<Produit>((resolve) => {
					resoudreScan = resolve;
				}),
		);
		const onResolu = vi.fn();
		render(<BarcodeScanInput onResolu={onResolu} />);

		const champ = scannerAvecDouchette("30123456");
		// La douchette émet parfois deux `Entrée` pour un seul passage —
		// la requête est encore en vol à l'arrivée du second.
		fireEvent.keyDown(champ, { key: "Enter" });

		expect(mutateAsync).toHaveBeenCalledTimes(1);
		resoudreScan(PRODUIT);
		await waitFor(() => expect(onResolu).toHaveBeenCalledTimes(1));
	});

	it("ignore une réémission arrivée juste après la résolution — un re-scan volontaire attend la fin de l'anti-rebond", async () => {
		mutateAsync.mockResolvedValue(PRODUIT);
		const onResolu = vi.fn();
		render(<BarcodeScanInput onResolu={onResolu} />);

		scannerAvecDouchette("30123456");
		await waitFor(() => expect(onResolu).toHaveBeenCalledTimes(1));

		scannerAvecDouchette("30123456");
		expect(mutateAsync).toHaveBeenCalledTimes(1);
	});

	it("résout deux codes différents scannés à la suite", async () => {
		mutateAsync.mockResolvedValue(PRODUIT);
		const onResolu = vi.fn();
		render(<BarcodeScanInput onResolu={onResolu} />);

		scannerAvecDouchette("30123456");
		await waitFor(() => expect(onResolu).toHaveBeenCalledTimes(1));
		scannerAvecDouchette("30123457");
		await waitFor(() => expect(onResolu).toHaveBeenCalledTimes(2));

		expect(mutateAsync).toHaveBeenCalledTimes(2);
	});
});
