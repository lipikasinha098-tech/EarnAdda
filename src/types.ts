export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  balance: number;
}

export interface UserActivity {
  id: string;
  type: 'spin' | 'scratch' | 'ad' | 'survey' | 'review' | 'referral';
  amount: number;
  description: string;
  timestamp: any;
}
