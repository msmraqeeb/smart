
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import withAdminAuth from '@/components/withAdminAuth';
import { useCollection } from "@/firebase";
import { collection, query, orderBy, writeBatch, doc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Order = {
    id: string;
    customer: { fullName: string };
    createdAt: any;
    total: number;
    status: string;
};

function AdminOrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const ordersCollection = React.useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: orders, loading, error } = useCollection<Order>(ordersCollection);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true && orders) {
            setSelectedOrders(orders.map(o => o.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleSelectRow = (orderId: string, checked: boolean) => {
        if (checked) {
            setSelectedOrders(prev => [...prev, orderId]);
        } else {
            setSelectedOrders(prev => prev.filter(id => id !== orderId));
        }
    };
    
    const handleBulkStatusChange = async () => {
        if (!firestore || !statusToUpdate || selectedOrders.length === 0) return;

        const batch = writeBatch(firestore);
        selectedOrders.forEach(orderId => {
            const orderRef = doc(firestore, 'orders', orderId);
            batch.update(orderRef, { status: statusToUpdate });
        });

        try {
            await batch.commit();
            toast({
                title: "Orders Updated",
                description: `${selectedOrders.length} orders have been updated to "${statusToUpdate}".`
            });
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: 'There was a problem updating the orders.'
            });
        } finally {
            setSelectedOrders([]);
            setStatusToUpdate(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!firestore || selectedOrders.length === 0) return;

        const batch = writeBatch(firestore);
        selectedOrders.forEach(orderId => {
            const orderRef = doc(firestore, 'orders', orderId);
            batch.delete(orderRef);
        });

         try {
            await batch.commit();
            toast({
                title: "Orders Deleted",
                description: `${selectedOrders.length} orders have been successfully deleted.`
            });
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Delete failed',
                description: 'There was a problem deleting the orders.'
            });
        } finally {
            setSelectedOrders([]);
            setIsDeleteDialogOpen(false);
        }
    }


    const isAllSelected = orders ? selectedOrders.length === orders.length : false;
    const isSomeSelected = selectedOrders.length > 0 && !isAllSelected;

    if (loading) {
        return (
             <div>
                <p>Loading orders...</p>
            </div>
        );
    }
    
    if (error) {
         return (
             <div>
                <p>Error loading orders. Please try again later.</p>
            </div>
        );
    }

    return (
        <div>
             <AlertDialog open={!!statusToUpdate} onOpenChange={() => setStatusToUpdate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the status of {selectedOrders.length} selected orders to "{statusToUpdate}"?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkStatusChange}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete {selectedOrders.length} selected orders.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>All Orders</CardTitle>
                            <CardDescription>View and manage all customer orders.</CardDescription>
                        </div>
                        {selectedOrders.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Actions ({selectedOrders.length})
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => setStatusToUpdate('Processing')}>Change status to Processing</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setStatusToUpdate('Shipped')}>Change status to Shipped</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setStatusToUpdate('Delivered')}>Change status to Delivered</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setStatusToUpdate('Cancelled')}>Change status to Cancelled</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onSelect={() => setIsDeleteDialogOpen(true)}>
                                        Delete Selected
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox 
                                        onCheckedChange={handleSelectAll}
                                        checked={isAllSelected}
                                        aria-label="Select all rows"
                                        indeterminate={isSomeSelected}
                                    />
                                </TableHead>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order) => (
                                <TableRow key={order.id} data-state={selectedOrders.includes(order.id) && "selected"}>
                                    <TableCell>
                                         <Checkbox 
                                            onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                                            checked={selectedOrders.includes(order.id)}
                                            aria-label={`Select row for order ${order.id}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer?.fullName}</TableCell>
                                    <TableCell>{order.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell>{formatCurrency(order.total)}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={
                                                order.status === 'Shipped' ? 'default' : 
                                                order.status === 'Processing' ? 'secondary' :
                                                order.status === 'Delivered' ? 'outline' :
                                                'destructive'
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="icon">
                                            <Link href={`/admin/orders/${order.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit Order</span>
                                            </Link>
                                        </Button>
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

export default withAdminAuth(AdminOrdersPage);

    