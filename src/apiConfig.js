const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://dev.vismaad.com/estore/wp-json/',
  CONSUMER_KEY: import.meta.env.VITE_CONSUMER_KEY || 'ck_2e385c7db77c3e2afab7ac9df70378c7a29e4df1',
  CONSUMER_SECRET: import.meta.env.VITE_CONSUMER_SECRET || 'cs_e1992fe48b1f17ac2cc19da72cb0b121d77a6905',
  PAYPAL: {
    MODE: 'sandbox', // 'sandbox' or 'live'
    SANDBOX_CLIENT_ID: 'AZzExyhq-eICwsC6o76W0W9FkdITIKJ2oZBtaaKuZcocKE6TtZz4MrXLDmsQgioMoeXtvcfuvrKF2GYo', // Replace with real ID
    LIVE_CLIENT_ID: '',
    CURRENCY: 'USD'
  }
};

export default API_CONFIG;
