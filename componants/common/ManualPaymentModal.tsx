import React, { useState } from 'react';
import { User, SubscriptionTier, AuditActionType, NotificationType } from '../../types';
import { takeManualPayment } from '../../services/stripeService';
import Modal from './Modal';
import Button from './Button';
import Spinner from './Spinner';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToPay: User;
  onSuccess: (updatedUser: User) => void;
  logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
  createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
  actor: User;
}

const SUBSCRIPTION_PRICE = 9.99;

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({ isOpen, onClose, userToPay, onSuccess, logAuditAction, createNotification, actor }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setError('');

    const result = await takeManualPayment(userToPay.customerId);

    if (result.success) {
      const updatedUser = { ...userToPay, subscriptionTier: SubscriptionTier.PREMIUM };
      onSuccess(updatedUser);
      logAuditAction(actor.id, actor.name, AuditActionType.PAYMENT_SUCCESSFUL, `Processed manual payment for ${userToPay.name} for $${SUBSCRIPTION_PRICE}.`);
      createNotification(userToPay.id, `A staff member processed your subscription payment. You are now a Premium member!`, NotificationType.SUCCESS);
      onClose();
    } else {
      setError(result.error || 'An unexpected error occurred while processing the payment.');
    }
    
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manual Payment for ${userToPay.name}`}>
        {isLoading ? (
            <div className="flex justify-center items-center py-8"><Spinner /></div>
        ) : (
            <div className="space-y-4">
                <p className="text-gray-700">You are about to process a manual subscription payment for this user.</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-800">Premium Subscription</span>
                        <span className="text-gray-900">${SUBSCRIPTION_PRICE.toFixed(2)}</span>
                    </div>
                     <p className="text-sm text-gray-500 mt-1">This will upgrade the user's account to Premium.</p>
                </div>

                {!userToPay.customerId && (
                    <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm">
                        <strong>Warning:</strong> This user does not have a payment profile (Customer ID) set up. This action will fail in a real environment.
                    </div>
                )}
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end pt-4 space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleConfirmPayment} disabled={isLoading}>Confirm Payment</Button>
                </div>
            </div>
        )}
    </Modal>
  );
};

export default ManualPaymentModal;