import { randomBytes } from 'crypto';
import { discountCodes, orders } from '../store';
import { DiscountCode } from '../models/discount';
import { AppError } from '../utils/errors';
import { NTH_ORDER_DISCOUNT, DISCOUNT_PERCENT } from '../constants';

function makeCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

export function generateCode(): DiscountCode {
  const code = makeCode();
  const entry: DiscountCode = { code, percent: DISCOUNT_PERCENT, used: false };
  discountCodes.set(code, entry);
  return entry;
}

export function validateCode(code: string): DiscountCode {
  const entry = discountCodes.get(code);
  if (!entry) {
    throw new AppError(400, `discount code "${code}" does not exist`);
  }
  if (entry.used) {
    throw new AppError(400, `discount code "${code}" has already been used`);
  }
  return entry;
}

export function redeemCode(code: string): void {
  const entry = discountCodes.get(code);
  if (entry) {
    entry.used = true;
  }
}

// Returns a new code if orders.length is now a multiple of NTH_ORDER_DISCOUNT, otherwise null.
export function maybeGenerateCode(): DiscountCode | null {
  if (orders.length > 0 && orders.length % NTH_ORDER_DISCOUNT === 0) {
    return generateCode();
  }
  return null;
}
