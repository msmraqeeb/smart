'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const isAdminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

      if (!isAdminLoggedIn) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You must be logged in as an admin to view this page.',
        });
        router.replace('/admin/login');
      } else {
        setIsAdmin(true);
      }
    }, [router, toast]);

    if (!isAdmin) {
      return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  Wrapper.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default withAdminAuth;
