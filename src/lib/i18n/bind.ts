/** Synced with `LanguageProvider` so imperative `t(key)` matches persisted locale. */

export type Language = 'en' | 'hi';

let current: Language = 'en';

export function setAppLanguage(lang: Language): void {
  current = lang;
}

export function getAppLanguage(): Language {
  return current;
}
