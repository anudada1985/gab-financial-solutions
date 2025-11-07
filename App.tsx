
import React, { useState, useEffect } from 'react';
import { Account, AccountType, Transaction, TransactionType, InventoryItem, View, SalePurchaseMode, User, UserRole } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Inventory from './components/Inventory';
import Accounts from './components/Accounts';
import Reconciliation from './components/Reconciliation';
import Reports from './components/Reports';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_INVENTORY, MOCK_USERS } from './constants';
import { PlusIcon } from './components/Icons';
import TransactionModal from './components/TransactionModal';
import AccountModal from './components/AccountModal';
import InventoryModal from './components/InventoryModal';
import SalePurchaseModal from './components/SalePurchaseModal';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
    
    const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
        const [value, setValue] = useState<T>(() => {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null
                ? JSON.parse(stickyValue)
                : defaultValue;
        });
        useEffect(() => {
            window.localStorage.setItem(key, JSON.stringify(value));
        }, [key, value]);
        return [value, setValue];
    };
    
    const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'gab_currentUser');
    const [view, setView] = useState<View>(View.DASHBOARD);

    useEffect(() => {
        if (currentUser?.role === UserRole.LOCATION) {
            setView(View.INVENTORY);
        } else {
            setView(View.DASHBOARD);
        }
    }, [currentUser]);


    const [accounts, setAccounts] = useStickyState<Account[]>(MOCK_ACCOUNTS, 'gab_accounts');
    const [transactions, setTransactions] = useStickyState<Transaction[]>(MOCK_TRANSACTIONS, 'gab_transactions');
    const [inventory, setInventory] = useStickyState<InventoryItem[]>(MOCK_INVENTORY, 'gab_inventory');

    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [isAccountModalOpen, setAccountModalOpen] = useState(false);
    const [isInventoryModalOpen, setInventoryModalOpen] = useState(false);
    const [isSalePurchaseModalOpen, setSalePurchaseModalOpen] = useState(false);
    const [salePurchaseMode, setSalePurchaseMode] = useState<SalePurchaseMode>(SalePurchaseMode.SALE);
    
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
    const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | undefined>(undefined);
    
    const handleLogin = (username: string, password: string): boolean => {
        const user = MOCK_USERS.find(u => u.username === username && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleSaveTransaction = (transaction: Transaction) => {
        if (editingTransaction) {
            setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
        } else {
            setTransactions([...transactions, transaction]);
        }
        setEditingTransaction(undefined);
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };
    
    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setTransactionModalOpen(true);
    };

    const handleSaveAccount = (account: Account) => {
        if (editingAccount) {
            setAccounts(accounts.map(a => a.id === account.id ? account : a));
        } else {
            setAccounts([...accounts, account]);
        }
        setEditingAccount(undefined);
    };

    const handleDeleteAccount = (id: string) => {
        setAccounts(accounts.filter(a => a.id !== id));
        setTransactions(transactions.filter(t => t.accountId !== id));
    };
    
    const handleEditAccount = (account: Account) => {
        setEditingAccount(account);
        setAccountModalOpen(true);
    };


    const handleSaveInventoryItem = (item: InventoryItem) => {
        if (editingInventoryItem) {
            setInventory(inventory.map(i => i.id === item.id ? item : i));
        } else {
            setInventory([...inventory, item]);
        }
        setEditingInventoryItem(undefined);
    };

    const handleDeleteInventoryItem = (id: string) => {
        setInventory(inventory.filter(i => i.id !== id));
    };

    const handleEditInventoryItem = (item: InventoryItem) => {
        setEditingInventoryItem(item);
        setInventoryModalOpen(true);
    };
    
    const handleSalePurchaseOpen = (mode: SalePurchaseMode) => {
        setSalePurchaseMode(mode);
        setSalePurchaseModalOpen(true);
    };

    const handleSaveSalePurchase = (data: {
        itemId: string;
        location: keyof Pick<InventoryItem, 'locationCapital' | 'locationWorldTyre' | 'locationUniversal' | 'locationStore1' | 'locationStore2'>;
        quantity: number;
        accountId: string;
        date: string;
    }) => {
        const { itemId, location, quantity, accountId, date } = data;
        const item = inventory.find(i => i.id === itemId);
        const account = accounts.find(a => a.id === accountId);

        if (!item || !account) {
            console.error("Item or Account not found for sale/purchase.");
            return;
        }

        const isSale = salePurchaseMode === SalePurchaseMode.SALE;
        const price = isSale ? item.salePrice : item.costPrice;
        const totalAmount = quantity * price;

        // 1. Create new transaction
        const newTransaction: Transaction = {
            id: `txn-${new Date().toISOString()}`,
            date: date,
            description: `${isSale ? 'Sale' : 'Purchase'} of ${quantity} x ${item.name} (${item.size})`,
            amount: totalAmount,
            type: isSale ? TransactionType.INCOME : TransactionType.EXPENSE,
            category: isSale ? 'Sales' : 'Purchases',
            accountId: accountId,
            isCleared: account.isBank ? false : true,
            inventoryItemId: itemId,
            location: location,
        };
        setTransactions(prev => [...prev, newTransaction]);

        // 2. Update inventory
        setInventory(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQuantity = i[location] + (isSale ? -quantity : quantity);
                return { ...i, [location]: newQuantity };
            }
            return i;
        }));

        // 3. Update account balance
        setAccounts(prev => prev.map(acc => {
            if (acc.id === accountId) {
                let newBalance = acc.balance;
                if (acc.type === AccountType.ASSET) {
                     newBalance += isSale ? totalAmount : -totalAmount;
                } else { // LIABILITY
                     newBalance += isSale ? -totalAmount : totalAmount;
                }
                return { ...acc, balance: newBalance };
            }
            return acc;
        }));
    };


    const renderView = () => {
        if (currentUser?.role === UserRole.LOCATION) {
            return <Inventory user={currentUser} items={inventory} setItems={setInventory} onEdit={handleEditInventoryItem} onDelete={handleDeleteInventoryItem} onSalePurchase={handleSalePurchaseOpen} />;
        }

        switch (view) {
            case View.DASHBOARD:
                return <Dashboard transactions={transactions} accounts={accounts} inventory={inventory} />;
            case View.TRANSACTIONS:
                return <Transactions transactions={transactions} setTransactions={setTransactions} accounts={accounts} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} />;
            case View.INVENTORY:
                return <Inventory user={currentUser!} items={inventory} setItems={setInventory} onEdit={handleEditInventoryItem} onDelete={handleDeleteInventoryItem} onSalePurchase={handleSalePurchaseOpen} />;
            case View.ACCOUNTS:
                return <Accounts accounts={accounts} setAccounts={setAccounts} onEdit={handleEditAccount} onDelete={handleDeleteAccount} />;
            case View.RECONCILIATION:
                return <Reconciliation transactions={transactions} setTransactions={setTransactions} accounts={accounts} />;
            case View.REPORTS:
                return <Reports transactions={transactions} inventory={inventory} />;
            default:
                return <Dashboard transactions={transactions} accounts={accounts} inventory={inventory}/>;
        }
    };
    
    const getModalOpenFunction = () => {
        if (currentUser?.role !== UserRole.ADMIN) return null;
        switch (view) {
            case View.TRANSACTIONS: return () => { setEditingTransaction(undefined); setTransactionModalOpen(true); };
            case View.ACCOUNTS: return () => { setEditingAccount(undefined); setAccountModalOpen(true); };
            case View.INVENTORY: return () => { setEditingInventoryItem(undefined); setInventoryModalOpen(true); };
            default: return null;
        }
    }

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const modalOpenFunction = getModalOpenFunction();

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar currentUser={currentUser} currentView={view} setView={setView} />
            <main className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                    <h1 className="text-xl font-semibold text-white">Welcome, {currentUser.username}!</h1>
                    <button 
                        onClick={handleLogout}
                        className="bg-gray-700 hover:bg-red-500 hover:text-white text-gray-300 font-bold py-2 px-4 rounded transition-colors text-sm"
                    >
                        Logout
                    </button>
                </header>
                <div className="flex-1">
                    {renderView()}
                </div>
                {modalOpenFunction && (
                     <button
                        onClick={modalOpenFunction}
                        className="fixed bottom-8 right-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                        aria-label="Add new item"
                    >
                        <PlusIcon className="h-8 w-8" />
                    </button>
                )}
            </main>

            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => { setTransactionModalOpen(false); setEditingTransaction(undefined); }}
                onSave={handleSaveTransaction}
                accounts={accounts}
                transaction={editingTransaction}
            />
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => { setAccountModalOpen(false); setEditingAccount(undefined); }}
                onSave={handleSaveAccount}
                account={editingAccount}
            />
            <InventoryModal
                isOpen={isInventoryModalOpen}
                onClose={() => { setInventoryModalOpen(false); setEditingInventoryItem(undefined); }}
                onSave={handleSaveInventoryItem}
                item={editingInventoryItem}
            />
            <SalePurchaseModal
                isOpen={isSalePurchaseModalOpen}
                onClose={() => setSalePurchaseModalOpen(false)}
                onSave={handleSaveSalePurchase}
                mode={salePurchaseMode}
                inventory={inventory}
                accounts={accounts}
                user={currentUser}
            />
        </div>
    );
};

export default App;