'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CustomerSupportPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Support</CardTitle>
                <CardDescription>Have a question or an issue? We're here to help.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="e.g., Issue with order #12345" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Please describe your issue in detail..." rows={6} />
                </div>
            </CardContent>
            <CardFooter>
                <Button>Submit Ticket</Button>
            </CardFooter>
        </Card>
    );
}
