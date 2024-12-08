import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];

interface FeedHeaderProps {
  user: DbUser | null;
}

const FeedHeader = ({ user }: FeedHeaderProps) => {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
         
        </div>
        {user && (
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedHeader;