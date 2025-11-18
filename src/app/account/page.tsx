import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListOrdered, MapPin, User, LogOut } from "lucide-react";

const dashboardLinks = [
    {
        href: "/account/orders",
        icon: ListOrdered,
        title: "My Orders",
        description: "View your order history and track shipments."
    },
    {
        href: "/account/addresses",
        icon: MapPin,
        title: "My Addresses",
        description: "Manage your saved shipping and billing addresses."
    },
     {
        href: "/account/profile",
        icon: User,
        title: "Profile Settings",
        description: "Update your personal information and password."
    }
]

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-2">Welcome back, User!</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardLinks.map(link => (
            <Link href={link.href} key={link.href}>
                <Card className="h-full hover:bg-card/95 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <link.icon className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="font-headline text-xl">{link.title}</CardTitle>
                            <CardDescription>{link.description}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
        ))}
        <Card className="h-full hover:bg-card/95 hover:shadow-md transition-all">
            <CardHeader>
                 <Button variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </CardHeader>
        </Card>
      </div>
    </div>
  );
}
