import React from 'react';
import { LogOut, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  currentUser: string;
  onLogout: () => void;
  dashboardTitle: string;
}

const Header = ({ currentUser, onLogout, dashboardTitle }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center h-10">
             <span className="text-2xl font-bold text-blue-600">Hexaware</span>
          </div>
          <div className="border-l border-gray-300 h-8"></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{dashboardTitle}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                {currentUser.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">{currentUser}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
