import { getI18n } from "@/i18n";

/**
 * Initializes the lazy i18next singleton for the test environment.
 *
 * Components localized for Wave 2 use `useTranslation()` from react-i18next.
 * In tests components are rendered without an <I18nextProvider>, so
 * `useTranslation` falls back to the globally-registered instance that
 * `initReactI18next` sets during `getI18n()`'s synchronous `.init()` call.
 * Initializing it here makes `t()` resolve to the real English "en" resources
 * (the type source and test default), keeping existing English assertions valid.
 *
 * This must be imported (for its side effect) from the vitest setup files. It is
 * safe across the whole suite: initializing once is idempotent per module cache.
 */
void getI18n();
