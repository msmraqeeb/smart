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
  reviews: Review[];
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

export type Review = {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  reply?: {
    author: string;
    date: string;
    text: string;
  }
};
