

export type Product = {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  imageUrl: string; // DEPRECATED: use imageUrls
  imageUrls: string[];
  imageHint: string;
  category: string;
  brand?: string;
  featured: boolean;
  reviews?: Review[];
  createdAt?: any;
};

export type Category = {
  id: string;
  name:string;
  slug: string;
  imageUrl: string;
  imageHint: string;
  parentId?: string;
  children?: Category[];
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

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: any; // Firestore Timestamp
  minSpend?: number;
  status: 'active' | 'inactive';
};
