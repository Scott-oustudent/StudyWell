import React, { useEffect, useRef, useState } from 'react';
import { loadScript } from '@paypal/paypal-js';

type PayPalModalProps = {
  amount?: string;
  currency?: string;
  onSuccess?: (details: any) => void;
  onError?: (err: any) => void;
};

const PayPalModal: React.FC<PayPalModalProps> = ({ amount = '1.00', currency = 'USD', onSuccess, onError }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const clientId = process.env.VITE_PAYPAL_CLIENT_ID || '';
    // load PayPal SDK from client id; prefer server-side client id injection if available
    loadScript({ 'client-id': clientId, currency })
      .then((paypal) => {
        if (!paypal || !mounted || !containerRef.current) return;

        paypal.Buttons({
          createOrder: async () => {
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, currency })
            });
            const data = await res.json();
            return data.id;
          },
          onApprove: async (_data: any, actions: any) => {
            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: _data.orderID || _data.orderId })
              });
              const capture = await res.json();
              onSuccess?.(capture);
            } catch (err) {
              onError?.(err);
            }
          },
          onError: (err: any) => onError?.(err)
        }).render(containerRef.current);
      })
      .catch((err) => {
        console.error('Failed to load PayPal SDK', err);
        onError?.(err);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [amount, currency, onSuccess, onError]);

  return (
    <div>
      {loading && <div>Loading payment...</div>}
      <div ref={containerRef} />
    </div>
  );
};

export default PayPalModal;
