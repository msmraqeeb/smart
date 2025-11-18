export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  category: string;
  brand: string;
  featured: boolean;
  reviews: string[];
};

export type Category = {
  id: string;
  name:string;
  slug: string;
  imageUrl: string;
  imageHint: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
