
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Additional length bonus
  if (password.length >= 12) {
    score += 1;
  }

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 3) {
    strength = 'fair';
  } else if (score <= 4) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

export function getStrengthColor(strength: string): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500';
    case 'fair':
      return 'text-orange-500';
    case 'good':
      return 'text-yellow-500';
    case 'strong':
      return 'text-green-500';
    default:
      return 'text-muted-foreground';
  }
}

export function getStrengthProgress(strength: string): number {
  switch (strength) {
    case 'weak':
      return 25;
    case 'fair':
      return 50;
    case 'good':
      return 75;
    case 'strong':
      return 100;
    default:
      return 0;
  }
}
