/**
 * L'API Shape Detection (`BarcodeDetector`) n'est pas encore dans la lib dom
 * de TypeScript — déclaration minimale limitée à la surface utilisée par
 * `camera-scan-dialog.tsx` (décode 1D/2D depuis un flux vidéo).
 * Support navigateur : Chrome/Edge/Android WebView — absent de Firefox/Safari,
 * d'où le test de présence avant usage.
 */
interface DetectedBarcode {
	rawValue: string;
	format: string;
	boundingBox: DOMRectReadOnly;
	cornerPoints: ReadonlyArray<{ x: number; y: number }>;
}

interface BarcodeDetectorOptions {
	formats?: string[];
}

declare class BarcodeDetector {
	constructor(options?: BarcodeDetectorOptions);
	detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
	static getSupportedFormats(): Promise<string[]>;
}

interface Window {
	BarcodeDetector?: typeof BarcodeDetector;
}
