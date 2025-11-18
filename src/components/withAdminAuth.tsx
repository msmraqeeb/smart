'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
      // Since this is a client component, we can check for localStorage.
      const isAdminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

      if (!isAdminLoggedIn) {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You must be logged in as an admin to view this page.',
        });
        router.replace('/admin/login');
      }
    }, [router, toast]);

    const isAdminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true';

    // Render a loading state or null while checking auth status
    if (!isAdminLoggedIn) {
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