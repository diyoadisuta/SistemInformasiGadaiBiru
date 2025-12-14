import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export interface Customer {
    id: number;
    name: string;
    nik: string;
    phone: string;
    address: string;
    created_at?: string;
    updated_at?: string;
}

export interface TransactionItem {
    id: number;
    transaction_id: number;
    name: string;
    category: string;
    brand: string;
    serial_number?: string;
    description?: string;
    estimated_value: number;
    transaction?: Transaction;
}

export interface Transaction {
    id: number;
    transaction_number: string;
    customer_id: number;
    customer: Customer;
    status: 'active' | 'completed' | 'overdue' | 'auctioned';
    loan_amount: number;
    interest_rate: number;
    interest_amount: number;
    start_date: string;
    due_date: string;
    created_at?: string;
    completed_at?: string;
    items: TransactionItem[];
}

export default api;
