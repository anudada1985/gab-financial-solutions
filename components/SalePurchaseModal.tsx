
import React, { useState, useEffect } from 'react';
import { InventoryItem, Account, SalePurchaseMode, InventoryLocation, User, UserRole } from '../types';
import Modal from './Modal';

interface SalePurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        itemId: string;
        location: InventoryLocation;
        quantity: number;
        accountId: string;
        date: string;
    }) => void;
    mode: SalePurchaseMode;
    inventory: InventoryItem[];
    accounts: Account[];
    user: User;
}

const SalePurchaseModal: React.FC<SalePurchaseModalProps> = ({ isOpen, onClose, onSave, mode, inventory, accounts, user }) => {
    const [itemId, setItemId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState<InventoryLocation>(user.role === UserRole.LOCATION && user.location ? user.location : 'locationCapital');
    const [accountId, setAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setItemId('');
            setQuantity('');
            // For location users, lock their location. For admins, default to first option.
            if (user.role === UserRole.LOCATION && user.location) {
                setLocation(user.location);
            } else {
                setLocation('locationCapital');
            }
            setAccountId(accounts.length > 0 ? accounts[0].id : '');
            setDate(new Date().toISOString().split('T')[0]);
            setError('');
        }
    }, [isOpen, accounts, user]);

    const selectedItem = inventory.find(i => i.id === itemId);
    const totalAmount = selectedItem ? (mode === SalePurchaseMode.SALE ? selectedItem.salePrice : selectedItem.costPrice) * parseFloat(quantity || '0') : 0;
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);

    const locationOptions: { value: InventoryLocation, label: string }[] = [
        { value: 'locationCapital', label: 'Capital' },
        { value: 'locationWorldTyre', label: 'World Tyre' },
        { value: 'locationUniversal', label: 'Universal' },
        { value: 'locationStore1', label: 'Store-1' },
        { value: 'locationStore2', label: 'Store-2' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const qtyNum = parseInt(quantity, 10);
        if (!itemId || !quantity || isNaN(qtyNum) || qtyNum <= 0 || !accountId) {
            setError('Please select an item and fill all fields correctly.');
            return;
        }

        if (mode === SalePurchaseMode.SALE) {
            const stockAtLocation = selectedItem?.[location] ?? 0;
            if (qtyNum > stockAtLocation) {
                setError(`Not enough stock at this location. Available: ${stockAtLocation}`);
                return;
            }
        }

        onSave({ itemId, location, quantity: qtyNum, accountId, date });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Record ${mode}`}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="item" className="block text-sm font-medium text-gray-400">Item</label>
                        <select id="item" value={itemId} onChange={e => setItemId(e.target.value)} className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5">
                            <option value="" disabled>Select an item</option>
                            {inventory.map(item => <option key={item.id} value={item.id}>{item.name} - {item.size}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-400">Quantity</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                         <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-400">Location</label>
                            <select 
                                id="location" 
                                value={location} 
                                onChange={e => setLocation(e.target.value as InventoryLocation)} 
                                disabled={user.role === UserRole.LOCATION}
                                className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 disabled:bg-gray-600"
                            >
                                {locationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-400">Account</label>
                            <select id="account" value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5">
                                 {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-400">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                    </div>
                    {selectedItem && (
                        <div className="p-3 bg-gray-900/50 rounded-lg text-center">
                            <span className="text-gray-400">Total Amount: </span>
                            <span className="font-bold text-xl text-white">{formatCurrency(totalAmount)}</span>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700">Save {mode}</button>
                </div>
            </form>
        </Modal>
    );
};

export default SalePurchaseModal;