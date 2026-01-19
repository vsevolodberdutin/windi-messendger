export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}

export const CURRENT_USER: User = {
  id: 'current-user',
  name: 'You',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user',
  isOnline: true
};
