import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import type { Locale } from "#/core/i18n";
import { isSupportedLocale, SUPPORTED_LOCALES, useLocale } from "#/core/i18n";

const LOCALE_LABELS: Record<Locale, string> = {
	fr: "Français",
	en: "English",
};

/**
 * Sélecteur de langue explicite (aucune détection automatique du navigateur).
 * `useLocale().setLocale` change la locale Paraglide, la persiste dans
 * `sim.locale` et synchronise `<html lang>`.
 */
export function LanguageSelector() {
	const { locale, setLocale } = useLocale();

	return (
		<Select
			value={locale}
			onValueChange={(value) => {
				if (isSupportedLocale(value)) setLocale(value);
			}}
		>
			<SelectTrigger size="sm" aria-label="Langue">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{SUPPORTED_LOCALES.map((lang) => (
					<SelectItem key={lang} value={lang}>
						{LOCALE_LABELS[lang]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
