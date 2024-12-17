// At the top of MainLayout.tsx
export interface MainLayoutProps {
  userId: string;
  user?: UserType; // if you need this
  children: React.ReactNode;
}

// Now remove the line: import { MainLayoutProps } from '../shared/components/mainLayout';


import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Package } from 'lucide-react';
import StreaksList from '../../posts/components/StreaksList';
import { User as UserType } from '../../projects/types/project';

// Navigation item type
interface NavItem {
  name: string;
  path: string;
  icon: typeof Home | typeof User | typeof Package;
}

const MainLayout = ({ userId, user, children }: MainLayoutProps & { userId: string }) => {
  const navItems: NavItem[] = [
    {
      name: 'Home',
      path: '/',
      icon: Home
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: Package
    },
    {
      name: 'Profile',
      path: `/profile/${userId}`,
      icon: User
    }
  ];

  return (
    <div className="flex min-h-screen">
      <div className="w-[240px] fixed h-full">
        {/* Navigation */}
        <div className="px-4 pt-4">
          <span className="text-xl font-bold inline-flex items-center mb-4">
            🌶️ KimchiBM
          </span>
          
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 hover:bg-gray-100 transition-colors text-gray-900 ${
                        isActive ? 'font-bold' : 'font-normal'
                      }`
                    }
                  >
                    <item.icon className="w-6 h-6 mr-4" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Streaks Section */}
        <div className="mt-8 px-4">
          <h2 className="text-xl font-bold mb-4">Streaks</h2>
          {user && <StreaksList currentUser={user} />}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-[240px]">
        <div className="max-w-[600px]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;