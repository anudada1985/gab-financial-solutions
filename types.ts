
export enum AccountType {
    ASSET = 'Asset',
    LIABILITY = 'Liability',
}

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    isBank: boolean;
}

export enum TransactionType {
    INCOME = 'Income',
    EXPENSE = 'Expense',
}

export interface Transaction {
    id: string;
    date: string; // ISO string
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    accountId: string;
    isCleared: boolean;
    inventoryItemId?: string;
    location?: InventoryLocation;
}

export interface InventoryItem {
    id: string;
    name: string;
    size: string;
    locationCapital: number;
    locationWorldTyre: number;
    locationUniversal: number;
    locationStore1: number;
    locationStore2: number;
    costPrice: number;
    salePrice: number;
}

export enum View {
    DASHBOARD = 'Dashboard',
    TRANSACTIONS = 'Transactions',
    ACCOUNTS = 'Accounts',
    INVENTORY = 'Inventory',
    RECONCILIATION = 'Reconciliation',
    REPORTS = 'Reports'
}

export enum SalePurchaseMode {
    SALE = 'Sale',
    PURCHASE = 'Purchase',
}

export type InventoryLocation = 'locationCapital' | 'locationWorldTyre' | 'locationUniversal' | 'locationStore1' | 'locationStore2';

export enum UserRole {
    ADMIN = 'ADMIN',
    LOCATION = 'LOCATION',
}

export interface User {
    id: string;
    username: string;
    password; // In a real app, this would be a hash
    role: UserRole;
    location?: InventoryLocation;
}