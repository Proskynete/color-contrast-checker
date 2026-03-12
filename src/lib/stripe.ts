import Stripe from 'stripe';

export function getStripe(): Stripe {
  const key = import.meta.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export function getPlanByPriceId(): Record<string, 'pro' | 'teams'> {
  return {
    [import.meta.env.PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID]: 'pro',
    [import.meta.env.PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID]: 'pro',
    [import.meta.env.PUBLIC_STRIPE_TEAMS_MONTHLY_PRICE_ID]: 'teams',
  };
}

export const PLAN_BY_PRICE_ID: Record<string, 'pro' | 'teams'> = new Proxy(
  {} as Record<string, 'pro' | 'teams'>,
  {
    get(_target, prop) {
      return getPlanByPriceId()[prop as string];
    },
  },
);
