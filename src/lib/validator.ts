export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// At least 8 chars, with a lowercase letter, an uppercase letter, a digit, and a special character
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

// Optional leading +, then 7-15 digits; spaces, dashes and parentheses are allowed
export const PHONE_REGEX = /^\+?(?:[\s\-()]*\d){7,15}[\s\-()]*$/;