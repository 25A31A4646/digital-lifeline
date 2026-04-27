// Shared smart city name validator for Weather Risk + Disaster Detection
// Strict rules:
// 1. Only letters and spaces (no numbers, no symbols)
// 2. At least 3 characters long
// 3. Must contain at least one vowel (a, e, i, o, u)
// 4. Must not be a random keyboard pattern (qwerty rows, asdf rows, repeated chars)

const KEYBOARD_PATTERNS = [
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "qwerty",
  "asdfgh",
  "zxcvbn",
  "qazwsx",
  "wsxedc",
  "qweasd",
  "qwertz",
  "azerty",
];

const isKeyboardPattern = (s: string): boolean => {
  const lower = s.toLowerCase().replace(/\s+/g, "");
  if (lower.length < 3) return false;

  // All same character (e.g. "aaaa")
  if (/^(.)\1+$/.test(lower)) return true;

  // Substring of a known keyboard row (forward or reverse), length >= 4
  for (const pattern of KEYBOARD_PATTERNS) {
    const reversed = pattern.split("").reverse().join("");
    for (let len = Math.min(lower.length, pattern.length); len >= 4; len--) {
      for (let i = 0; i + len <= lower.length; i++) {
        const chunk = lower.slice(i, i + len);
        if (pattern.includes(chunk) || reversed.includes(chunk)) return true;
      }
    }
  }

  return false;
};

export const isValidCity = (raw: string): boolean => {
  const value = (raw ?? "").trim();

  // Rule 2: at least 3 characters
  if (value.length < 3) return false;

  // Rule 1: only letters and spaces
  if (!/^[A-Za-z\s]+$/.test(value)) return false;

  // No leading/trailing/double spaces messing with word structure
  const collapsed = value.replace(/\s+/g, " ");
  if (collapsed.replace(/\s/g, "").length < 3) return false;

  // Rule 3: must contain at least one vowel
  if (!/[aeiouAEIOU]/.test(value)) return false;

  // Rule 4: must not be a random keyboard pattern
  if (isKeyboardPattern(value)) return false;

  return true;
};

export const CITY_ERROR = "Invalid city name. Please enter a valid real city.";
