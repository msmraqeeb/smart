
'use client';
import { useForm, useFieldArray, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product, Category, ProductAttribute, Attribute } from "@/lib/types";
import { getCategories, getAttributes } from "@/lib/data";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from '@/components/image-uploader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Trash2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").refine(s => !s.includes(' '), "Slug cannot contain spaces."),
  sku: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  salePrice: z.coerce.number().optional().default(0),
  category: z.string().min(1, "Please select a category."),
  brand: z.string().optional(),
  featured: z.boolean(),
  imageUrls: z.array(z.string().url()).min(1, "At least one image is required."),
  attributes: z.array(z.object({
    name: z.string().min(1, "Attribute name is required."),
    options: z.array(z.string().min(1, "Option name is required.")).min(1, "At least one option is required."),
  })).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'reviews' | 'imageUrl' | 'imageHint'> & {imageUrls: string[], attributes?: ProductAttribute[]}) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalAttributes, setGlobalAttributes] = useState<Attribute[]>([]);
  const router = useRouter();

  useEffect(() => {
    getCategories().then(setCategories);
    getAttributes().then(setGlobalAttributes);
  }, []);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      sku: product?.sku || "",
      description: product?.description || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || undefined,
      category: product?.category || "",
      brand: product?.brand || "",
      featured: product?.featured || false,
      imageUrls: product?.imageUrls || [],
      attributes: product?.attributes || [],
    },
  });

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute, update: updateAttribute } = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  const watchName = form.watch("name");
  const watchImageUrls = form.watch("imageUrls");
  const watchAttributes = form.watch("attributes");

  useEffect(() => {
    if (watchImageUrls.length > 0) {
      form.clearErrors("imageUrls");
    }
  }, [watchImageUrls, form]);

  useEffect(() => {
    if (watchName && !form.getValues('slug')) {
        const slug = watchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        form.setValue('slug', slug);
    }
  }, [watchName, form]);

  const handleFormSubmit = (data: ProductFormValues) => {
    const dataToSubmit: any = { ...data };
    if (!dataToSubmit.salePrice) {
      delete dataToSubmit.salePrice;
    }
    onSubmit(dataToSubmit);
  };

  const handleSelectGlobalAttribute = (index: number, attributeId: string) => {
    const selectedAttr = globalAttributes.find(attr => attr.id === attributeId);
    if (selectedAttr) {
      updateAttribute(index, { name: selectedAttr.name, options: [] });
    }
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
        <div className="grid md:grid-cols-2 gap-8">
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
            name="sku"
            render={({ field }) => (
                <FormItem>
                <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. ORG-APL-001" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
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

        <FormField
            control={form.control}
            name="imageUrls"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                        <ImageUploader 
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                     <FormDescription>The first image will be used as the cover image.</FormDescription>
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
        
        <Card>
            <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
                <FormDescription>Add options like size or color. This will be used to create product variants.</FormDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {attributeFields.map((field, index) => {
                    const currentAttributeName = watchAttributes?.[index]?.name;
                    const globalAttribute = globalAttributes.find(attr => attr.name === currentAttributeName);
                    
                    return (
                        <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 text-destructive"
                                onClick={() => removeAttribute(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            
                            <div className="space-y-2">
                            <FormLabel>Use Global Attribute (Optional)</FormLabel>
                            <Select onValueChange={(value) => handleSelectGlobalAttribute(index, value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a global attribute..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {globalAttributes.map(attr => (
                                        <SelectItem key={attr.id} value={attr.id}>{attr.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name={`attributes.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1 w-full md:w-1/3">
                                            <FormLabel>Attribute Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Color" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <AttributeOptions 
                                    fieldName={`attributes.${index}.options`}
                                    globalAttribute={globalAttribute}
                                    form={form} 
                                />
                            </div>
                        </div>
                    );
                })}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAttribute({ name: '', options: [] })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Attribute
                </Button>
            </CardContent>
        </Card>

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


function AttributeOptions({ fieldName, globalAttribute, form }: { fieldName: `attributes.${number}.options`, globalAttribute?: Attribute, form: any }) {
    const { control } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: fieldName,
    });

    const [inputValue, setInputValue] = useState('');
    const currentOptions = form.watch(fieldName) || [];

    const handleAddOption = (option: string) => {
        const trimmedValue = option.trim();
        if (trimmedValue && !currentOptions.includes(trimmedValue)) {
            append(trimmedValue);
            setInputValue('');
        }
    };
    
    const availableGlobalOptions = globalAttribute?.values.filter(
        (value) => !currentOptions.includes(value)
    ) || [];

    return (
        <div className="flex-2 w-full md:w-2/3">
            <FormLabel>Options</FormLabel>
            <div className="flex gap-2">
                <Input
                    placeholder="e.g. Red"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption(inputValue);
                        }
                    }}
                />
                <Button type="button" onClick={() => handleAddOption(inputValue)}>Add</Button>
            </div>
             <FormDescription>Enter an option and click Add or press Enter. These are the choices for the attribute.</FormDescription>
             
             {availableGlobalOptions.length > 0 && (
                <div className="mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground">Available options for '{globalAttribute?.name}':</p>
                    <div className="flex flex-wrap gap-1">
                        {availableGlobalOptions.map(value => (
                            <Badge 
                                key={value} 
                                variant="secondary" 
                                className="cursor-pointer hover:bg-primary/20"
                                onClick={() => handleAddOption(value)}
                            >
                                {value}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
                        <span>{form.getValues(`${fieldName}.${index}`)}</span>
                        <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

