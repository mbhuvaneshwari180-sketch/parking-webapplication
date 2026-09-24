/**
 * Stripe Payment Gateway abstraction.
 * Generates PaymentIntents with client_secret on server-side.
 */
export const stripeProvider = {
  name: 'STRIPE',

  async createOrder({ bookingId, amount, currency = 'usd' }) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Stripe secret key not configured. Set STRIPE_SECRET_KEY in .env.');
    }

    const params = new URLSearchParams();
    params.append('amount', Math.round(amount * 100).toString());
    params.append('currency', currency.toLowerCase());
    params.append('metadata[bookingId]', bookingId);
    params.append('payment_method_types[]', 'card');

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to create Stripe PaymentIntent');
    }

    const intent = await response.json();
    return {
      provider: 'STRIPE',
      orderId: intent.id,
      clientSecret: intent.client_secret,
      amount,
      currency,
    };
  },

  async verifyPayment({ orderId }) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Stripe secret key not configured.');
    }

    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve Stripe PaymentIntent');
    }

    const intent = await response.json();
    if (intent.status !== 'succeeded') {
      throw new Error(`Stripe payment not successful. Status: ${intent.status}`);
    }

    return {
      success: true,
      transactionId: intent.id,
      status: 'PAID',
    };
  },

  async refundPayment({ transactionId }) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const params = new URLSearchParams();
    params.append('payment_intent', transactionId);

    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Stripe refund failed');
    }

    const refund = await response.json();
    return {
      success: true,
      refundId: refund.id,
      status: 'REFUNDED',
    };
  },
};
