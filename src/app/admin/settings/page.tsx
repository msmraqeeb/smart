
'use client';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import withAdminAuth from '@/components/withAdminAuth';
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  storeName: z.string().min(2, "Store name is required."),
  address: z.string().min(5, "Address is required."),
  contactNumber: z.string().min(10, "A valid contact number is required."),
  email: z.string().email("Invalid email address."),
  social: z.object({
    facebook: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
  }).optional(),
  slideBanners: z.array(z.string().url()).max(3, "You can add a maximum of 3 slide banners.").optional(),
  sideBanners: z.array(z.string().url()).max(2, "You can add a maximum of 2 side banners.").optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

// Moved outside the component to prevent re-creation on every render
const initialValues: SettingsFormValues = {
    logoUrl: '',
    storeName: '',
    address: '',
    contactNumber: '',
    email: '',
    social: { facebook: '', twitter: '', instagram: '' },
    slideBanners: [],
    sideBanners: [],
};


function SettingsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const settingsRef = firestore ? doc(firestore, 'settings', 'storeDetails') : null;
    const { data: settings, loading } = useDoc(settingsRef);

     const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                logoUrl: settings.logoUrl || '',
                storeName: settings.storeName || '',
                address: settings.address || '',
                contactNumber: settings.contactNumber || '',
                email: settings.email || '',
                social: settings.social || { facebook: '', twitter: '', instagram: '' },
                slideBanners: settings.slideBanners || [],
                sideBanners: settings.sideBanners || [],
            });
        }
    }, [settings, form.reset]);


    const onSubmit = async (data: SettingsFormValues) => {
        if (!settingsRef) return;
        try {
            await setDoc(settingsRef, data, { merge: true });
            toast({
                title: "Settings Saved",
                description: "Your store settings have been updated.",
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: 'destructive',
                title: "Uh oh! Something went wrong.",
                description: "There was a problem saving your settings.",
            });
        }
    };

    if (loading) {
        return (
             <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
             </div>
        )
    }

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Identity</CardTitle>
                            <CardDescription>Update your store's logo and name.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <FormField
                                control={form.control}
                                name="logoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Store Logo</FormLabel>
                                        <FormControl>
                                            <ImageUploader
                                                value={field.value ? [field.value] : []}
                                                onChange={(urls) => field.onChange(urls[0] || '')}
                                            />
                                        </FormControl>
                                        <FormDescription>Recommended size: 200x50 pixels.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="storeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Store Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Store Details</CardTitle>
                            <CardDescription>Update your store's contact information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl><Textarea {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Number</FormLabel>
                                        <FormControl><Input type="tel" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Email</FormLabel>
                                        <FormControl><Input type="email" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media</CardTitle>
                            <CardDescription>Links to your social media profiles.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="social.facebook"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Facebook URL</FormLabel>
                                        <FormControl><Input placeholder="https://facebook.com/yourpage" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="social.twitter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Twitter (X) URL</FormLabel>
                                        <FormControl><Input placeholder="https://x.com/yourprofile" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="social.instagram"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instagram URL</FormLabel>
                                        <FormControl><Input placeholder="https://instagram.com/yourprofile" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Homepage Banners</CardTitle>
                            <CardDescription>Update the main slider and side banners on your homepage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="slideBanners"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slider Banners (Max 3)</FormLabel>
                                        <FormControl>
                                            <ImageUploader
                                                value={field.value || []}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>Recommended size: 872x468 pixels.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="sideBanners"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Side Banners (Max 2)</FormLabel>
                                        <FormControl>
                                            <ImageUploader
                                                value={field.value || []}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                         <FormDescription>Recommended size: 424x226 pixels.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default withAdminAuth(SettingsPage);
