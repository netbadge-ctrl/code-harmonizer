import React from 'react';
import { Bell, Search, HelpCircle, ChevronDown, Globe, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate('/my-cli');
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between h-12 px-6">
        {/* Left - Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-base font-medium text-foreground">{title}</h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="搜索" 
              className="w-48 h-8 pl-8 text-sm bg-muted/50 border-border"
            />
          </div>

          {/* CLI Personal View Link */}
          <a 
            href="/my-cli" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            CLI个人视图
          </a>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <button 
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted transition-colors"
            onClick={handleUserClick}
            title="打开我的 CLI"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">陈</span>
            </div>
            <span className="text-sm text-foreground">chennan 陈楠</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}