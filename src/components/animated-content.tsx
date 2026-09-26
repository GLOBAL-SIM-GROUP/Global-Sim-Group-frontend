import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type HTMLAttributes, type ReactNode, useEffect, useRef } from "react";

try {
	gsap.registerPlugin(ScrollTrigger);
} catch {
	/* environnement de test sans DOM complet */
}

interface AnimatedContentProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	/** Conteneur de scroll pour ScrollTrigger (sélecteur ou élément). */
	container?: string | HTMLElement | null;
	/** Distance de déplacement en px. */
	distance?: number;
	direction?: "vertical" | "horizontal";
	reverse?: boolean;
	duration?: number;
	ease?: string;
	initialOpacity?: number;
	animateOpacity?: boolean;
	scale?: number;
	/** Seuil d'intersection déclenchant l'animation (0-1). */
	threshold?: number;
	delay?: number;
	onComplete?: () => void;
	disappearAfter?: number;
	disappearDuration?: number;
	disappearEase?: string;
	onDisappearanceComplete?: () => void;
	className?: string;
}

/**
 * Adapté de React Bits — AnimatedContent (GSAP + ScrollTrigger). Révèle
 * le contenu à l'entrée dans le viewport (translation + fondu), rejouée à
 * chaque entrée en descendant ; à la remontée le contenu reste affiché
 * sans animation. Sans DOM réel (tests), le contenu reste affiché tel quel.
 */
export function AnimatedContent({
	children,
	container,
	distance = 100,
	direction = "vertical",
	reverse = false,
	duration = 0.8,
	ease = "power3.out",
	initialOpacity = 0,
	animateOpacity = true,
	scale = 1,
	threshold = 0.1,
	delay = 0,
	disappearAfter = 0,
	disappearDuration = 0.5,
	disappearEase = "power3.in",
	onComplete,
	onDisappearanceComplete,
	className = "",
	style,
	...props
}: AnimatedContentProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const trigger = triggerRef.current;
		const el = innerRef.current;
		if (!trigger || !el) return;

		try {
			const scrollerTarget =
				(typeof container === "string"
					? document.querySelector<HTMLElement>(container)
					: container) ?? document.getElementById("snap-main-container");

			const axis = direction === "horizontal" ? "x" : "y";
			const offset = reverse ? -distance : distance;
			const startPct = (1 - threshold) * 100;

			// La translation est appliquée au div interne — jamais au trigger :
			// animer le déclencheur déplacerait sa boîte mesurée par ScrollTrigger
			// et referait franchir la limite (rebonds « monte-descend »).
			gsap.set(el, {
				[axis]: offset,
				scale,
				opacity: animateOpacity ? initialOpacity : 1,
				visibility: "visible",
			});

			const tl = gsap.timeline({
				paused: true,
				delay,
				onComplete: () => {
					onComplete?.();
					if (disappearAfter > 0) {
						gsap.to(el, {
							[axis]: reverse ? distance : -distance,
							scale: 0.8,
							opacity: animateOpacity ? initialOpacity : 0,
							delay: disappearAfter,
							duration: disappearDuration,
							ease: disappearEase,
							onComplete: () => onDisappearanceComplete?.(),
						});
					}
				},
			});

			tl.to(el, { [axis]: 0, scale: 1, opacity: 1, duration, ease });

			// Le replay n'est armé qu'après une sortie COMPLÈTE par le bas du
			// viewport : un va-et-vient autour de la limite de déclenchement
			// (inertie tactile/trackpad) laisse l'élément visible et ne doit
			// pas le faire sauter de `distance` px puis remonter.
			let canReplay = true;
			const st = ScrollTrigger.create({
				trigger,
				scroller: scrollerTarget,
				start: `top ${startPct}%`,
				end: `bottom 0%`,
				onEnter: () => {
					if (canReplay && !tl.isActive()) {
						tl.restart();
						canReplay = false;
					}
				},
				onEnterBack: () => tl.progress(1),
				onLeaveBack: () => tl.progress(1),
			});

			const stVisibility = ScrollTrigger.create({
				trigger,
				scroller: scrollerTarget,
				start: "top bottom",
				end: "bottom top",
				onLeaveBack: () => {
					canReplay = true;
				},
			});

			return () => {
				st.kill();
				stVisibility.kill();
				tl.kill();
			};
		} catch {
			// jsdom : pas de ScrollTrigger — on affiche le contenu directement.
			el.style.visibility = "visible";
			return undefined;
		}
	}, [
		container,
		distance,
		direction,
		reverse,
		duration,
		ease,
		initialOpacity,
		animateOpacity,
		scale,
		threshold,
		delay,
		disappearAfter,
		disappearDuration,
		disappearEase,
		onComplete,
		onDisappearanceComplete,
	]);

	return (
		<div ref={triggerRef} className={className} style={style} {...props}>
			<div ref={innerRef} style={{ visibility: "hidden" }}>
				{children}
			</div>
		</div>
	);
}
