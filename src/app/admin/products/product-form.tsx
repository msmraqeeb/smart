
'use client';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product, Category } from "@/lib/types";
import { getCategories } from "@/lib/data";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").refine(s => !s.includes(' '), "Slug cannot contain spaces."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  salePrice: z.coerce.number().optional().default(0),
  category: z.string().min(1, "Please select a category."),
  brand: z.string().optional(),
  featured: z.boolean(),
  imageUrls: z.array(z.object({ value: z.string().url("Please enter a valid URL.") })).min(1, "At least one image URL is required."),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'reviews' | 'imageUrl' | 'imageHint'> & {imageUrls: string[]}) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || undefined,
      category: product?.category || "",
      brand: product?.brand || "",
      featured: product?.featured || false,
      imageUrls: product?.imageUrls?.map(url => ({ value: url })) || [{ value: "" }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "imageUrls"
  });

  const watchName = form.watch("name");

  useEffect(() => {
    if (watchName && !form.getValues('slug')) {
        const slug = watchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        form.setValue('slug', slug);
    }
  }, [watchName, form]);
  
  const handleFormSubmit = (data: ProductFormValues) => {
    const dataToSubmit: any = { ...data, imageUrls: data.imageUrls.map(url => url.value) };
    if (!dataToSubmit.salePrice) {
      delete dataToSubmit.salePrice;
    }
    onSubmit(dataToSubmit);
  };
  
    const sortedCategories = useMemo(() => {
        const categoryMap = new Map(categories.map(c => [c.id, { ...c, children: [] as Category[] }]));
        const topLevelCategories: (Category & { children: Category[] })[] = [];

        categories.forEach(category => {
            if (category.parentId && categoryMap.has(category.parentId)) {
                categoryMap.get(category.parentId)?.children.push(categoryMap.get(category.id)!);
            } else {
                topLevelCategories.push(categoryMap.get(category.id)!);
            }
        });

        const flattened: Category[] = [];
        const flatten = (cats: (Category & { children: Category[] })[], depth = 0) => {
            cats.sort((a, b) => a.name.localeCompare(b.name));
            for (const cat of cats) {
                flattened.push({ ...cat, name: `${'— '.repeat(depth)}${cat.name}` });
                if (cat.children.length > 0) {
                    flatten(cat.children, depth + 1);
                }
            }
        };

        flatten(topLevelCategories);
        return flattened;
    }, [categories]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Organic Apples" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g. organic-apples" {...field} />
              </FormControl>
              <FormDescription>This is the URL-friendly version of the name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="A short description of the product..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-3 gap-8">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (in BDT)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="99.99" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Sale Price (in BDT)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="79.99" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Optional. If set, this will be the displayed price.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {sortedCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="e.g. FreshFarms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div>
            <Label>Product Image URLs</Label>
            <div className="space-y-4 mt-2">
                 {fields.map((field, index) => (
                    <FormField
                    key={field.id}
                    control={form.control}
                    name={`imageUrls.${index}.value`}
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input type="url" placeholder="https://..." {...field} />
                                </FormControl>
                                {fields.length > 1 && (
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <FormDescription>
                                {index === 0 ? "This is the primary product image." : `Additional image ${index + 1}.`}
                            </FormDescription>
                             <FormMessage />
                        </FormItem>
                    )}
                    />
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: "" })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Image URL
                </Button>
            </div>
        </div>
        <FormField
            control={form.control}
            name="featured"
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
                    Featured Product
                    </FormLabel>
                    <FormDescription>
                    Featured products will be displayed on the homepage carousel.
                    </FormDescription>
                </div>
                </FormItem>
            )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">
                {product ? 'Save Changes' : 'Create Product'}
            </Button>
        </div>
      </form>
    </Form>
  );
}

