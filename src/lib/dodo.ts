import DodoPayments from 'dodopayments';

const dodoClient = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
    environment: (process.env.NEXT_PUBLIC_DODO_ENVIRONMENT === 'live' || process.env.NEXT_PUBLIC_DODO_ENVIRONMENT === 'live_mode') ? 'live_mode' : 'test_mode',
});

export default dodoClient;
