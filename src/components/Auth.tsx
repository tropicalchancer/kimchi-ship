import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

const AuthComponent = () => {
  useEffect(() => {
    // Listen for auth state changes
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event); // Logs SIGNED_IN, SIGNED_OUT, etc.
      console.log('Session:', session); // Logs the current session
    });

    // Cleanup listener on unmount
    return () => {
      subscription.data?.subscription.unsubscribe(); // Ensure the unsubscribe is accessed correctly
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-4">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['github']}
        theme="dark"
        showLinks={true}
        view="sign_in"
      />
    </div>
  );
};

export default AuthComponent;
