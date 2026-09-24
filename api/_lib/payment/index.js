import { mockPaymentProvider } from './mock.js';
import { razorpayProvider } from './razorpay.js';
import { stripeProvider } from './stripe.js';

export function getPaymentProvider(requestedProvider) {
  const provider = (requestedProvider || process.env.PAYMENT_PROVIDER || 'MOCK').toUpperCase();

  switch (provider) {
    case 'RAZORPAY':
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        return razorpayProvider;
      }
      console.warn('Razorpay keys not configured; falling back to Mock Payment Provider.');
      return mockPaymentProvider;

    case 'STRIPE':
      if (process.env.STRIPE_SECRET_KEY) {
        return stripeProvider;
      }
      console.warn('Stripe secret key not configured; falling back to Mock Payment Provider.');
      return mockPaymentProvider;

    case 'MOCK':
    default:
      return mockPaymentProvider;
  }
}
