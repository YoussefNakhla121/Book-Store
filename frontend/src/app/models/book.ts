export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn?: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  category: Category;
  images: string[];
  averageRating: number;
  numReviews: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BooksResponse {
  success: boolean;
  count: number;
  totalBooks: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Book[];
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}
