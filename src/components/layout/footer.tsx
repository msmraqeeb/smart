
import Link from "next/link";
import { Leaf, MapPin, Phone, Mail, Send, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const companyLinks = [
  { href: "#", label: "Contact us" },
  { href: "#", label: "The blog" },
  { href: "#", label: "Terms and Conditions" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Shipping Policy" },
  { href: "#", label: "Return & Refund Policy" },
  { href: "#", label: "Warranty Policy" },
  { href: "#", label: "FAQ" },
];

const accountLinks = [
  { href: "/account", label: "My account" },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/wishlist", label: "My wishlist" },
  { href: "#", label: "Payment history" },
  { href: "#", label: "Support ticket" },
  { href: "/account/orders", label: "Order Tracking" },
  { href: "#", label: "Update Pricelist" },
  { href: "#", label: "Vendor Registration" },
];

const customerCareLinks = [
  { href: "#", label: "Customer Care" },
  { href: "/account/orders", label: "Track my order" },
  { href: "#", label: "Return & Refund" },
  { href: "#", label: "Shipping & Delivery" },
];

const socialIcons = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
]

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: GetMart Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-white">GetMart</span>
            </Link>
            <p className="text-sm mb-4">Islamic Lifestyle and Needs Solution in UK</p>
            <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-3"><MapPin className="h-4 w-4" /> London, UK</li>
                <li className="flex items-center gap-3"><Phone className="h-4 w-4" /> +8801234567890</li>
                <li className="flex items-center gap-3"><Mail className="h-4 w-4" /> sample@example.com</li>
            </ul>
            <div className="flex gap-2 mt-4">
                {socialIcons.map(social => (
                    <a key={social.label} href={social.href} className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-primary transition-colors">
                        <social.icon className="h-4 w-4 text-white" />
                    </a>
                ))}
            </div>
          </div>

          {/* Column 2: Company */}
          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {companyLinks.map(link => (
                <li key={link.label}><Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Accounts */}
          <div>
            <h3 className="font-bold text-white mb-4">Accounts</h3>
            <ul className="space-y-2 text-sm">
              {accountLinks.map(link => (
                <li key={link.label}><Link href={link.href} className="hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-bold text-white mb-4">Sign Up Newsletter</h3>
            <p className="text-xs mb-2">Don't worry, we won't spam you!</p>
            <form className="flex">
                <Input type="email" placeholder="Type Your E-mail" className="bg-white text-gray-800 rounded-r-none border-0" />
                <Button type="submit" className="rounded-l-none" size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
            <div className="mt-6">
                <h3 className="font-bold text-white mb-2">Download App on Mobile :</h3>
                <p className="text-xs mb-2">15% discount on your first purchase</p>
                <div className="flex gap-2">
                    <a href="#"><Image src="/images/google-play.png" alt="Get it on Google Play" width={135} height={40} /></a>
                    <a href="#"><Image src="/images/app-store.png" alt="Download on the App Store" width={120} height={40} /></a>
                </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-center md:text-left mb-4 md:mb-0">
                Copyright © {new Date().getFullYear()} GetCommerce Powered by <Link href="#" className="text-primary hover:underline">Getcommerce</Link>
            </p>
             <div className="max-w-xs">
                <Image src="/images/payment-methods.png" alt="Payment methods" width={300} height={25} />
            </div>
        </div>
      </div>
    </footer>
  );
}
