import React, { useEffect, useRef, useState } from 'react';
import { XCircleIcon } from '../icons/Icons';
import { loadScript } from '@paypal/paypal-js';

interface PayPalModalProps {
    onSuccess: () => void;
    onClose: () => void;
}

const PayPalModal: React.FC<PayPalModalProps> = ({ onSuccess, onClose }) => {
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const amount = '9.99';
    const currency = 'GBP';

    useEffect(() => {
        let mounted = true;
        const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
        loadScript({ 'client-id': clientId, currency })
            .then((paypal) => {
                if (!paypal || !mounted || !containerRef.current) return;

                paypal.Buttons({
                    createOrder: async () => {
                            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
                            const userEmail = session.email || null;
                            const res = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ amount, currency, userEmail })
                            });
                            const data = await res.json();
                            return data.id;
                        },
                        onApprove: async (data: any) => {
                            try {
                                const session = JSON.parse(localStorage.getItem('userSession') || '{}');
                                const userEmail = session.email || null;
                                const res = await fetch('/api/paypal/capture-order', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderId: data.orderID || data.orderId, userEmail })
                                });
                                const capture = await res.json();
                                // Pass capture to parent so it can persist and upgrade
                                onSuccess(capture);
                            } catch (err) {
                                console.error('Capture error', err);
                            }
                        },
                    onError: (err: any) => {
                        console.error('PayPal error', err);
                    }
                }).render(containerRef.current);
            })
            .catch((err) => {
                console.error('Failed loading PayPal SDK', err);
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm text-center p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <XCircleIcon className="w-6 h-6 text-gray-400" />
                </button>
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg" alt="Payment Methods" className="h-8 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Confirm Your Upgrade</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You will be charged £9.99 for a one-year subscription to StudyWell Premium.</p>

                {loading ? (
                    <div className="flex items-center justify-center flex-col">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-500">Loading payment...</p>
                    </div>
                ) : (
                    <div ref={containerRef} />
                )}
            </div>
        </div>
    );
};

export default PayPalModal;
