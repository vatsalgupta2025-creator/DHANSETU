'use client';
import React, { useState, createContext, useContext } from 'react';
import { generateLoanData, LoanRecord } from '@/lib/data';
import type { AppLanguage } from '@/components/LanguageSelector';
import type { BankConfig } from '@/components/BankSelector';

// Notification system
export interface BankNotification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

// User details
export interface UserDetails {
    name: string;
    phone: string;
}

// Global context for shared state
interface AppContextType {
    loanData: LoanRecord[];
    activePage: string;
    setActivePage: (page: string) => void;
    selectedRecord: LoanRecord | null;
    setSelectedRecord: (r: LoanRecord | null) => void;
    // Global language
    appLanguage: AppLanguage;
    setAppLanguage: (lang: AppLanguage) => void;
    // Selected Indian bank
    selectedBank: BankConfig | null;
    setSelectedBank: (bank: BankConfig) => void;
    // User role
    userRole: 'admin' | 'user';
    setUserRole: (role: 'admin' | 'user') => void;
    // Customer 360 view
    selectedBorrower: LoanRecord | null;
    setSelectedBorrower: (r: LoanRecord | null) => void;
    // Notifications
    notifications: BankNotification[];
    addNotification: (notification: Omit<BankNotification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;
    // User details
    userDetails: UserDetails | null;
    setUserDetails: (details: UserDetails) => void;
}

const DEFAULT_LANGUAGE: AppLanguage = {
    code: 'en-IN', name: 'English', nativeName: 'English',
    greeting: 'Welcome to DhanSetu', tagline: 'AI-powered debt recovery platform',
    selectBtn: 'Continue in English', flag: '🇮🇳', region: 'Pan India',
};

export const AppContext = createContext<AppContextType>({
    loanData: [],
    activePage: 'dashboard',
    setActivePage: () => { },
    selectedRecord: null,
    setSelectedRecord: () => { },
    appLanguage: DEFAULT_LANGUAGE,
    setAppLanguage: () => { },
    selectedBank: null,
    setSelectedBank: () => { },
    userRole: 'admin',
    setUserRole: () => { },
    selectedBorrower: null,
    setSelectedBorrower: () => { },
    notifications: [],
    addNotification: () => { },
    markNotificationRead: () => { },
    clearNotifications: () => { },
    userDetails: null,
    setUserDetails: () => { },
});

export function useApp() {
    return useContext(AppContext);
}

// Generate data once
const LOAN_DATA = generateLoanData(500);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedRecord, setSelectedRecord] = useState<LoanRecord | null>(null);
    const [appLanguage, setAppLanguage] = useState<AppLanguage>(DEFAULT_LANGUAGE);
    const [selectedBank, setSelectedBank] = useState<BankConfig | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'user'>('admin');
    const [selectedBorrower, setSelectedBorrower] = useState<LoanRecord | null>(null);
    const [notifications, setNotifications] = useState<BankNotification[]>([]);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

    let notifCounter = 0;
    const addNotification = (n: Omit<BankNotification, 'id' | 'timestamp' | 'read'>) => {
        notifCounter += 1;
        setNotifications(prev => [{ ...n, id: `${Date.now()}-${notifCounter}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date(), read: false }, ...prev]);
    };
    const markNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    const clearNotifications = () => setNotifications([]);

    return (
        <AppContext.Provider value={{
            loanData: LOAN_DATA,
            activePage,
            setActivePage,
            selectedRecord,
            setSelectedRecord,
            appLanguage,
            setAppLanguage,
            selectedBank,
            setSelectedBank,
            userRole,
            setUserRole,
            selectedBorrower,
            setSelectedBorrower,
            notifications,
            addNotification,
            markNotificationRead,
            clearNotifications,
            userDetails,
            setUserDetails,
        }}>
            {children}
        </AppContext.Provider>
    );
}
