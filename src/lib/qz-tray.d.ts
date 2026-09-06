/**
 * Le paquet `qz-tray` (npm) ne fournit aucun typage — déclaration minimale,
 * limitée à la surface réellement utilisée par `qz-tray-client.ts` (vérifiée
 * contre `node_modules/qz-tray/qz-tray.js`, aucune méthode inventée).
 */
declare module "qz-tray" {
	type QZResolve = (valeur?: string) => void;
	type QZReject = (raison?: unknown) => void;

	interface QZWebSocketConnectOptions {
		host?: string | string[];
		port?: { secure?: number[]; insecure?: number[] };
		usingSecure?: boolean;
		keepAlive?: number;
		retries?: number;
		delay?: number;
	}

	interface QZPrintConfigOptions {
		copies?: number;
		margins?:
			| number
			| { top?: number; right?: number; bottom?: number; left?: number };
		orientation?: "portrait" | "landscape" | "reverse-landscape" | null;
		rotation?: number;
		scaleContent?: boolean;
		size?: { width?: number | null; height?: number | null } | null;
		units?: "in" | "cm" | "mm";
	}

	interface QZPrintData {
		type?: "pixel" | "raw";
		format?: "html" | "image" | "pdf" | "command";
		data: string;
		options?: { pageWidth?: number; pageHeight?: number };
	}

	/** Config opaque créée par `qz.configs.create` — jamais introspectée côté appelant. */
	type QZConfig = unknown;

	const qz: {
		websocket: {
			connect(options?: QZWebSocketConnectOptions): Promise<void>;
			disconnect(): Promise<void>;
			isActive(): boolean;
		};
		security: {
			setCertificatePromise(
				promiseHandler: (resolve: QZResolve, reject: QZReject) => void,
			): void;
			setSignaturePromise(
				promiseFactory: (
					aSigner: string,
				) => (resolve: QZResolve, reject: QZReject) => void,
			): void;
		};
		printers: {
			find(query?: string): Promise<string[] | string>;
			getDefault(): Promise<string>;
		};
		configs: {
			create(printer: string, options?: QZPrintConfigOptions): QZConfig;
		};
		print(configs: QZConfig | QZConfig[], data: QZPrintData[]): Promise<void>;
	};

	export default qz;
}
