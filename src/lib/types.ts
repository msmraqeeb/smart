

export type ProductAttribute = {
  name: string;
  options: string[];
};

export type ProductVariant = {
    id: string;
    sku?: string;
    price: number;
    salePrice?: number;
    imageUrls?: string[];
    attributes: Record<string, string>;
};

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
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
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

export type Attribute = {
  id: string;
  name: string;
  values: string[];
}

export type CartItem = {
  id: string; // Combination of product.id and variant.id
  product: Product;
  quantity: number;
  variant?: ProductVariant;
};

export type Review = {
  id: string;
  author: string;
  createdAt: any; // Firestore Timestamp
  rating: number;
  text: string;
  userId: string;
  reply?: {
    author: string;
    date: any; // Firestore Timestamp
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
  autoApply?: boolean;
};
