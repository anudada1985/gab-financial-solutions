
import React, { useMemo } from 'react';
import { Account, AccountType, InventoryItem, Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface StatCardProps {
    title: string;
    value: string;
    description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <p className="text-sm text-gray-400 mt-2">{description}</p>
    </div>
);

interface DashboardProps {
    transactions: Transaction[];
    accounts: Account[];
    inventory: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts, inventory }) => {

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);

    const stats = useMemo(() => {
        const totalAssets = accounts
            .filter(a => a.type === AccountType.ASSET)
            .reduce((sum, a) => sum + a.balance, 0);

        const totalLiabilities = accounts
            .filter(a => a.type === AccountType.LIABILITY)
            .reduce((sum, a) => sum + a.balance, 0);

        const netWorth = totalAssets - totalLiabilities;

        const totalIncome = transactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const cashFlow = totalIncome - totalExpenses;

        const inventoryValue = inventory.reduce((sum, item) => {
             const totalQuantity = (item.locationCapital || 0) + (item.locationWorldTyre || 0) + (item.locationUniversal || 0) + (item.locationStore1 || 0) + (item.locationStore2 || 0);
            return sum + (totalQuantity * item.costPrice)
        }, 0);
        
        return { netWorth, totalIncome, totalExpenses, inventoryValue, cashFlow };
    }, [transactions, accounts, inventory]);

    const chartData = useMemo(() => {
        const dataByMonth: { [key: string]: { name: string, Income: number, Expenses: number } } = {};
        
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!dataByMonth[month]) {
                dataByMonth[month] = { name: month, Income: 0, Expenses: 0 };
            }
            if (t.type === TransactionType.INCOME) {
                dataByMonth[month].Income += t.amount;
            } else {
                dataByMonth[month].Expenses += t.amount;
            }
        });

        return Object.values(dataByMonth).reverse();
    }, [transactions]);


    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Net Worth" value={formatCurrency(stats.netWorth)} description="Assets - Liabilities" />
                <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} description="Revenue in current period" />
                <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpenses)} description="Costs in current period" />
                <StatCard title="Inventory Value" value={formatCurrency(stats.inventoryValue)} description="Total cost of goods" />
            </div>

            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Cash Flow Overview</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" />
                            <XAxis dataKey="name" stroke="#a0a0a0" />
                            <YAxis stroke="#a0a0a0" tickFormatter={(value) => formatCurrency(Number(value))}/>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #3c3c3c' }} 
                                labelStyle={{ color: '#ffffff' }}
                                formatter={(value) => formatCurrency(Number(value))}
                            />
                            <Legend wrapperStyle={{ color: '#ffffff' }}/>
                            <Bar dataKey="Income" fill="#06b6d4" />
                            <Bar dataKey="Expenses" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;