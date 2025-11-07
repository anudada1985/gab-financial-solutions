
import React from 'react';
import { View, User, UserRole } from '../types';
import { DashboardIcon, TransactionsIcon, AccountsIcon, InventoryIcon, ReconciliationIcon, ReportsIcon } from './Icons';

interface SidebarProps {
    currentUser: User;
    currentView: View;
    setView: (view: View) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: View;
    currentView: View;
    setView: (view: View) => void;
}> = ({ icon, label, currentView, setView }) => {
    const isActive = currentView === label;
    return (
        <button
            onClick={() => setView(label)}
            className={`flex items-center w-full px-4 py-3 transition-colors duration-200 ${
                isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="ml-4 font-medium hidden md:inline">{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, setView }) => {
    return (
        <aside className="flex flex-col w-16 md:w-64 bg-gray-800 text-white h-full">
            <div className="flex items-center justify-center md:justify-start h-20 border-b border-gray-700 px-4">
                <div className="bg-cyan-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a48,48,0,0,1-48,48,46.58,46.58,0,0,1-13.45-2.24,8,8,0,0,1,4-15.45,32,32,0,1,0,0-60.62,8,8,0,1,1,4-15.45A46.58,46.58,0,0,1,128,80,48,48,0,0,1,176,128Z"></path>
                    </svg>
                </div>
                <h1 className="text-xl font-bold ml-3 hidden md:inline">GAB Financial Solutions</h1>
            </div>
            <nav className="flex-1 mt-4">
                {currentUser.role === UserRole.ADMIN ? (
                    <>
                        <NavItem icon={<DashboardIcon />} label={View.DASHBOARD} currentView={currentView} setView={setView} />
                        <NavItem icon={<TransactionsIcon />} label={View.TRANSACTIONS} currentView={currentView} setView={setView} />
                        <NavItem icon={<AccountsIcon />} label={View.ACCOUNTS} currentView={currentView} setView={setView} />
                        <NavItem icon={<InventoryIcon />} label={View.INVENTORY} currentView={currentView} setView={setView} />
                        <NavItem icon={<ReconciliationIcon />} label={View.RECONCILIATION} currentView={currentView} setView={setView} />
                        <NavItem icon={<ReportsIcon />} label={View.REPORTS} currentView={currentView} setView={setView} />
                    </>
                ) : (
                    <NavItem icon={<InventoryIcon />} label={View.INVENTORY} currentView={currentView} setView={setView} />
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;