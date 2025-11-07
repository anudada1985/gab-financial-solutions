
import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';
import Modal from './Modal';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: Account) => void;
    account?: Account;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, account }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>(AccountType.ASSET);
    const [balance, setBalance] = useState('');
    const [isBank, setIsBank] = useState(false);

    useEffect(() => {
        if (account) {
            setName(account.name);
            setType(account.type);
            setBalance(String(account.balance));
            setIsBank(account.isBank);
        } else {
            setName('');
            setType(AccountType.ASSET);
            setBalance('');
            setIsBank(false);
        }
    }, [account, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: Account = {
            id: account?.id || new Date().toISOString(),
            name,
            type,
            balance: parseFloat(balance),
            isBank
        };
        onSave(newAccount);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'Add Account'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400">Account Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setType(AccountType.ASSET)} className={`px-4 py-2 text-sm font-medium ${type === AccountType.ASSET ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded-l-md w-full`}>Asset</button>
                            <button type="button" onClick={() => setType(AccountType.LIABILITY)} className={`px-4 py-2 text-sm font-medium ${type === AccountType.LIABILITY ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded-r-md w-full`}>Liability</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="balance" className="block text-sm font-medium text-gray-400">Current Balance</label>
                        <input type="number" id="balance" value={balance} onChange={e => setBalance(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                    </div>
                    <div className="flex items-center">
                        <input id="isBank" type="checkbox" checked={isBank} onChange={(e) => setIsBank(e.target.checked)} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"/>
                        <label htmlFor="isBank" className="ml-2 text-sm font-medium text-gray-300">Is this a bank account?</label>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700">Save Account</button>
                </div>
            </form>
        </Modal>
    );
};

export default AccountModal;
