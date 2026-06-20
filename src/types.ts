export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  balance: number;
  ipAddress?: string;
}

export interface UserActivity {
  id: string;
  type: 'spin' | 'scratch' | 'ad' | 'survey' | 'review' | 'referral';
  amount: number;
  description: string;
  timestamp: any;
}
