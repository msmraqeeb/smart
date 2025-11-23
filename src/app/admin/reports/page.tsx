
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import withAdminAuth from '@/components/withAdminAuth';
import { useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TrendingUp, ShoppingBag, Users } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn, formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

function ReportsPage() {
    const firestore = useFirestore();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -29),
        to: new Date(),
    });

    const ordersQuery = React.useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: allOrders, loading: loadingOrders } = useCollection(ordersQuery);

    const filteredOrders = useMemo(() => {
        if (!allOrders || !dateRange?.from || !dateRange?.to) return [];
        return allOrders.filter(order => {
            const orderDate = order.createdAt?.toDate();
            if (!orderDate) return false;
            return isWithinInterval(orderDate, { start: startOfDay(dateRange.from!), end: endOfDay(dateRange.to!) });
        });
    }, [allOrders, dateRange]);

    const salesReport = useMemo(() => {
        if (filteredOrders.length === 0) return { totalSales: 0, totalOrders: 0, avgOrderValue: 0, salesByDay: [] };

        const totalSales = filteredOrders.reduce((acc, order) => acc + order.total, 0);
        const totalOrders = filteredOrders.length;
        const avgOrderValue = totalSales / totalOrders;

        const salesByDay = filteredOrders.reduce((acc, order) => {
            const date = format(order.createdAt.toDate(), 'yyyy-MM-dd');
            if (!acc[date]) {
                acc[date] = { date, total: 0 };
            }
            acc[date].total += order.total;
            return acc;
        }, {} as { [key: string]: { date: string; total: number } });

        return {
            totalSales,
            totalOrders,
            avgOrderValue,
            salesByDay: Object.values(salesByDay).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };
    }, [filteredOrders]);

    const productsReport = useMemo(() => {
        const productStats: { [key: string]: { name: string; unitsSold: number; totalRevenue: number } } = {};
        
        filteredOrders.forEach(order => {
            order.items.forEach((item: any) => {
                if (!productStats[item.id]) {
                    productStats[item.id] = { name: item.name, unitsSold: 0, totalRevenue: 0 };
                }
                productStats[item.id].unitsSold += item.quantity;
                productStats[item.id].totalRevenue += item.price * item.quantity;
            });
        });

        return Object.values(productStats).sort((a, b) => b.unitsSold - a.unitsSold);
    }, [filteredOrders]);

     const customersReport = useMemo(() => {
        const customerStats: { [key: string]: { name: string; email: string; totalSpent: number; orderCount: number } } = {};
        
        filteredOrders.forEach(order => {
            if (!order.userId && !order.customer.email) return;
            const customerId = order.userId || order.customer.email;

            if (!customerStats[customerId]) {
                customerStats[customerId] = { 
                    name: order.customer.fullName, 
                    email: order.customer.email,
                    totalSpent: 0, 
                    orderCount: 0 
                };
            }
            customerStats[customerId].totalSpent += order.total;
            customerStats[customerId].orderCount += 1;
        });

        return Object.values(customerStats).sort((a, b) => b.totalSpent - a.totalSpent);
    }, [filteredOrders]);

    if (loadingOrders) {
        return <p>Loading reports...</p>
    }
    
    const chartConfig = {
        total: {
          label: 'Sales',
          color: 'hsl(var(--primary))',
        },
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div>
                    <h1 className="font-headline text-3xl font-bold">Reports</h1>
                    <p className="text-muted-foreground mt-1">Detailed analytics for your store.</p>
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            
             <Tabs defaultValue="sales">
                <TabsList>
                    <TabsTrigger value="sales">Sales Report</TabsTrigger>
                    <TabsTrigger value="products">Products Report</TabsTrigger>
                    <TabsTrigger value="customers">Customers Report</TabsTrigger>
                </TabsList>
                <TabsContent value="sales" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(salesReport.totalSales)}</div>
                                <p className="text-xs text-muted-foreground">in the selected period</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{salesReport.totalOrders}</div>
                                <p className="text-xs text-muted-foreground">Total orders placed</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(salesReport.avgOrderValue)}</div>
                                <p className="text-xs text-muted-foreground">Average across all orders</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                                <BarChart data={salesReport.salesByDay}>
                                    <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), "MMM d")} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(value as number)}`} />
                                    <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>A list of all orders in the selected date range.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono">{order.id}</TableCell>
                                            <TableCell>{format(order.createdAt.toDate(), "PPP")}</TableCell>
                                            <TableCell>{order.customer.fullName}</TableCell>
                                            <TableCell>{order.status}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products Report</CardTitle>
                            <CardDescription>Best-selling products in the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Units Sold</TableHead>
                                        <TableHead className="text-right">Total Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productsReport.map(product => (
                                        <TableRow key={product.name}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.unitsSold}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(product.totalRevenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="customers">
                     <Card>
                        <CardHeader>
                            <CardTitle>Customers Report</CardTitle>
                            <CardDescription>Top customers by total spend in the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead className="text-right">Total Spent</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customersReport.map(customer => (
                                        <TableRow key={customer.email}>
                                            <TableCell className="font-medium">{customer.name}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{customer.orderCount}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default withAdminAuth(ReportsPage);
