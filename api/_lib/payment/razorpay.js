import crypto from 'crypto';

/**
 * Razorpay Payment Gateway integration.
 * Securely handles order generation and server-side HMAC signature verification.
 */
export const razorpayProvider = {
  name: 'RAZORPAY',

  async createOrder({ bookingId, amount, currency = 'INR' }) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured. Please use MOCK provider or configure keys in .env.');
    }

    // Amount in Razorpay is in smallest currency unit (e.g. paise)
    const amountInSmallestUnit = Math.round(amount * 100);

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInSmallestUnit,
        currency,
        receipt: `rcpt_${bookingId.slice(0, 15)}`,
        notes: { bookingId },
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.description || 'Failed to create Razorpay order');
    }

    const orderData = await response.json();
    return {
      provider: 'RAZORPAY',
      orderId: orderData.id,
      amount,
      currency,
      keyId, // Only public key ID is exposed to frontend checkout modal
    };
  },

  async verifyPayment({ orderId, paymentId, signature }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay secret not configured.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = expectedSignature === signature;
    if (!isValid) {
      throw new Error('Razorpay payment signature mismatch');
    }

    return {
      success: true,
      transactionId: paymentId,
      status: 'PAID',
    };
  },

  async refundPayment({ transactionId, amount }) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch(`https://api.razorpay.com/v1/payments/${transactionId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount ? Math.round(amount * 100) : undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.description || 'Razorpay refund failed');
    }

    const refund = await response.json();
    return {
      success: true,
      refundId: refund.id,
      status: 'REFUNDED',
    };
  },
};
