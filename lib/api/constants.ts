/**
 * Temporary API behavior constants.
 * Adjust these when connecting to a real backend.
 */
export const TEMP_API = {
  /** Minimum spinner duration for social login (ms) */
  socialLoginDelayMs: 3000,
  /** How long to show success message before redirect (ms) */
  socialLoginSuccessDisplayMs: 1500,
  /** Simulated forgot-password processing delay (ms) */
  forgotPasswordDelayMs: 1200,
} as const;
