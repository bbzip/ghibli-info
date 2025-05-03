import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import supabase from '../../../utils/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    
    // Update generation count
    const { error } = await supabase
      .from('users')
      .update({
        generation_count: supabase.rpc('increment_generation_count'),
        login_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating generation count:', error);
      return res.status(500).json({ error: 'Failed to update generation count' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in increment-generation API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 