
import React, { useRef } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import { EditIcon, DeleteIcon, ImportIcon, ExportIcon } from './Icons';

interface TransactionsProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    accounts: Account[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, setTransactions, accounts, onEdit, onDelete }) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
    
    const getAccountName = (accountId: string) => {
        return accounts.find(a => a.id === accountId)?.name || 'N/A';
    };

    const handleExport = () => {
        const headers = ['id', 'date', 'description', 'amount', 'type', 'category', 'accountId', 'isCleared', 'inventoryItemId', 'location'];
        const csvRows = [headers.join(',')];

        for (const transaction of transactions) {
            const values = headers.map(header => {
                const val = transaction[header as keyof Transaction];
                const escaped = val ? (String(val).includes(',') ? `"${val}"` : String(val)) : '';
                return escaped;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'transactions.csv');
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
            const newTransactions: Transaction[] = [];

            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                const transactionData: { [key: string]: any } = {};
                
                headers.forEach((header, index) => {
                  let value = values[index];
                  if(value && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                  }
                  transactionData[header] = value;
                });

                try {
                    const newTransaction: Transaction = {
                        id: transactionData.id || `imported-${new Date().toISOString()}-${i}`,
                        date: new Date(transactionData.date).toISOString(),
                        description: transactionData.description,
                        amount: parseFloat(transactionData.amount),
                        type: transactionData.type === TransactionType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE,
                        category: transactionData.category,
                        accountId: transactionData.accountId,
                        isCleared: transactionData.isCleared === 'true',
                        inventoryItemId: transactionData.inventoryItemId || undefined,
                        location: transactionData.location || undefined,
                    };

                    if (newTransaction.description && !isNaN(newTransaction.amount) && newTransaction.accountId) {
                        newTransactions.push(newTransaction);
                    }
                } catch(err) {
                    console.error("Error parsing transaction row: ", rows[i], err);
                }
            }

            setTransactions(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const uniqueNewTransactions = newTransactions.filter(t => !existingIds.has(t.id));
                return [...prev, ...uniqueNewTransactions];
            });

            if (event.target) {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Transactions</h1>
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
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Description</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Account</th>
                                <th className="p-4 font-semibold text-right">Amount</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTransactions.map((t, index) => (
                                <tr key={t.id} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
                                    <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="p-4">{t.description}</td>
                                    <td className="p-4">
                                        <span className="bg-gray-600 text-gray-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="p-4">{getAccountName(t.accountId)}</td>
                                    <td className={`p-4 text-right font-medium ${t.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
                                        {t.type === 'Expense' && '-'}{formatCurrency(t.amount)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => onEdit(t)} className="text-gray-400 hover:text-cyan-400 p-2">
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => onDelete(t.id)} className="text-gray-400 hover:text-red-400 p-2 ml-2">
                                            <DeleteIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;