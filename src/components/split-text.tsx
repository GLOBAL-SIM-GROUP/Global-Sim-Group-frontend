import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import {
	type CSSProperties,
	type ElementType,
	useEffect,
	useRef,
	useState,
} from "react";

import { cn } from "#/lib/utils";

// ScrollTrigger exige un DOM réel (jsdom casse à l'enregistrement) — on
// tolère l'échec : le texte reste rendu normalement, sans animation.
try {
	gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);
} catch {
	/* environnement de test sans DOM complet */
}

type SplitTarget = { chars: string[]; words: string[]; lines: string[] };

interface SplitTextProps {
	/** Texte à animer (contenu brut — pas de nœuds imbriqués). */
	text: string;
	className?: string;
	/** Balise HTML rendue : h1, h2, p, span… */
	tag?: ElementType;
	/** Délai entre chaque lettre/mot, en ms. */
	delay?: number;
	/** Durée de l'animation de chaque élément, en s. */
	duration?: number;
	ease?: string;
	/** "chars" | "words" | "lines" | "words, chars" */
	splitType?: string;
	from?: Record<string, number>;
	to?: Record<string, number>;
	/** Seuil d'intersection déclenchant l'animation (0-1). */
	threshold?: number;
	rootMargin?: string;
	textAlign?: CSSProperties["textAlign"];
	onLetterAnimationComplete?: () => void;
}

/**
 * Adapté de React Bits — SplitText (GSAP SplitText + ScrollTrigger, via
 * `@gsap/react`). Le texte est découpé en caractères/mots animés à
 * l'entrée dans le viewport. GSAP SplitText gère l'accessibilité
 * (aria-label sur l'élément, découpes masquées aux lecteurs d'écran).
 */
export function SplitText({
	text,
	className = "",
	tag: Tag = "p",
	delay = 50,
	duration = 1.25,
	ease = "power3.out",
	splitType = "chars",
	from = { opacity: 0, y: 40 },
	to = { opacity: 1, y: 0 },
	threshold = 0.1,
	rootMargin = "-100px",
	textAlign = "center",
	onLetterAnimationComplete,
}: SplitTextProps) {
	const ref = useRef<HTMLElement>(null);
	const animationCompletedRef = useRef(false);
	const onCompleteRef = useRef(onLetterAnimationComplete);
	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		onCompleteRef.current = onLetterAnimationComplete;
	}, [onLetterAnimationComplete]);

	useEffect(() => {
		// `document.fonts` est absent sous jsdom — on anime sans attendre.
		if (typeof document === "undefined" || !document.fonts?.ready) {
			setFontsLoaded(true);
			return;
		}
		if (document.fonts.status === "loaded") {
			setFontsLoaded(true);
		} else {
			void document.fonts.ready.then(() => setFontsLoaded(true));
		}
	}, []);

	const fromJson = JSON.stringify(from);
	const toJson = JSON.stringify(to);

	useGSAP(
		() => {
			if (!ref.current || !text || !fontsLoaded) return;
			if (animationCompletedRef.current) return;
			const el = ref.current as HTMLElement & {
				_rbsplitInstance?: GSAPSplitText | null;
			};

			if (el._rbsplitInstance) {
				try {
					el._rbsplitInstance.revert();
				} catch {
					/* noop */
				}
				el._rbsplitInstance = null;
			}

			const startPct = (1 - threshold) * 100;
			const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
			const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0;
			const marginUnit = marginMatch?.[2] || "px";
			const sign =
				marginValue === 0
					? ""
					: marginValue < 0
						? `-=${Math.abs(marginValue)}${marginUnit}`
						: `+=${marginValue}${marginUnit}`;
			const start = `top ${startPct}%${sign}`;

			let splitInstance: GSAPSplitText | null = null;
			try {
				const assignTargets = (self: SplitTarget) => {
					let targets: string[] | undefined;
					if (splitType.includes("chars") && self.chars.length)
						targets = self.chars;
					if (!targets && splitType.includes("words") && self.words.length)
						targets = self.words;
					if (!targets && splitType.includes("lines") && self.lines.length)
						targets = self.lines;
					return targets ?? self.chars ?? self.words ?? self.lines;
				};

				splitInstance = new GSAPSplitText(el, {
					type: splitType,
					smartWrap: true,
					autoSplit: splitType === "lines",
					linesClass: "split-line",
					wordsClass: "split-word",
					charsClass: "split-char",
					reduceWhiteSpace: false,
					onSplit: (self) => {
						const tween = gsap.fromTo(
							assignTargets(self as unknown as SplitTarget),
							{ ...from },
							{
								...to,
								duration,
								ease,
								stagger: delay / 1000,
								scrollTrigger: {
									trigger: el,
									start,
									once: true,
									fastScrollEnd: true,
									anticipatePin: 0.4,
								},
								onComplete: () => {
									animationCompletedRef.current = true;
									onCompleteRef.current?.();
								},
								willChange: "transform, opacity",
								force3D: true,
							},
						);
						return tween;
					},
				});
			} catch {
				/* jsdom ou ScrollTrigger indisponible : texte rendu tel quel */
			}

			el._rbsplitInstance = splitInstance;

			return () => {
				for (const st of ScrollTrigger.getAll()) {
					if (st.trigger === el) st.kill();
				}
				try {
					splitInstance?.revert();
				} catch {
					/* noop */
				}
				el._rbsplitInstance = null;
			};
		},
		{
			dependencies: [
				text,
				delay,
				duration,
				ease,
				splitType,
				fromJson,
				toJson,
				threshold,
				rootMargin,
				fontsLoaded,
			],
			scope: ref,
		},
	);

	return (
		<Tag
			ref={ref}
			style={{
				textAlign,
				overflow: "hidden",
				display: "inline-block",
				whiteSpace: "normal",
				wordWrap: "break-word",
				willChange: "transform, opacity",
			}}
			className={cn("split-parent", className)}
		>
			{text}
		</Tag>
	);
}
