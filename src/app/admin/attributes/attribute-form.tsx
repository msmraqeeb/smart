
'use client';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Attribute } from "@/lib/types";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  values: z.array(z.string().min(1, "Value cannot be empty.")).min(1, "At least one value is required."),
});

type AttributeFormValues = z.infer<typeof formSchema>;

interface AttributeFormProps {
  attribute?: Attribute;
  onSubmit: (data: Omit<Attribute, 'id'>) => void;
}

export function AttributeForm({ attribute, onSubmit }: AttributeFormProps) {
  const router = useRouter();
  
  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: attribute?.name || "",
      values: attribute?.values || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values",
  });

  const [inputValue, setInputValue] = useState('');

  const handleAddValue = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !form.getValues('values').includes(trimmedValue)) {
      append(trimmedValue);
      setInputValue('');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribute Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Color" {...field} />
              </FormControl>
              <FormDescription>The name of the attribute, like 'Color' or 'Size'.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="values"
            render={() => (
                 <FormItem>
                    <FormLabel>Attribute Values</FormLabel>
                     <div className="flex gap-2">
                        <Input
                            placeholder="e.g. Red"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddValue();
                                }
                            }}
                        />
                        <Button type="button" onClick={handleAddValue}>Add Value</Button>
                    </div>
                    <FormDescription>The possible choices for this attribute (e.g., Small, Medium, Large).</FormDescription>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
                                <span>{form.getValues(`values.${index}`)}</span>
                                <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />


        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">
                {attribute ? 'Save Changes' : 'Create Attribute'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
