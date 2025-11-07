
import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../types';

interface ReconciliationProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    accounts: Account[];
}

const Reconciliation: React.FC<ReconciliationProps> = ({ transactions, setTransactions, accounts }) => {
    const bankAccounts = accounts.filter(a => a.isBank);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(bankAccounts.length > 0 ? bankAccounts[0].id : null);
    const [statementBalance, setStatementBalance] = useState('');

    const accountTransactions = useMemo(() => {
        return transactions
            .filter(t => t.accountId === selectedAccountId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions, selectedAccountId]);

    const handleToggleCleared = (transactionId: string) => {
        setTransactions(prev =>
            prev.map(t =>
                t.id === transactionId ? { ...t, isCleared: !t.isCleared } : t
            )
        );
    };

    const { clearedBalance, difference } = useMemo(() => {
        const clearedBalance = accountTransactions.reduce((acc, t) => {
            if (t.isCleared) {
                 return acc + (t.type === 'Income' ? t.amount : -t.amount);
            }
            return acc;
        }, 0);
        const statementBalNum = parseFloat(statementBalance) || 0;
        const difference = statementBalNum - clearedBalance;
        return { clearedBalance, difference };
    }, [accountTransactions, statementBalance]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Bank Reconciliation</h1>
            <div className="mb-6 max-w-sm">
                <label htmlFor="account-select" className="block text-sm font-medium text-gray-400 mb-2">Select Bank Account</label>
                <select
                    id="account-select"
                    value={selectedAccountId || ''}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                >
                    {bankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
            </div>

            {selectedAccountId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-4 bg-gray-700 font-bold">Uncleared Transactions</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 w-12"></th>
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold">Description</th>
                                        <th className="p-4 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accountTransactions.map((t, index) => (
                                        <tr key={t.id} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={t.isCleared}
                                                    onChange={() => handleToggleCleared(t.id)}
                                                    className="w-5 h-5 bg-gray-600 border-gray-500 rounded text-cyan-500 focus:ring-cyan-600"
                                                />
                                            </td>
                                            <td className="p-4">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="p-4">{t.description}</td>
                                            <td className={`p-4 text-right font-medium ${t.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
                                                 {t.type === 'Expense' && '-'}{formatCurrency(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col space-y-4 h-fit">
                        <h2 className="text-xl font-bold mb-2">Reconciliation Summary</h2>
                        <div>
                            <label htmlFor="statement-balance" className="block text-sm font-medium text-gray-400">Statement Ending Balance</label>
                            <input
                                type="number"
                                id="statement-balance"
                                value={statementBalance}
                                onChange={(e) => setStatementBalance(e.target.value)}
                                className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400">Cleared Balance:</span>
                            <span className="font-bold">{formatCurrency(clearedBalance)}</span>
                        </div>
                        <div className={`flex justify-between items-center py-2 font-bold text-lg rounded-lg p-3 ${difference === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <span>Difference:</span>
                            <span>{formatCurrency(difference)}</span>
                        </div>
                         {difference === 0 && <p className="text-center text-green-400 font-semibold pt-2">Successfully Reconciled!</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reconciliation;