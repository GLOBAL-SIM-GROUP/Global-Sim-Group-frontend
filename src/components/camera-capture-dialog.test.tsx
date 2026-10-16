import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	CameraCaptureDialog,
	detecterAppareilTactile,
} from "./camera-capture-dialog";

function mockCamera() {
	const fakeStream = {
		getTracks: () => [{ stop: vi.fn() }],
	} as unknown as MediaStream;
	const getUserMedia = vi.fn().mockResolvedValue(fakeStream);
	Object.defineProperty(navigator, "mediaDevices", {
		value: { getUserMedia },
		configurable: true,
	});
	// jsdom : <video>.play() n'existe pas — on le stubbe
	HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
	return getUserMedia;
}

function mockPointerCoarse(matches: boolean) {
	Object.defineProperty(window, "matchMedia", {
		value: vi.fn().mockReturnValue({ matches }),
		configurable: true,
	});
}

const PROPS = {
	open: true,
	onOpenChange: vi.fn(),
	onCapture: vi.fn(),
};

afterEach(() => {
	delete (navigator as { mediaDevices?: unknown }).mediaDevices;
	delete (window as { matchMedia?: unknown }).matchMedia;
});

describe("detecterAppareilTactile", () => {
	it("renvoie false sur un poste de travail classique (jsdom)", () => {
		expect(detecterAppareilTactile()).toBe(false);
	});

	it("renvoie true quand le pointeur est « coarse » (tactile)", () => {
		mockPointerCoarse(true);
		expect(detecterAppareilTactile()).toBe(true);
	});
});

describe("CameraCaptureDialog — bascule de caméra", () => {
	it("n'affiche pas le bouton retourner sur PC", async () => {
		mockCamera();
		mockPointerCoarse(false);
		render(<CameraCaptureDialog {...PROPS} />);

		await screen.findByRole("button", { name: /Capturer/i });
		expect(
			screen.queryByRole("button", { name: "Retourner la caméra" }),
		).not.toBeInTheDocument();
	});

	it("bascule avant → arrière sur téléphone et redemande le flux", async () => {
		const getUserMedia = mockCamera();
		mockPointerCoarse(true);
		const user = userEvent.setup();
		render(<CameraCaptureDialog {...PROPS} facingMode="user" />);

		await screen.findByRole("button", { name: /Capturer/i });
		expect(getUserMedia).toHaveBeenLastCalledWith(
			expect.objectContaining({
				video: expect.objectContaining({ facingMode: "user" }),
			}),
		);

		await user.click(
			screen.getByRole("button", { name: "Retourner la caméra" }),
		);

		expect(getUserMedia).toHaveBeenLastCalledWith(
			expect.objectContaining({
				video: expect.objectContaining({ facingMode: "environment" }),
			}),
		);
	});
});
