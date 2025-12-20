import React from 'react';
import { Bell, Search, HelpCircle, ChevronDown, Globe, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-6">
        {/* Left - Breadcrumb / Title */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">访问控制</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{title}</span>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="搜索产品 文档 API" 
              className="w-56 h-8 pl-9 text-sm bg-muted/50 border-0"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-2 hidden lg:block" />

          {/* Quick Actions */}
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
            <Globe className="w-4 h-4" />
            <span className="text-sm">控制台</span>
          </Button>

          <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
            <Headphones className="w-4 h-4" />
            <span className="text-sm">工单</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="w-4 h-4" />
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-2" />

          {/* User Menu */}
          <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted transition-colors">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">张</span>
            </div>
            <span className="text-sm text-foreground">zhangming</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Sub Header with Description */}
      {description && (
        <div className="px-6 py-3 border-t border-border/50 bg-background">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{description}</p>
            <span className="text-xs text-primary cursor-pointer hover:underline">相关文档</span>
          </div>
        </div>
      )}
    </header>
  );
}