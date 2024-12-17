import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Package } from 'lucide-react';

interface NavigationProps {
  userId: string;
  children: React.ReactNode;
}

const Navigation = ({ userId, children }: NavigationProps) => {
  const navItems = [
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
    <div className="flex justify-center min-h-screen">
      <div className="flex w-full max-w-[1000px] relative">
        {/* Left Navigation */}
        <div className="w-[275px] flex flex-col fixed">
          <nav className="px-3 py-2 flex flex-col h-full">
            <div className="px-3 py-4">
              <span className="text-xl font-bold inline-flex items-center">
                🌶️ Kimchi Ship
              </span>
            </div>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 transition-colors ${
                        isActive ? 'font-bold' : ''
                      }`
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 ml-[275px]">
          <div className="max-w-2xl w-full border-x border-gray-200 min-h-screen bg-white">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Navigation;