const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function validateLoginInput(email: string, password: string): string | null {
  if (!email.trim() || !password.trim()) {
    return "Email and password are required.";
  }
  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validateRegisterInput(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null {
  if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
    return "All fields are required.";
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (!isValidEmail(email)) {
    return "Please enter a valid email address.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export function mapAuthError(error: unknown, fallback: string): string {
  if (error instanceof Error && "status" in error) {
    const apiError = error as Error & { status?: number; message: string };
    if (apiError.message) return apiError.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
