export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

export function isValidAmount(value: number): boolean {
  return value > 0 && isFinite(value) && value <= 999_999_999_999;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 50;
}

export function isValidNote(note: string): boolean {
  return note.length <= 200;
}

export function isValidPhone(phone: string): boolean {
  return /^(\+62|62|0)[\d\s-]{8,13}$/.test(phone.trim());
}

export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
