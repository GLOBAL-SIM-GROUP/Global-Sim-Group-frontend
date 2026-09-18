import {
	type CSSProperties,
	type PointerEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
} from "react";

import { cn } from "#/lib/utils";

import "./border-glow.css";

/**
 * Adapté de React Bits — BorderGlow (variante JS). Carte dont la bordure
 * s'illumine et suit le curseur près des bords (dégradé « mesh » + halo).
 * `backgroundColor` accepte `var(--card)` pour suivre le thème ; un hex
 * sombre pose la classe `border-glow-card--dark` (halos additifs).
 */
interface BorderGlowProps {
	children?: ReactNode;
	className?: string;
	/** Proximité du bord requise pour allumer le glow (0-100). */
	edgeSensitivity?: number;
	/** Teinte du halo, en valeurs HSL "H S L" (ex. "40 80 80"). */
	glowColor?: string;
	/** Fond de la carte — hex ou `var(--card)` pour suivre le thème. */
	backgroundColor?: string;
	borderRadius?: number;
	/** Portée du halo extérieur, en px. */
	glowRadius?: number;
	/** Opacité du glow (0.1-3.0). */
	glowIntensity?: number;
	/** Largeur du cône directionnel en % (5-45). */
	coneSpread?: number;
	/** Balayage lumineux d'intro au montage. */
	animated?: boolean;
	/** 3 couleurs hex du dégradé de bordure. */
	colors?: string[];
}

function parseHSL(hslStr: string) {
	const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
	if (!match) return { h: 40, s: 80, l: 80 };
	return {
		h: Number.parseFloat(match[1]),
		s: Number.parseFloat(match[2]),
		l: Number.parseFloat(match[3]),
	};
}

function buildGlowVars(glowColor: string, intensity: number) {
	const { h, s, l } = parseHSL(glowColor);
	const base = `${h}deg ${s}% ${l}%`;
	const opacities = [100, 60, 50, 40, 30, 20, 10];
	const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
	const vars: Record<string, string> = {};
	for (let i = 0; i < opacities.length; i++) {
		vars[`--glow-color${keys[i]}`] =
			`hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
	}
	return vars;
}

const GRADIENT_POSITIONS = [
	"80% 55%",
	"69% 34%",
	"8% 6%",
	"41% 38%",
	"86% 85%",
	"82% 18%",
	"51% 4%",
];
const GRADIENT_KEYS = [
	"--gradient-one",
	"--gradient-two",
	"--gradient-three",
	"--gradient-four",
	"--gradient-five",
	"--gradient-six",
	"--gradient-seven",
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]) {
	const vars: Record<string, string> = {};
	for (let i = 0; i < 7; i++) {
		const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
		vars[GRADIENT_KEYS[i]] =
			`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
	}
	vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`;
	return vars;
}

function isLightColor(color: string) {
	const value = color.trim().replace("#", "");
	if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
	const hex =
		value.length === 3
			? value
					.split("")
					.map((char) => char + char)
					.join("")
			: value;
	const red = Number.parseInt(hex.slice(0, 2), 16);
	const green = Number.parseInt(hex.slice(2, 4), 16);
	const blue = Number.parseInt(hex.slice(4, 6), 16);
	return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180;
}

const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;
const easeInCubic = (x: number) => x * x * x;

function animateValue({
	start = 0,
	end = 100,
	duration = 1000,
	delay = 0,
	ease = easeOutCubic,
	onUpdate,
	onEnd,
}: {
	start?: number;
	end?: number;
	duration?: number;
	delay?: number;
	ease?: (t: number) => number;
	onUpdate: (v: number) => void;
	onEnd?: () => void;
}) {
	const t0 = performance.now() + delay;
	function tick() {
		const elapsed = performance.now() - t0;
		const t = Math.min(elapsed / duration, 1);
		onUpdate(start + (end - start) * ease(t));
		if (t < 1) requestAnimationFrame(tick);
		else if (onEnd) onEnd();
	}
	setTimeout(() => requestAnimationFrame(tick), delay);
}

export function BorderGlow({
	children,
	className = "",
	edgeSensitivity = 30,
	glowColor = "40 80 80",
	backgroundColor = "var(--card)",
	borderRadius = 28,
	glowRadius = 40,
	glowIntensity = 1.0,
	coneSpread = 25,
	animated = false,
	colors = ["#c084fc", "#f472b6", "#38bdf8"],
}: BorderGlowProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	const getCenterOfElement = useCallback((el: HTMLDivElement) => {
		const { width, height } = el.getBoundingClientRect();
		return [width / 2, height / 2];
	}, []);

	const getEdgeProximity = useCallback(
		(el: HTMLDivElement, x: number, y: number) => {
			const [cx, cy] = getCenterOfElement(el);
			const dx = x - cx;
			const dy = y - cy;
			let kx = Number.POSITIVE_INFINITY;
			let ky = Number.POSITIVE_INFINITY;
			if (dx !== 0) kx = cx / Math.abs(dx);
			if (dy !== 0) ky = cy / Math.abs(dy);
			return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
		},
		[getCenterOfElement],
	);

	const getCursorAngle = useCallback(
		(el: HTMLDivElement, x: number, y: number) => {
			const [cx, cy] = getCenterOfElement(el);
			const dx = x - cx;
			const dy = y - cy;
			if (dx === 0 && dy === 0) return 0;
			const radians = Math.atan2(dy, dx);
			let degrees = radians * (180 / Math.PI) + 90;
			if (degrees < 0) degrees += 360;
			return degrees;
		},
		[getCenterOfElement],
	);

	const handlePointerMove = useCallback(
		(e: PointerEvent<HTMLDivElement>) => {
			const card = cardRef.current;
			if (!card) return;

			const rect = card.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const edge = getEdgeProximity(card, x, y);
			const angle = getCursorAngle(card, x, y);

			card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
			card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
		},
		[getEdgeProximity, getCursorAngle],
	);

	useEffect(() => {
		const card = cardRef.current;
		if (!animated || !card) return;
		if (
			typeof window.matchMedia === "function" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}
		const angleStart = 110;
		const angleEnd = 465;
		card.classList.add("sweep-active");
		card.style.setProperty("--cursor-angle", `${angleStart}deg`);

		animateValue({
			duration: 500,
			onUpdate: (v) => card.style.setProperty("--edge-proximity", `${v}`),
		});
		animateValue({
			ease: easeInCubic,
			duration: 1500,
			end: 50,
			onUpdate: (v) => {
				card.style.setProperty(
					"--cursor-angle",
					`${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
				);
			},
		});
		animateValue({
			ease: easeOutCubic,
			delay: 1500,
			duration: 2250,
			start: 50,
			end: 100,
			onUpdate: (v) => {
				card.style.setProperty(
					"--cursor-angle",
					`${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
				);
			},
		});
		animateValue({
			ease: easeInCubic,
			delay: 2500,
			duration: 1500,
			start: 100,
			end: 0,
			onUpdate: (v) => card.style.setProperty("--edge-proximity", `${v}`),
			onEnd: () => card.classList.remove("sweep-active"),
		});
	}, [animated]);

	const glowVars = buildGlowVars(glowColor, glowIntensity);
	// Un hex sombre explicite → halos additifs ; `var(--card)` suit `.dark` via le CSS.
	const darkSurface =
		backgroundColor.trim().startsWith("#") && !isLightColor(backgroundColor);

	return (
		<div
			ref={cardRef}
			onPointerMove={handlePointerMove}
			className={cn(
				"border-glow-card",
				darkSurface && "border-glow-card--dark",
				className,
			)}
			style={
				{
					"--card-bg": backgroundColor,
					"--edge-sensitivity": edgeSensitivity,
					"--border-radius": `${borderRadius}px`,
					"--glow-padding": `${glowRadius}px`,
					"--cone-spread": coneSpread,
					...glowVars,
					...buildGradientVars(colors),
				} as CSSProperties
			}
		>
			<span className="edge-light" />
			<div className="border-glow-inner">{children}</div>
		</div>
	);
}
