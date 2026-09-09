/**
 * Primary label for the navbar account control — avoids raw placeholder JWT/user
 * IDs in the UI. In the fallback case it returns the i18n key
 * `auth:account.fallbackName`, which callers translate via `t()`.
 */
export const ACCOUNT_FALLBACK_KEY = "auth:account.fallbackName";

export function navAccountDisplayName(userEmail: string | null, userId: string | null): string {
  const email = userEmail?.trim();
  if (email) {
    return email;
  }
  const id = userId?.trim();
  if (!id) {
    return ACCOUNT_FALLBACK_KEY;
  }
  if (/^default[_\s-]?user[_\s-]?id$/i.test(id)) {
    return ACCOUNT_FALLBACK_KEY;
  }
  return id;
}

/** Translate `navAccountDisplayName`'s output if it is the fallback key, otherwise return as-is. */
export function localizedAccountDisplayName(displayName: string, t: (key: string) => string): string {
  return displayName === ACCOUNT_FALLBACK_KEY ? t(ACCOUNT_FALLBACK_KEY) : displayName;
}
