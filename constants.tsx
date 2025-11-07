
import { Account, AccountType, Transaction, TransactionType, InventoryItem, User, UserRole } from './types';

export const MOCK_ACCOUNTS: Account[] = [
    { id: 'acc1', name: 'Checking Account', type: AccountType.ASSET, balance: 15000, isBank: true },
    { id: 'acc2', name: 'Savings Account', type: AccountType.ASSET, balance: 45000, isBank: true },
    { id: 'acc3', name: 'Business Credit Card', type: AccountType.LIABILITY, balance: 2500, isBank: true },
    { id: 'acc4', name: 'Office Equipment', type: AccountType.ASSET, balance: 12000, isBank: false },
    { id: 'acc5', name: 'Business Loan', type: AccountType.LIABILITY, balance: 50000, isBank: false },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'txn1', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Client Payment - Project A', amount: 5000, type: TransactionType.INCOME, category: 'Revenue', accountId: 'acc1', isCleared: true },
    { id: 'txn2', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Office Supplies', amount: 150, type: TransactionType.EXPENSE, category: 'Office Expenses', accountId: 'acc3', isCleared: true },
    { id: 'txn3', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), description: 'Software Subscription', amount: 45, type: TransactionType.EXPENSE, category: 'Software', accountId: 'acc3', isCleared: true },
    { id: 'txn4', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), description: 'Client Payment - Project B', amount: 7500, type: TransactionType.INCOME, category: 'Revenue', accountId: 'acc1', isCleared: false },
    { id: 'txn5', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), description: 'Rent Payment', amount: 2000, type: TransactionType.EXPENSE, category: 'Rent', accountId: 'acc1', isCleared: false },
    { id: 'txn6', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), description: 'Utility Bill', amount: 250, type: TransactionType.EXPENSE, category: 'Utilities', accountId: 'acc1', isCleared: true },
];

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: 'inv1', name: 'Wireless Mouse', size: 'HW-M-001', locationCapital: 10, locationWorldTyre: 15, locationUniversal: 5, locationStore1: 10, locationStore2: 10, costPrice: 15, salePrice: 30 },
    { id: 'inv2', name: 'Mechanical Keyboard', size: 'HW-K-002', locationCapital: 5, locationWorldTyre: 5, locationUniversal: 5, locationStore1: 10, locationStore2: 5, costPrice: 60, salePrice: 120 },
    { id: 'inv3', name: 'USB-C Hub', size: 'HW-A-003', locationCapital: 20, locationWorldTyre: 20, locationUniversal: 15, locationStore1: 10, locationStore2: 10, costPrice: 25, salePrice: 45 },
    { id: 'inv4', name: '27" 4K Monitor', size: 'HW-D-004', locationCapital: 3, locationWorldTyre: 3, locationUniversal: 3, locationStore1: 3, locationStore2: 3, costPrice: 300, salePrice: 450 },
];

export const MOCK_USERS: User[] = [
    { id: 'user-admin', username: 'admin', password: 'password', role: UserRole.ADMIN },
    { id: 'user-cap', username: 'capital', password: 'password', role: UserRole.LOCATION, location: 'locationCapital' },
    { id: 'user-wt', username: 'worldtyre', password: 'password', role: UserRole.LOCATION, location: 'locationWorldTyre' },
    { id: 'user-uni', username: 'universal', password: 'password', role: UserRole.LOCATION, location: 'locationUniversal' },
    { id: 'user-s1', username: 'store1', password: 'password', role: UserRole.LOCATION, location: 'locationStore1' },
    { id: 'user-s2', username: 'store2', password: 'password', role: UserRole.LOCATION, location: 'locationStore2' },
];