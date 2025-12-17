
import { Suspense } from 'react';
import { ProductsPageContent } from '@/components/products-page-content';
import { Skeleton } from '@/components/ui/skeleton';

function ProductsPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-4 gap-8">
                <aside className="md:col-span-1 space-y-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </aside>
                <main className="md:col-span-3">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}


export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductsPageSkeleton />} >
            <ProductsPageContent />
        </Suspense>
    );
}
