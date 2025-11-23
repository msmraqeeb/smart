
'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getCoupons } from '@/lib/data';
import type { Coupon } from '@/lib/types';
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
    const firestore = useFirestore();
    const { toast } = useToast();

    const fetchCoupons = () => {
        getCoupons().then(setCoupons);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);
    
    const handleDelete = async () => {
        if (!couponToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, "coupons", couponToDelete.id));
            toast({
                title: "Coupon Deleted",
                description: `"${couponToDelete.code}" has been successfully deleted.`,
            });
            setCouponToDelete(null);
            fetchCoupons(); // Refetch coupons after deletion
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error deleting coupon",
                description: "There was a problem deleting the coupon. Please try again.",
            });
        }
    };

    return (
        <div>
            <AlertDialog open={!!couponToDelete} onOpenChange={(open) => !open && setCouponToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the coupon
                            "{couponToDelete?.code}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex justify-between items-center mb-6">
                <div>
                   {/* Title is now in the layout header */}
                </div>
                <Button asChild>
                    <Link href="/admin/coupons/new">Add New Coupon</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                    <CardDescription>View, edit, or delete discount coupons.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Min. Spend</TableHead>
                                <TableHead>Expires At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map(coupon => (
                                <TableRow key={coupon.id}>
                                    <TableCell className='font-mono'>{coupon.code}</TableCell>
                                    <TableCell>
                                        {coupon.discountType === 'fixed' 
                                            ? formatCurrency(coupon.discountValue) 
                                            : `${coupon.discountValue}%`}
                                    </TableCell>
                                    <TableCell>{coupon.minSpend ? formatCurrency(coupon.minSpend) : 'N/A'}</TableCell>
                                    <TableCell>{coupon.expiresAt ? format(coupon.expiresAt.toDate(), 'PPP') : 'No Expiry'}</TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.status === 'active' ? 'default' : 'destructive'}>
                                            {coupon.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/coupons/edit/${coupon.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setCouponToDelete(coupon)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(AdminCouponsPage);
