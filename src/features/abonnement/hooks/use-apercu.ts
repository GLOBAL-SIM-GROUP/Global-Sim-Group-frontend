import { useEffect, useRef, useState } from "react";

export interface ApercuDebounced<T> {
	/** Dernier aperçu reçu pour la requête `request` courante (null sinon). */
	data: T | null;
	pending: boolean;
	error: boolean;
}

/**
 * Appel débouncé (~300 ms) d'un endpoint d'aperçu `POST …/apercu-abonnement`
 * — lecture seule, relancé à chaque changement de lignes/client. Pas de
 * TanStack Query : c'est un POST de simulation, pas du cache serveur. Les
 * réponses arrivées hors d'ordre (requête obsolète plus lente) sont
 * ignorées via un compteur de génération.
 *
 * `request === null` désactive l'appel (ex. aucun client sélectionné, lignes
 * incomplètes) et efface l'aperçu affiché.
 */
export function useApercuDebounced<TReq, TRes>(
	fetcher: (request: TReq) => Promise<TRes>,
	request: TReq | null,
	delay = 300,
): ApercuDebounced<TRes> {
	const [data, setData] = useState<TRes | null>(null);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState(false);
	const fetcherRef = useRef(fetcher);
	fetcherRef.current = fetcher;
	const generationRef = useRef(0);
	// Sérialisé pour comparer le contenu (la requête est reconstruite à
	// chaque render du formulaire parent).
	const cle = request === null ? null : JSON.stringify(request);

	useEffect(() => {
		if (cle === null) {
			setData(null);
			setPending(false);
			setError(false);
			return;
		}
		const courante = ++generationRef.current;
		setPending(true);
		const timer = setTimeout(() => {
			fetcherRef
				.current(JSON.parse(cle) as TReq)
				.then((res) => {
					if (generationRef.current === courante) {
						setData(res);
						setError(false);
					}
				})
				.catch(() => {
					if (generationRef.current === courante) {
						setError(true);
					}
				})
				.finally(() => {
					if (generationRef.current === courante) {
						setPending(false);
					}
				});
		}, delay);
		return () => clearTimeout(timer);
		// `cle` capture le contenu ; `request` n'est pas une dépendance stable.
	}, [cle, delay]);

	return { data, pending, error };
}
