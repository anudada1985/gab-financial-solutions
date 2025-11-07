import React, { useRef } from 'react';
import { Account, AccountType } from '../types';
import { EditIcon, DeleteIcon, ImportIcon, ExportIcon } from './Icons';

interface AccountsProps {
    accounts: Account[];
    setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
}

const AccountList: React.FC<{ title: string; accounts: Account[]; onEdit: (account: Account) => void; onDelete: (id: string) => void; }> = ({ title, accounts, onEdit, onDelete }) => {
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <ul>
                {accounts.map((acc, index) => (
                    <li key={acc.id} className={`flex justify-between items-center p-3 rounded ${index % 2 === 0 ? 'bg-gray-700/50' : ''}`}>
                        <div>
                            <span className="font-medium">{acc.name}</span>
                            {acc.isBank && <span className="ml-2 text-xs bg-cyan-800 text-cyan-200 px-2 py-1 rounded-full">Bank Account</span>}
                        </div>
                        <div className="flex items-center">
                            <span className="font-mono text-lg mr-4">{formatCurrency(acc.balance)}</span>
                            <button onClick={() => onEdit(acc)} className="text-gray-400 hover:text-cyan-400 p-2">
                                <EditIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => onDelete(acc.id)} className="text-gray-400 hover:text-red-400 p-2 ml-2">
                                <DeleteIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Accounts: React.FC<AccountsProps> = ({ accounts, setAccounts, onEdit, onDelete }) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const assets = accounts.filter(a => a.type === AccountType.ASSET);
    const liabilities = accounts.filter(a => a.type === AccountType.LIABILITY);

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const netWorth = totalAssets - totalLiabilities;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);

    const handleExport = () => {
        const headers = ['id', 'name', 'type', 'balance', 'isBank'];
        const csvRows = [headers.join(',')];
        
        for (const account of accounts) {
            const values = headers.map(header => {
                const val = account[header as keyof Account];
                const escaped = String(val).includes(',') ? `"${val}"` : String(val);
                return escaped;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'accounts.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(row => row.trim() !== '');
            if (rows.length <= 1) return;

            const headers = rows[0].split(',').map(h => h.trim());
            const newAccounts: Account[] = [];

            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                const accountData: { [key: string]: any } = {};
                headers.forEach((header, index) => {
                  let value = values[index];
                  if(value && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                  }
                  accountData[header] = value;
                });
                
                try {
                    const newAccount: Account = {
                        id: accountData.id || `imported-${new Date().toISOString()}-${i}`,
                        name: accountData.name,
                        type: accountData.type === AccountType.ASSET ? AccountType.ASSET : AccountType.LIABILITY,
                        balance: parseFloat(accountData.balance),
                        isBank: accountData.isBank === 'true',
                    };
                    if (newAccount.name && !isNaN(newAccount.balance)) {
                        newAccounts.push(newAccount);
                    }
                } catch(err) {
                    console.error("Error parsing account row: ", rows[i], err);
                }
            }

            setAccounts(prev => {
                const existingIds = new Set(prev.map(a => a.id));
                const uniqueNewAccounts = newAccounts.filter(a => !existingIds.has(a.id));
                return [...prev, ...uniqueNewAccounts];
            });
             if (event.target) {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Accounts</h1>
                <div className="flex space-x-2">
                    <input type="file" ref={importInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                    <button onClick={handleImportClick} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        <ImportIcon className="h-5 w-5 mr-2" /> Import
                    </button>
                    <button onClick={handleExport} className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        <ExportIcon className="h-5 w-5 mr-2" /> Export
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <h3 className="text-gray-400">Total Assets</h3>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(totalAssets)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <h3 className="text-gray-400">Total Liabilities</h3>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(totalLiabilities)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <h3 className="text-gray-400">Net Worth</h3>
                    <p className="text-2xl font-bold">{formatCurrency(netWorth)}</p>
                </div>
            </div>
            <div className="space-y-6">
                <AccountList title="Assets" accounts={assets} onEdit={onEdit} onDelete={onDelete} />
                <AccountList title="Liabilities" accounts={liabilities} onEdit={onEdit} onDelete={onDelete} />
            </div>
        </div>
    );
};

export default Accounts;