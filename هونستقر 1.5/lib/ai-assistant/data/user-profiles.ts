import { query } from '@/lib/db';

export async function getUserProfile(userId: string) {
  try {
    const user = await query<any>('SELECT name, email, role FROM users WHERE id = ?', [userId]);
    return user[0] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
