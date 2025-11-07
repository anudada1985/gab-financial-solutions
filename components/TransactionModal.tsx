
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account } from '../types';
import Modal from './Modal';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
    accounts: Account[];
    transaction?: Transaction;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, accounts, transaction }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [category, setCategory] = useState('');
    const [accountId, setAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');

    useEffect(() => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setDate(new Date(transaction.date).toISOString().split('T')[0]);
            setType(transaction.type);
            setCategory(transaction.category);
            setAccountId(transaction.accountId);
        } else {
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setType(TransactionType.EXPENSE);
            setCategory('');
            setAccountId(accounts.length > 0 ? accounts[0].id : '');
        }
    }, [transaction, isOpen, accounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: transaction?.id || new Date().toISOString(),
            description,
            amount: parseFloat(amount),
            date: new Date(date).toISOString(),
            type,
            category,
            accountId,
            isCleared: transaction?.isCleared || false,
        };
        onSave(newTransaction);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-4 py-2 text-sm font-medium ${type === TransactionType.EXPENSE ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded-l-md w-full`}>Expense</button>
                            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`px-4 py-2 text-sm font-medium ${type === TransactionType.INCOME ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded-r-md w-full`}>Income</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-400">Description</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                         <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-400">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-400">Category</label>
                            <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-400">Account</label>
                            <select id="account" value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5">
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700">Save Transaction</button>
                </div>
            </form>
        </Modal>
    );
};

export default TransactionModal;
