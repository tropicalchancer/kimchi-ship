import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SignOut = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Redirect to home/login page after successful sign out
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
    </button>
  );
};

export default SignOut;