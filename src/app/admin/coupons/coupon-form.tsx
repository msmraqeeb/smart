
'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Coupon } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters.").max(50).transform(val => val.toUpperCase()),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Discount value must be positive."),
  expiresAt: z.date().optional(),
  minSpend: z.coerce.number().optional().default(0),
  status: z.enum(["active", "inactive"]),
  autoApply: z.boolean().default(false),
}).refine(data => {
    if (data.discountType === 'percentage' && (data.discountValue <= 0 || data.discountValue > 100)) {
        return false;
    }
    return true;
}, {
    message: "Percentage discount must be between 1 and 100.",
    path: ["discountValue"],
});

type CouponFormValues = z.infer<typeof formSchema>;

interface CouponFormProps {
  coupon?: Coupon;
  onSubmit: (data: any) => void;
}

export function CouponForm({ coupon, onSubmit }: CouponFormProps) {
  const router = useRouter();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: coupon?.code || "",
      discountType: coupon?.discountType || "fixed",
      discountValue: coupon?.discountValue || 0,
      expiresAt: coupon?.expiresAt ? coupon.expiresAt.toDate() : undefined,
      minSpend: coupon?.minSpend || undefined,
      status: coupon?.status || "active",
      autoApply: coupon?.autoApply || false,
    },
  });

  const handleFormSubmit = (data: CouponFormValues) => {
    const dataToSubmit = { 
        ...data,
        expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
    };
     if (!dataToSubmit.minSpend) {
      delete (dataToSubmit as any).minSpend;
    }
    if (!dataToSubmit.expiresAt) {
        delete (dataToSubmit as any).expiresAt;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g. SUMMER20" {...field} />
              </FormControl>
              <FormDescription>The code customers will enter at checkout. It will be converted to uppercase.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a discount type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder={form.getValues('discountType') === 'percentage' ? '10' : '100'} {...field} />
                </FormControl>
                 <FormDescription>
                    {form.getValues('discountType') === 'percentage' ? 'Percentage (e.g., 10 for 10%)' : 'Fixed amount in BDT'}
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="minSpend"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Minimum Spend (in BDT)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g. 500" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Optional. The minimum cart total to use this coupon.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormDescription>
                        Optional. The coupon will expire at the end of this day.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                <FormMessage />
                </FormItem>
            )}
        />
         <FormField
            control={form.control}
            name="autoApply"
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                    <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                <div className="space-y-1 leading-none">
                    <FormLabel>
                    Automatically Apply Coupon
                    </FormLabel>
                    <FormDescription>
                    If checked, this coupon will be automatically applied at checkout if its conditions are met and it's the best deal available.
                    </FormDescription>
                </div>
                </FormItem>
            )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">
                {coupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
