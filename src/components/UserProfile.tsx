import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Heart, ShoppingBag, LogOut, Home } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => setShowAuthModal(true)}
          className="text-sm"
        >
          Sign In
        </Button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  const initials = user.user_metadata?.display_name 
    ? user.user_metadata.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">
              {user.user_metadata?.display_name || user.email}
            </p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          // Placeholder for Profile page navigation
          toast({
            title: "Feature Coming Soon",
            description: "Your profile page is under construction!",
          });
          // navigate('/profile'); // Uncomment and implement when profile page exists
        }}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          // Placeholder for Favorites page navigation
          toast({
            title: "Feature Coming Soon",
            description: "Your favorites list is under construction!",
          });
          // navigate('/favorites'); // Uncomment and implement when favorites page exists
        }}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Favorites</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          // Placeholder for Orders page navigation
          toast({
            title: "Feature Coming Soon",
            description: "Your order history is under construction!",
          });
          // navigate('/orders'); // Uncomment and implement when orders page exists
        }}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>Orders</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          // Placeholder for Settings page navigation
          toast({
            title: "Feature Coming Soon",
            description: "Your settings page is under construction!",
          });
          // navigate('/settings'); // Uncomment and implement when settings page exists
        }}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => {
          const { error } = await signOut();
          if (error) {
            toast({
              title: "Sign out failed",
              description: error.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signed out",
              description: "You have been successfully signed out.",
            });
            navigate('/'); // Redirect to home page after sign out
          }
        }}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};