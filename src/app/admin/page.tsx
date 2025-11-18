import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered, Package, Users } from "lucide-react";
import Link from "next/link";

const adminLinks = [
    {
        href: "/admin/orders",
        icon: ListOrdered,
        title: "Manage Orders",
        description: "View and process customer orders."
    },
    {
        href: "/admin/products",
        icon: Package,
        title: "Manage Products",
        description: "Add, edit, and remove products from the store."
    },
     {
        href: "/admin/users",
        icon: Users,
        title: "Manage Users",
        description: "View and manage customer accounts."
    }
]

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the GetMart control center.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map(link => (
            <Link href={link.href} key={link.href}>
                <Card className="h-full hover:bg-card/95 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <link.icon className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-xl">{link.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}