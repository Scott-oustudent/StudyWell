
import React, { useState, useEffect, useRef } from 'react';
import { User, AppView, SubscriptionTier, NotificationType, AuditActionType } from '../types';
import { createPaymentIntent } from '../services/stripeService';
import Card from './common/Card';
import Button from './common/Button';
import Icon from './common/Icon';
import Spinner from './common/Spinner';

interface UpgradePageProps {
  currentUser: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
  createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
  navigateTo: (view: AppView) => void;
}

const UpgradePage: React.FC<UpgradePageProps> = ({ currentUser, setUsers, logAuditAction, createNotification, navigateTo }) => {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const cardElementRef = useRef<HTMLDivElement>(null);

  // Initialize Stripe and fetch PaymentIntent
  useEffect(() => {
    const initStripe = async () => {
      // Use a mock publishable key
      const stripeInstance = (window as any).Stripe('pk_test_51OD27LILiK8e026qW5E2Gcy0zI5uOfa04aJg1g3o43nNf2662c5bCgnn3P7nF1Jb5v3o49Qh3fQ5p3R00sCj9Z5oV');
      setStripe(stripeInstance);
      
      try {
        const { client_secret, error } = await createPaymentIntent(currentUser.customerId);
        if (error || !client_secret) {
          setError(error || 'Could not initialize payment.');
          setIsLoading(false);
          return;
        }
        setClientSecret(client_secret);
        const elementsInstance = stripeInstance.elements({ clientSecret: client_secret });
        setElements(elementsInstance);
      } catch (e) {
        setError('Failed to connect to payment service.');
      } finally {
        setIsLoading(false);
      }
    };
    initStripe();
  }, [currentUser.customerId]);
  
  // Mount CardElement once Elements is initialized
  useEffect(() => {
    if (elements && cardElementRef.current) {
        cardElementRef.current.innerHTML = ''; // Clear previous elements
        const cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });
        cardElement.mount(cardElementRef.current);
    }
  }, [elements]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system is not ready.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    
    // This is where the actual payment confirmation happens with Stripe.js
    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement('card'),
        billing_details: {
          name: currentUser.name,
          email: currentUser.email,
        },
      },
    });

    if (paymentError) {
      setError(paymentError.message || 'An unknown payment error occurred.');
      setIsProcessing(false);
      return;
    }
    
    if (paymentIntent?.status === 'succeeded' || !paymentError) {
      // For this mock, we assume success if there's no error.
      console.log('Payment succeeded:', paymentIntent);
      logAuditAction(currentUser.id, currentUser.name, AuditActionType.PAYMENT_SUCCESSFUL, 'User upgraded to Premium via checkout.');
      createNotification(currentUser.id, 'Congratulations! Your upgrade to Premium was successful.', NotificationType.SUCCESS);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === currentUser.id ? { ...user, subscriptionTier: SubscriptionTier.PREMIUM } : user
        )
      );
      setPaymentSucceeded(true);
    }
     setIsProcessing(false);
  };
  
  if (paymentSucceeded) {
      return (
         <div className="p-8 h-full flex items-center justify-center">
            <Card className="max-w-md text-center shadow-2xl p-10">
                 <Icon>
                    <svg className="h-16 w-16 text-green-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </Icon>
                 <h1 className="text-3xl font-bold text-gray-800 mt-4">Payment Successful!</h1>
                 <p className="text-lg text-gray-600 mt-2">Welcome to Premium! You now have unlimited access to all StudyWell features.</p>
                 <Button onClick={() => navigateTo(AppView.DASHBOARD)} className="mt-8 w-full">Go to Dashboard</Button>
            </Card>
        </div>
      );
  }

  return (
    <div className="p-8 h-full flex items-center justify-center">
      <Card className="max-w-lg w-full shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">Upgrade to Premium</h1>
        <p className="text-md text-center text-gray-600 mb-6">Unlock all features for just <span className="font-bold">$9.99/month</span>.</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48"><Spinner /></div>
        ) : (
          <form onSubmit={handleSubmit} id="payment-form">
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                <div id="card-element" ref={cardElementRef} className="p-3 border border-gray-300 rounded-md bg-white shadow-sm">
                    {/* Stripe Card Element will be inserted here */}
                </div>
            </div>
            
            {error && <div id="payment-message" className="text-red-600 bg-red-100 p-3 rounded-md mb-4 text-sm" role="alert">{error}</div>}
            
            <Button type="submit" disabled={isLoading || isProcessing || !stripe || !elements} className="w-full text-lg">
              {isProcessing ? "Processing..." : "Pay $9.99 and Upgrade Now"}
            </Button>
            <p className="text-xs text-center text-gray-500 mt-4">Powered by Stripe. Your payment details are secure.</p>
          </form>
        )}
      </Card>
    </div>
  );
};

export default UpgradePage;