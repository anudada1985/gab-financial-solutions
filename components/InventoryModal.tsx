
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import Modal from './Modal';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: InventoryItem) => void;
    item?: InventoryItem;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSave, item }) => {
    const [name, setName] = useState('');
    const [size, setSize] = useState('');
    const [locationCapital, setLocationCapital] = useState('');
    const [locationWorldTyre, setLocationWorldTyre] = useState('');
    const [locationUniversal, setLocationUniversal] = useState('');
    const [locationStore1, setLocationStore1] = useState('');
    const [locationStore2, setLocationStore2] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name);
            setSize(item.size);
            setLocationCapital(String(item.locationCapital || ''));
            setLocationWorldTyre(String(item.locationWorldTyre || ''));
            setLocationUniversal(String(item.locationUniversal || ''));
            setLocationStore1(String(item.locationStore1 || ''));
            setLocationStore2(String(item.locationStore2 || ''));
            setCostPrice(String(item.costPrice));
            setSalePrice(String(item.salePrice));
        } else {
            setName('');
            setSize('');
            setLocationCapital('');
            setLocationWorldTyre('');
            setLocationUniversal('');
            setLocationStore1('');
            setLocationStore2('');
            setCostPrice('');
            setSalePrice('');
        }
    }, [item, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: InventoryItem = {
            id: item?.id || new Date().toISOString(),
            name,
            size,
            locationCapital: parseInt(locationCapital) || 0,
            locationWorldTyre: parseInt(locationWorldTyre) || 0,
            locationUniversal: parseInt(locationUniversal) || 0,
            locationStore1: parseInt(locationStore1) || 0,
            locationStore2: parseInt(locationStore2) || 0,
            costPrice: parseFloat(costPrice),
            salePrice: parseFloat(salePrice),
        };
        onSave(newItem);
        onClose();
    };
    
    const LocationInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, value, onChange}) => (
        <div>
            <label htmlFor={label} className="block text-sm font-medium text-gray-400">{label}</label>
            <input type="number" id={label} value={value} onChange={onChange} className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Inventory Item' : 'Add Inventory Item'}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400">Item Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-400">Size</label>
                            <input type="text" id="size" value={size} onChange={e => setSize(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Location Quantities</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-gray-900/50 rounded-lg">
                            <LocationInput label="Capital" value={locationCapital} onChange={e => setLocationCapital(e.target.value)} />
                            <LocationInput label="World Tyre" value={locationWorldTyre} onChange={e => setLocationWorldTyre(e.target.value)} />
                            <LocationInput label="Universal" value={locationUniversal} onChange={e => setLocationUniversal(e.target.value)} />
                            <LocationInput label="Store-1" value={locationStore1} onChange={e => setLocationStore1(e.target.value)} />
                            <LocationInput label="Store-2" value={locationStore2} onChange={e => setLocationStore2(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="costPrice" className="block text-sm font-medium text-gray-400">Cost Price</label>
                            <input type="number" step="0.01" id="costPrice" value={costPrice} onChange={e => setCostPrice(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                        <div>
                            <label htmlFor="salePrice" className="block text-sm font-medium text-gray-400">Sale Price</label>
                            <input type="number" step="0.01" id="salePrice" value={salePrice} onChange={e => setSalePrice(e.target.value)} required className="mt-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-700">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700">Save Item</button>
                </div>
            </form>
        </Modal>
    );
};

export default InventoryModal;