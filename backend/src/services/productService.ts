import productRepository from '../repositories/productRepository.js';
import type { IProduct } from '../models/Product.js';

class ProductService {
  async getAllProducts(): Promise<IProduct[]> {
    let products = await productRepository.getAll();
    
    if (products.length === 0) {
      const staticProducts = [
        { 
          name: "Mini-Com Pro", 
          description: "Studio-grade precision for professionals.", 
          price: 28999, 
          image: "/images/headset-black.png", 
          tag: "Flagship" 
        },
        { 
          name: "Mini-Com Air", 
          description: "Feather-light comfort for all-day use.", 
          price: 19999, 
          image: "/images/headset-white.png", 
          tag: "Essential" 
        },
        { 
          name: "Mini-Com Classic", 
          description: "The original legend, refined for the modern age.", 
          price: 15999, 
          image: "/images/main.webp", 
          tag: "Iconic" 
        }
      ];
      await productRepository.seed(staticProducts);
      products = await productRepository.getAll();
    }
    
    return products;
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return await productRepository.getById(id);
  }
}

export default new ProductService();
