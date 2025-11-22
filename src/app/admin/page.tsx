
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListOrdered, Package, Users, LogOut, Truck, LayoutGrid, DollarSign, CreditCard } from "lucide-react";
import Link from "next/link";
import withAdminAuth from "@/components/withAdminAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCollection, useFirestore } from "@/firebase";
import React, { useMemo } from "react";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { subDays, format } from 'date-fns';

function AdminPage() {
  const router = useRouter();
  const firestore = useFirestore();

  const handleSignOut = () => {
    localStorage.removeItem('admin_logged_in');
    router.push('/admin/login');
  };

  const ordersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const recentOrdersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore]);

  const productsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);
  const { data: recentOrders, loading: recentOrdersLoading } = useCollection(recentOrdersQuery);
  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  const stats = useMemo(() => {
    if (!orders || !products) return { totalRevenue: 0, totalSales: 0, totalProducts: 0 };
    
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const totalSales = orders.length;
    const totalProducts = products.length;

    return { totalRevenue, totalSales, totalProducts };
  }, [orders, products]);

  const salesData = useMemo(() => {
    if (!orders) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return {
            date: format(date, 'MMM d'),
            total: 0,
        };
    }).reverse();

    orders.forEach(order => {
        const orderDate = order.createdAt?.toDate();
        if (orderDate) {
            const dayEntry = last7Days.find(d => d.date === format(orderDate, 'MMM d'));
            if (dayEntry) {
                dayEntry.total += order.total;
            }
        }
    });

    return last7Days;
  }, [orders]);


  const loading = ordersLoading || productsLoading || recentOrdersLoading;

  const chartConfig = {
    total: {
      label: 'Sales',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">An overview of your store's performance.</p>
        </div>
      </div>
      
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">From {stats.totalSales} orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalSales}</div>
                        <p className="text-xs text-muted-foreground">Total orders placed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">Total products in store</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Total sales in the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={salesData}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(value as number)}`} />
                            <ChartTooltip
                                cursor={{fill: 'hsl(var(--muted))'}}
                                content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                            />
                            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                </Card>

                 <Card className="col-span-4 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>The last 5 orders placed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {recentOrders?.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.customer.fullName}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {order.customer.email}
                                        </div>
                                    </TableCell>
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
                                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                </TableRow>
                            ))}
                         </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  );
}

export default withAdminAuth(AdminPage);
