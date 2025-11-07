
import React, { useState, useRef } from 'react';
import { InventoryItem, SalePurchaseMode, User, UserRole } from '../types';
import { EditIcon, DeleteIcon, ImportIcon, ExportIcon, SaleIcon, PurchaseIcon } from './Icons';

interface InventoryProps {
    user: User;
    items: InventoryItem[];
    setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    onEdit: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
    onSalePurchase: (mode: SalePurchaseMode) => void;
}

const Inventory: React.FC<InventoryProps> = ({ user, items, setItems, onEdit, onDelete, onSalePurchase }) => {
    const importInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);

    const handleExport = () => {
        const headers = ['id', 'name', 'size', 'locationCapital', 'locationWorldTyre', 'locationUniversal', 'locationStore1', 'locationStore2', 'costPrice', 'salePrice'];
        const csvRows = [headers.join(',')];
        
        for (const item of items) {
            const values = headers.map(header => {
                const val = item[header as keyof InventoryItem];
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
        a.setAttribute('download', 'inventory.csv');
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
            const newItems: InventoryItem[] = [];

            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                const itemData: { [key: string]: any } = {};
                headers.forEach((header, index) => {
                  let value = values[index];
                  if(value && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                  }
                  itemData[header] = value;
                });
                
                try {
                    const newItem: InventoryItem = {
                        id: itemData.id || `imported-${new Date().toISOString()}-${i}`,
                        name: itemData.name,
                        size: itemData.size,
                        locationCapital: parseInt(itemData.locationCapital) || 0,
                        locationWorldTyre: parseInt(itemData.locationWorldTyre) || 0,
                        locationUniversal: parseInt(itemData.locationUniversal) || 0,
                        locationStore1: parseInt(itemData.locationStore1) || 0,
                        locationStore2: parseInt(itemData.locationStore2) || 0,
                        costPrice: parseFloat(itemData.costPrice),
                        salePrice: parseFloat(itemData.salePrice),
                    };
                    if (newItem.name && !isNaN(newItem.costPrice) && !isNaN(newItem.salePrice)) {
                        newItems.push(newItem);
                    }
                } catch (err) {
                    console.error("Error parsing inventory row: ", rows[i], err);
                }
            }

            setItems(prev => {
                const existingIds = new Set(prev.map(i => i.id));
                const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));
                return [...prev, ...uniqueNewItems];
            });
            if (event.target) {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };
    
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.size.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-white">Inventory</h1>
                 <div className="flex-1 max-w-md">
                     <input
                         type="text"
                         placeholder="Search by name or size..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                     />
                 </div>
                <div className="flex space-x-2">
                    <button onClick={() => onSalePurchase(SalePurchaseMode.PURCHASE)} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        <PurchaseIcon className="h-5 w-5 mr-2" /> Purchase
                    </button>
                    <button onClick={() => onSalePurchase(SalePurchaseMode.SALE)} className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        <SaleIcon className="h-5 w-5 mr-2" /> Sale
                    </button>
                    {user.role === UserRole.ADMIN && (
                        <>
                            <input type="file" ref={importInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                            <button onClick={handleImportClick} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors">
                                <ImportIcon className="h-5 w-5 mr-2" /> Import
                            </button>
                            <button onClick={handleExport} className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors">
                                <ExportIcon className="h-5 w-5 mr-2" /> Export
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4 font-semibold">Item Name</th>
                                <th className="p-4 font-semibold">Size</th>
                                <th className="p-4 font-semibold text-right">Capital</th>
                                <th className="p-4 font-semibold text-right">World Tyre</th>
                                <th className="p-4 font-semibold text-right">Universal</th>
                                <th className="p-4 font-semibold text-right">Store-1</th>
                                <th className="p-4 font-semibold text-right">Store-2</th>
                                <th className="p-4 font-semibold text-right">Total Qty</th>
                                <th className="p-4 font-semibold text-right">Cost Price</th>
                                <th className="p-4 font-semibold text-right">Total Value</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, index) => {
                                const totalQuantity = (item.locationCapital || 0) + (item.locationWorldTyre || 0) + (item.locationUniversal || 0) + (item.locationStore1 || 0) + (item.locationStore2 || 0);
                                return (
                                <tr key={item.id} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
                                    <td className="p-4 font-medium">{item.name}</td>
                                    <td className="p-4 text-gray-400">{item.size}</td>
                                    <td className="p-4 text-right">{item.locationCapital || 0}</td>
                                    <td className="p-4 text-right">{item.locationWorldTyre || 0}</td>
                                    <td className="p-4 text-right">{item.locationUniversal || 0}</td>
                                    <td className="p-4 text-right">{item.locationStore1 || 0}</td>
                                    <td className="p-4 text-right">{item.locationStore2 || 0}</td>
                                    <td className="p-4 text-right font-bold">{totalQuantity}</td>
                                    <td className="p-4 text-right">{formatCurrency(item.costPrice)}</td>
                                    <td className="p-4 text-right font-medium">{formatCurrency(totalQuantity * item.costPrice)}</td>
                                    <td className="p-4 text-center">
                                        {user.role === UserRole.ADMIN && (
                                            <>
                                                <button onClick={() => onEdit(item)} className="text-gray-400 hover:text-cyan-400 p-2">
                                                    <EditIcon className="w-5 h-5"/>
                                                </button>
                                                <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-400 p-2 ml-2">
                                                    <DeleteIcon className="w-5 h-5"/>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;