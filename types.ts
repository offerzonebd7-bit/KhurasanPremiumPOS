
export type TransactionType = 'INCOME' | 'EXPENSE' | 'DUE';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  secretCode: string;
  currency: string;
  profilePic?: string;
  primaryColor?: string;
  accounts: string[];
}

export type Language = 'EN' | 'BN';
export type Theme = 'light' | 'dark';

export interface AppState {
  user: UserProfile | null;
  transactions: Transaction[];
  language: Language;
  theme: Theme;
}
