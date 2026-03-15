export interface Product {
  id: string; // Unique ID for the product
  name: string; // Display name
  price: number; // Price in currency units
  image: string; // Image URL
  category?: string; // Optional category name
}
