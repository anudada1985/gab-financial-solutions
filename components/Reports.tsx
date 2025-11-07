
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, InventoryItem, TransactionType, InventoryLocation } from '../types';
import { ExportIcon } from './Icons';

interface ReportsProps {
    transactions: Transaction[];
    inventory: InventoryItem[];
}

type ReportType = 'sales' | 'purchases' | 'profitability';
type GroupBy = 'item' | 'size' | 'location' | 'day' | 'month';

const Reports: React.FC<ReportsProps> = ({ transactions, inventory }) => {
    const [reportType, setReportType] = useState<ReportType>('sales');
    const [groupBy, setGroupBy] = useState<GroupBy>('item');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [tableHeaders, setTableHeaders] = useState<string[]>([]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);

    const inventoryMap = useMemo(() => {
        return new Map(inventory.map(item => [item.id, item]));
    }, [inventory]);

    const locationNameMap: Record<InventoryLocation, string> = {
        locationCapital: 'Capital',
        locationWorldTyre: 'World Tyre',
        locationUniversal: 'Universal',
        locationStore1: 'Store-1',
        locationStore2: 'Store-2',
    };

    const generateReport = () => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end && t.inventoryItemId;
        });

        let data: any[] = [];
        let headers: string[] = [];
        
        const getGroupKey = (t: Transaction): string => {
            const item = inventoryMap.get(t.inventoryItemId!);
            switch (groupBy) {
                case 'item': return item?.name || 'Unknown Item';
                case 'size': return item?.size || 'Unknown Size';
                case 'location': return t.location ? locationNameMap[t.location] : 'Unknown Location';
                case 'day': return new Date(t.date).toLocaleDateString();
                case 'month': return new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
                default: return 'Overall';
            }
        };

        const groupedData = new Map<string, any>();

        if (reportType === 'sales') {
            headers = ['Group', 'Quantity Sold', 'Total Revenue', 'Average Price'];
            const salesTx = filteredTransactions.filter(t => t.type === TransactionType.INCOME && t.category === 'Sales');
            
            salesTx.forEach(t => {
                const key = getGroupKey(t);
                const item = inventoryMap.get(t.inventoryItemId!);
                if (!item) return;

                const quantity = t.amount / item.salePrice;
                const existing = groupedData.get(key) || { key, quantity: 0, revenue: 0 };
                existing.quantity += quantity;
                existing.revenue += t.amount;
                groupedData.set(key, existing);
            });
            
            data = Array.from(groupedData.values()).map(d => [d.key, d.quantity, formatCurrency(d.revenue), formatCurrency(d.revenue / d.quantity)]);

        } else if (reportType === 'purchases') {
            headers = ['Group', 'Quantity Purchased', 'Total Cost', 'Average Cost'];
            const purchaseTx = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE && t.category === 'Purchases');

            purchaseTx.forEach(t => {
                const key = getGroupKey(t);
                const item = inventoryMap.get(t.inventoryItemId!);
                if (!item) return;

                const quantity = t.amount / item.costPrice;
                const existing = groupedData.get(key) || { key, quantity: 0, cost: 0 };
                existing.quantity += quantity;
                existing.cost += t.amount;
                groupedData.set(key, existing);
            });
            data = Array.from(groupedData.values()).map(d => [d.key, d.quantity, formatCurrency(d.cost), formatCurrency(d.cost / d.quantity)]);

        } else if (reportType === 'profitability') {
            headers = ['Group', 'Quantity Sold', 'Total Revenue', 'Total COGS', 'Gross Profit', 'Profit Margin'];
            const salesTx = filteredTransactions.filter(t => t.type === TransactionType.INCOME && t.category === 'Sales');

             salesTx.forEach(t => {
                const key = getGroupKey(t);
                const item = inventoryMap.get(t.inventoryItemId!);
                if (!item) return;

                const quantity = t.amount / item.salePrice;
                const costOfGoods = quantity * item.costPrice;
                const existing = groupedData.get(key) || { key, quantity: 0, revenue: 0, cogs: 0 };
                
                existing.quantity += quantity;
                existing.revenue += t.amount;
                existing.cogs += costOfGoods;
                groupedData.set(key, existing);
            });

            data = Array.from(groupedData.values()).map(d => {
                const profit = d.revenue - d.cogs;
                const margin = d.revenue > 0 ? (profit / d.revenue) * 100 : 0;
                return [d.key, d.quantity, formatCurrency(d.revenue), formatCurrency(d.cogs), formatCurrency(profit), `${margin.toFixed(2)}%`];
            });
        }

        setTableHeaders(headers);
        setReportData(data);
    };
    
    useEffect(() => {
        generateReport();
    }, []);

    const handleExport = () => {
        if (reportData.length === 0) return;
        const csvRows = [tableHeaders.join(',')];
        for (const row of reportData) {
            const values = row.map((val: any) => {
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
        a.setAttribute('download', `${reportType}_report.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Reports</h1>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Report Type</label>
                        <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2">
                            <option value="sales">Sales Report</option>
                            <option value="purchases">Purchase Report</option>
                            <option value="profitability">Profitability Report</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Group By</label>
                        <select value={groupBy} onChange={e => setGroupBy(e.target.value as GroupBy)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2">
                            <option value="item">Item</option>
                            <option value="size">Size</option>
                            <option value="location">Location</option>
                            <option value="day">Day</option>
                            <option value="month">Month</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                         <button onClick={generateReport} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors">
                            Generate Report
                        </button>
                        <button onClick={handleExport} className="bg-gray-600 hover:bg-gray-500 text-white font-bold p-2 rounded transition-colors" aria-label="Export Report">
                            <ExportIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

             <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                {tableHeaders.map(header => (
                                    <th key={header} className="p-4 font-semibold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length > 0 ? (
                                reportData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={`border-t border-gray-700 ${rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
                                        {row.map((cell: any, cellIndex: number) => (
                                            <td key={cellIndex} className="p-4">{cell}</td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="text-center p-8 text-gray-400">
                                        No data available for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
