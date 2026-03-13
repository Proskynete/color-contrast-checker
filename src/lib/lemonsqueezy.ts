import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export function setupLemonSqueezy() {
  const apiKey = import.meta.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error('LEMONSQUEEZY_API_KEY environment variable is not set');
  lemonSqueezySetup({ apiKey });
}

export const PLAN_BY_VARIANT_ID: Record<string, 'pro' | 'teams'> = new Proxy(
  {} as Record<string, 'pro' | 'teams'>,
  {
    get(_target, prop: string) {
      const map: Record<string, 'pro' | 'teams'> = {
        [import.meta.env.PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID]: 'pro',
        [import.meta.env.PUBLIC_LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID]: 'pro',
        [import.meta.env.PUBLIC_LEMONSQUEEZY_TEAMS_MONTHLY_VARIANT_ID]: 'teams',
        [import.meta.env.PUBLIC_LEMONSQUEEZY_TEAMS_YEARLY_VARIANT_ID]: 'teams',
      };
      return map[prop];
    },
  },
);
