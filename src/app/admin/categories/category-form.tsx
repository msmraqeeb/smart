
'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").refine(s => !s.includes(' '), "Slug cannot contain spaces."),
  imageUrl: z.string().url("Please enter a valid URL."),
  imageHint: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormValues) => void;
}

export function CategoryForm({ category, onSubmit }: CategoryFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      imageUrl: category?.imageUrl || "",
      imageHint: category?.imageHint || "",
      parentId: category?.parentId || "none",
    },
  });

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const watchName = form.watch("name");

  useEffect(() => {
    if (watchName && !form.getValues('slug')) {
        const slug = watchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        form.setValue('slug', slug);
    }
  }, [watchName, form]);

  const handleFormSubmit = (data: CategoryFormValues) => {
    const dataToSubmit = { ...data };
    if (dataToSubmit.parentId === 'none') {
      dataToSubmit.parentId = '';
    }
    onSubmit(dataToSubmit);
  };

  const possibleParents = categories.filter(c => c.id !== category?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Fresh Vegetables" {...field} />
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
                <Input placeholder="e.g. fresh-vegetables" {...field} />
              </FormControl>
              <FormDescription>This is the URL-friendly version of the name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a parent category (optional)" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="none">None (Top-Level Category)</SelectItem>
                        {possibleParents.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <FormDescription>Assign this to a parent to create a sub-category.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>Link to the category image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="imageHint"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Image AI Hint</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. fresh vegetables" {...field} />
                </FormControl>
                <FormDescription>Keywords for AI image search (max 2 words).</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">
                {category ? 'Save Changes' : 'Create Category'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
