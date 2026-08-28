export type PeriodeFiltre =
	| "aujourd_hui"
	| "hier"
	| "cette_semaine"
	| "ce_mois"
	| "mois_precedent"
	| "annee"
	| "personnalisee";

export interface PeriodeDates {
	du: string;
	au: string;
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getPeriodeDates(
	periode: PeriodeFiltre,
	customDu?: string,
	customAu?: string,
): PeriodeDates {
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth();

	switch (periode) {
		case "aujourd_hui":
			return {
				du: formatDate(today),
				au: formatDate(today),
			};

		case "hier": {
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			return {
				du: formatDate(yesterday),
				au: formatDate(yesterday),
			};
		}

		case "cette_semaine": {
			const startOfWeek = new Date(today);
			startOfWeek.setDate(today.getDate() - today.getDay());
			return {
				du: formatDate(startOfWeek),
				au: formatDate(today),
			};
		}

		case "ce_mois":
			return {
				du: `${year}-${String(month + 1).padStart(2, "0")}-01`,
				au: formatDate(today),
			};

		case "mois_precedent": {
			const prevMonth = month === 0 ? 11 : month - 1;
			const prevYear = month === 0 ? year - 1 : year;
			const lastDayPrevMonth = new Date(prevYear, prevMonth + 1, 0);
			return {
				du: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-01`,
				au: formatDate(lastDayPrevMonth),
			};
		}

		case "annee":
			return {
				du: `${year}-01-01`,
				au: formatDate(today),
			};

		case "personnalisee":
			return {
				du: customDu || formatDate(today),
				au: customAu || formatDate(today),
			};

		default:
			return {
				du: formatDate(today),
				au: formatDate(today),
			};
	}
}
