import crypto from 'crypto';

/**
 * Mock Payment Gateway Provider for local testing & development.
 * Simulates gateway session creation and verification.
 */
export const mockPaymentProvider = {
  name: 'MOCK',

  async createOrder({ bookingId, amount, currency = 'USD' }) {
    const orderId = `mock_ord_${crypto.randomBytes(8).toString('hex')}`;
    return {
      provider: 'MOCK',
      orderId,
      amount,
      currency,
      status: 'CREATED',
      mockClientSecret: `mock_sec_${crypto.randomBytes(12).toString('hex')}`,
    };
  },

  async verifyPayment({ orderId, paymentId, signature }) {
    // In mock provider, all non-empty payments succeed unless explicitly forced to fail
    return {
      success: true,
      transactionId: paymentId || `mock_txn_${crypto.randomBytes(8).toString('hex')}`,
      status: 'PAID',
    };
  },

  async refundPayment({ transactionId, amount }) {
    return {
      success: true,
      refundId: `mock_ref_${crypto.randomBytes(8).toString('hex')}`,
      status: 'REFUNDED',
    };
  },
};
