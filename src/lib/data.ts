import type { Product, Category } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) return { imageUrl: "https://picsum.photos/seed/error/600/600", imageHint: 'placeholder' };
  return { imageUrl: image.imageUrl, imageHint: image.imageHint };
}

const products: Product[] = [
  {
    id: '1',
    name: 'Organic Apples',
    description: 'Crisp, juicy, and full of flavor. Our organic apples are sourced from local orchards and are perfect for a healthy snack.',
    price: 3.99,
    category: 'fruits',
    brand: 'FreshFarms',
    featured: true,
    ...getImage('organic-apples'),
    reviews: ["So crisp and delicious!", "Best apples I've had in a long time.", "A bit pricey but worth it for the quality."],
  },
  {
    id: '2',
    name: 'Avocado Toast Kit',
    description: 'Everything you need for the perfect avocado toast. Includes two ripe avocados, a loaf of artisan sourdough, and a lemon.',
    price: 8.99,
    category: 'vegetables',
    brand: 'GourmetBox',
    featured: true,
    ...getImage('avocado-toast-kit'),
    reviews: ["Made my mornings so much easier.", "The sourdough bread is to die for.", "Great value for what you get."],
  },
  {
    id: '3',
    name: 'Artisan Sourdough Loaf',
    description: 'A classic sourdough loaf with a chewy crust and a soft, airy interior. Baked fresh daily.',
    price: 5.49,
    category: 'bakery',
    brand: 'The Bakehouse',
    featured: false,
    ...getImage('sourdough-loaf'),
    reviews: ["Amazing flavor and texture.", "Perfect for sandwiches or just with butter.", "A staple in our house now."],
  },
  {
    id: '4',
    name: 'Free-Range Eggs',
    description: 'A dozen large brown eggs from free-range chickens. Rich yolks and unbeatable freshness.',
    price: 4.99,
    category: 'dairy-eggs',
    brand: 'HappyHen',
    featured: true,
    ...getImage('free-range-eggs'),
    reviews: ["You can taste the difference!", "The yolks are so vibrant and orange.", "My go-to eggs for baking and breakfast."],
  },
  {
    id: '5',
    name: 'Heirloom Tomatoes',
    description: 'A vibrant mix of seasonal heirloom tomatoes. Bursting with sweet, complex flavors.',
    price: 6.99,
    category: 'vegetables',
    brand: 'SunGardens',
    featured: false,
    ...getImage('heirloom-tomatoes'),
    reviews: ["So beautiful and they taste even better.", "Makes the best caprese salad.", "A summer treat."],
  },
  {
    id: '6',
    name: 'Fresh Strawberries',
    description: '1 lb of sweet, sun-ripened strawberries. Perfect for desserts, smoothies, or eating fresh.',
    price: 4.49,
    category: 'fruits',
    brand: 'BerryBest',
    featured: true,
    ...getImage('fresh-strawberries'),
    reviews: ["Incredibly sweet and juicy.", "My kids devoured the whole punnet in minutes.", "Great quality for the price."],
  },
  {
    id: '7',
    name: 'Organic Almond Milk',
    description: 'Unsweetened and creamy organic almond milk. A great dairy-free alternative for your cereal or coffee.',
    price: 3.79,
    category: 'dairy-eggs',
    brand: 'NuttyCo',
    featured: false,
    ...getImage('almond-milk'),
    reviews: ["Smooth and no weird aftertaste.", "My favorite for lattes.", "Good price for organic."],
  },
  {
    id: '8',
    name: 'Whole Wheat Baguette',
    description: 'A crusty and flavorful whole wheat baguette, baked to perfection.',
    price: 3.29,
    category: 'bakery',
    brand: 'The Bakehouse',
    featured: false,
    ...getImage('whole-wheat-baguette'),
    reviews: ["A healthier option that doesn't compromise on taste.", "Love the nutty flavor.", "Great with soups."],
  },
    {
    id: '9',
    name: 'Organic Bananas',
    description: 'A bunch of sweet and creamy organic bananas. Naturally ripened and full of potassium.',
    price: 2.99,
    category: 'fruits',
    brand: 'FreshFarms',
    featured: false,
    ...getImage('organic-bananas'),
    reviews: ["Perfectly ripe.", "Great for smoothies.", "Good value."],
  },
  {
    id: '10',
    name: 'Greek Yogurt',
    description: 'Thick and creamy plain Greek yogurt. High in protein and perfect for breakfast bowls.',
    price: 5.99,
    category: 'dairy-eggs',
    brand: 'OlympusDairy',
    featured: false,
    ...getImage('greek-yogurt'),
    reviews: ["So rich and creamy.", "I use it for everything from breakfast to dips.", "Best Greek yogurt out there."],
  },
  {
    id: '11',
    name: 'Organic Kale',
    description: 'A large bunch of fresh, crisp organic kale. A superfood packed with vitamins.',
    price: 3.49,
    category: 'vegetables',
    brand: 'GreenLeaf',
    featured: false,
    ...getImage('kale-bunch'),
    reviews: ["Very fresh and not bitter.", "Makes great kale chips.", "A huge bunch for the price."],
  },
  {
    id: '12',
    name: 'Blueberries',
    description: 'A pint of plump, juicy blueberries. Loaded with antioxidants.',
    price: 5.99,
    category: 'fruits',
    brand: 'BerryBest',
    featured: false,
    ...getImage('blueberries'),
    reviews: ["Sweet and flavorful.", "Perfect for my morning oatmeal.", "Always fresh from GetMart."],
  },
];

const categories: Category[] = [
    { id: '1', name: 'Fresh Vegetables', slug: 'vegetables', ...getImage('fresh-vegetables') },
    { id: '2', name: 'Organic Fruits', slug: 'fruits', ...getImage('organic-fruits') },
    { id: '3', name: 'Artisan Bakery', slug: 'bakery', ...getImage('artisan-bakery') },
    { id: '4', name: 'Dairy & Eggs', slug: 'dairy-eggs', ...getImage('dairy-and-eggs') },
];

export async function getProducts(filters?: { category?: string }): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (filters?.category) {
    return products.filter(p => p.category === filters.category);
  }
  return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return products.find(p => p.id === id);
}

export async function getFeaturedProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return products.filter(p => p.featured);
}

export async function getCategories(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return categories;
}
