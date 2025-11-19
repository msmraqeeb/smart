import type { Product, Category, Review } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) return { imageUrl: "https://picsum.photos/seed/error/600/600", imageHint: 'placeholder' };
  return { imageUrl: image.imageUrl, imageHint: image.imageHint };
}

const reviews: Review[] = [
    {
      id: '1',
      author: 'Alice',
      date: '2024-05-20T10:00:00Z',
      rating: 5,
      text: 'So crisp and delicious! Best apples I\'ve had in a long time. Will definitely buy again.',
    },
    {
      id: '2',
      author: 'Bob',
      date: '2024-05-18T14:30:00Z',
      rating: 4,
      text: 'Great quality apples. A bit pricey but worth it for the organic quality. Recommended.',
       reply: {
        author: 'GetMart',
        date: '2024-05-19T09:00:00Z',
        text: 'Thanks Bob! We\'re glad you enjoyed them.'
      }
    },
     {
      id: '3',
      author: 'Charlie',
      date: '2024-05-15T12:00:00Z',
      rating: 3,
      text: 'They were okay. Not as crisp as I was expecting, but still decent flavor.',
    }
  ];

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
    reviews: reviews,
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
    reviews: [
      { id: '4', author: 'Diana', date: '2024-05-21T08:00:00Z', rating: 5, text: 'Made my mornings so much easier. The sourdough bread is to die for.' },
    ],
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
    reviews: [
      { id: '5', author: 'Eve', date: '2024-05-22T11:00:00Z', rating: 5, text: 'Amazing flavor and texture. Perfect for sandwiches or just with butter.' },
    ],
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
    reviews: [
      { id: '6', author: 'Frank', date: '2024-05-19T18:00:00Z', rating: 5, text: 'You can taste the difference! The yolks are so vibrant and orange.' },
      { id: '7', author: 'Grace', date: '2024-05-17T07:45:00Z', rating: 4, text: 'My go-to eggs for baking and breakfast. Consistently good quality.' },
    ],
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
    reviews: [],
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
    reviews: [],
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
    reviews: [],
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
    reviews: [],
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
    reviews: [],
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
    reviews: [],
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
    reviews: [],
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
    reviews: [],
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
