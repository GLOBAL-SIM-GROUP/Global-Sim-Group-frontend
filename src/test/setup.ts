import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest tourne sans `globals: true` : le cleanup automatique de
// @testing-library/react n'est pas enregistré. On le branche explicitement.
afterEach(() => {
	cleanup();
});
