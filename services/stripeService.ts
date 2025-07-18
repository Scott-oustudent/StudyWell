// This is a MOCK service to simulate backend Stripe calls.
// In a real application, these would be API calls to your server,
// which would then securely interact with the Stripe API using your secret key.

const MOCK_PREMIUM_PRICE = 999; // in cents, so $9.99
const MOCK_CURRENCY = 'usd';

// Assume these are loaded from environment variables on the server
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_mock';


/**
 * Simulates creating a Stripe Payment Intent on the server.
 * @param customerId The Stripe Customer ID.
 * @returns A mock Payment Intent object with a client_secret.
 */
export const createPaymentIntent = async (
  customerId?: string
): Promise<{ client_secret: string; error?: string }> => {
  console.log(`[Mock Stripe Service] Creating Payment Intent for customer: ${customerId}`);
  
  // Simulate a network delay
  await new Promise(res => setTimeout(res, 500));
  
  // In a real backend, you would use the Stripe Node.js library:
  // const stripe = new Stripe(STRIPE_SECRET_KEY);
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: MOCK_PREMIUM_PRICE,
  //   currency: MOCK_CURRENCY,
  //   customer: customerId,
  //   automatic_payment_methods: { enabled: true },
  // });
  // return { client_secret: paymentIntent.client_secret };

  // For the demo, we'll return a mock client_secret
  const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
  
  return { client_secret: mockClientSecret };
};

/**
 * Simulates creating a Stripe Customer object on the server.
 * @returns A mock customer object with an ID.
 */
export const createCustomer = async (
  email: string,
  name: string
): Promise<{ customerId: string; error?: string }> => {
  console.log(`[Mock Stripe Service] Creating Customer for: ${name} <${email}>`);

  // Simulate a network delay
  await new Promise(res => setTimeout(res, 600));

  // In a real backend:
  // const customer = await stripe.customers.create({
  //   email: email,
  //   name: name,
  // });
  // return { customerId: customer.id };

  const mockCustomerId = `cus_${Date.now()}${Math.random().toString(36).substring(7)}`;

  console.log(`[Mock Stripe Service] Created customer with ID: ${mockCustomerId}`);
  return { customerId: mockCustomerId };
};

/**
 * Simulates taking a manual payment on the server for a subscription.
 * @param customerId The Stripe Customer ID for the user being charged.
 * @returns A mock success response.
 */
export const takeManualPayment = async (
  customerId?: string
): Promise<{ success: boolean; error?: string }> => {
    if (!customerId) {
        return { success: false, error: "User does not have a payment customer ID." };
    }
    
    console.log(`[Mock Stripe Service] Taking manual payment for customer: ${customerId}`);

    // Simulate network delay
    await new Promise(res => setTimeout(res, 800));

    // In a real backend, you would create a charge or payment intent and confirm it.
    // e.g., await stripe.paymentIntents.create({
    //   amount: MOCK_PREMIUM_PRICE,
    //   currency: MOCK_CURRENCY,
    //   customer: customerId,
    //   payment_method: 'pm_card_visa', // A saved payment method
    //   off_session: true,
    //   confirm: true,
    // });

    console.log(`[Mock Stripe Service] Successfully processed manual payment for ${customerId}.`);
    return { success: true };
};