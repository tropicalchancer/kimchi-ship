import { Database } from '../../shared/types/database.types';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];

interface AuthGateProps {
  user: DbUser | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGate = ({ user, children, fallback }: AuthGateProps) => {
  if (!user) {
    return (
      fallback || (
        <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
          <p>Please sign in to access this feature</p>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default AuthGate;