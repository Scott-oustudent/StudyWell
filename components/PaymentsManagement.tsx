
import React, { useState, useMemo } from 'react';
import { User, SubscriptionTier, AuditActionType, NotificationType } from '../types';
import * as stripeService from '../services/stripeService';
import Card from './common/Card';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Icon from './common/Icon';

interface PaymentsManagementProps {
    currentUser: User;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    logAuditAction: (actorId: string, actorName: string, actionType: AuditActionType, details: string) => void;
    createNotification: (userId: string, message: string, type?: NotificationType, linkTo?: any) => void;
}

const SUBSCRIPTION_PRICE = 9.99;

const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ currentUser, users, setUsers, logAuditAction, createNotification }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const freeTierUsers = useMemo(() => {
        return users.filter(u => u.subscriptionTier === SubscriptionTier.FREE && u.id !== currentUser.id);
    }, [users, currentUser.id]);

    const selectedUser = useMemo(() => {
        return users.find(u => u.id === selectedUserId);
    }, [users, selectedUserId]);

    const handleUserSelect = (userId: string) => {
        setSelectedUserId(userId);
        setError(null);
        setSuccessMessage(null);
        // Reset card form
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
    };
    
    const handleCreateProfile = async () => {
        if (!selectedUser) return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const { customerId, error } = await stripeService.createCustomer(selectedUser.email, selectedUser.name);

        if (error || !customerId) {
            setError(error || 'Failed to create payment profile.');
        } else {
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, customerId } : u));
            logAuditAction(currentUser.id, currentUser.name, AuditActionType.CUSTOMER_PROFILE_CREATED, `Created payment profile for ${selectedUser.name}.`);
            setSuccessMessage(`Payment profile created for ${selectedUser.name}.`);
        }
        setIsLoading(false);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !selectedUser.customerId) return;
        
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const result = await stripeService.takeManualPayment(selectedUser.customerId);

        if (result.success) {
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, subscriptionTier: SubscriptionTier.PREMIUM } : u));
            logAuditAction(currentUser.id, currentUser.name, AuditActionType.PAYMENT_SUCCESSFUL, `Processed manual payment for ${selectedUser.name} for $${SUBSCRIPTION_PRICE}.`);
            createNotification(selectedUser.id, `A staff member processed your subscription payment. You are now a Premium member!`, NotificationType.SUCCESS);
            setSuccessMessage(`${selectedUser.name} has been upgraded to Premium.`);
            // Reset form and selection
            handleUserSelect('');
        } else {
            setError(result.error || 'An unexpected error occurred.');
        }

        setIsLoading(false);
    };

    const isFormValid = cardName && cardNumber.length >= 15 && cardExpiry.length >= 4 && cardCvc.length >= 3;

    return (
        <Card className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manual Payments</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Selection */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Select User to Upgrade</label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => handleUserSelect(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
                        >
                            <option value="">-- Select a User --</option>
                            {freeTierUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                            ))}
                        </select>
                    </div>
                    {isLoading && <div className="text-center"><Spinner /></div>}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {successMessage && <p className="text-green-600 text-sm font-semibold">{successMessage}</p>}
                </div>

                {/* Payment Form / Profile Creation */}
                <div>
                    {selectedUser ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800">User: {selectedUser.name}</h3>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            <p className="text-sm text-gray-500">Subscription: {selectedUser.subscriptionTier}</p>
                            
                            <div className="mt-4 pt-4 border-t">
                                {selectedUser.customerId ? (
                                    <form onSubmit={handlePayment} className="space-y-4">
                                        <h4 className="font-semibold text-gray-700">Enter Card Details</h4>
                                        <div>
                                            <label className="text-xs text-gray-600">Name on Card</label>
                                            <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="John Doe"/>
                                        </div>
                                         <div>
                                            <label className="text-xs text-gray-600">Card Number</label>
                                            <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="**** **** **** 1234" maxLength={16} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-600">Expiry (MM/YY)</label>
                                                <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="MM/YY" maxLength={5} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600">CVC</label>
                                                <input type="text" value={cardCvc} onChange={e => setCardCvc(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="123" maxLength={4} />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={!isFormValid || isLoading}>Process Payment for ${SUBSCRIPTION_PRICE}</Button>
                                    </form>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-yellow-700 bg-yellow-100 p-3 rounded-md mb-4 text-sm">This user does not have a payment profile.</p>
                                        <Button onClick={handleCreateProfile} disabled={isLoading}>
                                            <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></Icon>
                                            Create Payment Profile
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-8">
                            <p className="text-gray-500">Select a user to begin.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default PaymentsManagement;
