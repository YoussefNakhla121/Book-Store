import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  BookService
} from '../../services/book';

import {
  CategoryService
} from '../../services/category';

import {
  Book,
  Category
} from '../../models/book';

@Component({
  selector: 'app-books',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './books.html',

  styleUrl: './books.css'
})
export class BooksComponent
  implements OnInit {

  private bookService =
    inject(BookService);

  private categoryService =
    inject(CategoryService);

  private router =
    inject(Router);

  books: Book[] = [];

  categories: Category[] = [];

  page = 1;

  limit = 5;

  totalBooks = 0;

  totalPages = 1;

  search = '';

  selectedCategory = '';

  selectedSort = '';

  loading = false;

  errorMessage = '';

  ngOnInit(): void {

    this.loadCategories();

    this.loadBooks();

  }

  loadBooks(): void {

    this.loading = true;

    this.errorMessage = '';

    this.bookService
      .getBooks(
        this.page,
        this.limit,
        this.search,
        this.selectedCategory,
        this.selectedSort
      )
      .subscribe({

        next: (response) => {

          this.books =
            response.data;

          this.totalBooks =
            response.totalBooks;

          this.totalPages =
            response.totalPages;

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Books error:',
            error
          );

          this.errorMessage =
            'Unable to load books. Make sure the backend is running.';

          this.loading = false;

        }

      });
  }

  loadCategories(): void {

    this.categoryService
      .getCategories()
      .subscribe({

        next: (response) => {

          this.categories =
            response.data;

        },

        error: (error) => {

          console.error(
            'Categories error:',
            error
          );

        }

      });
  }

  searchBooks(): void {

    this.page = 1;

    this.loadBooks();

  }

  filterBooks(): void {

    this.page = 1;

    this.loadBooks();

  }

  sortBooks(): void {

    this.page = 1;

    this.loadBooks();

  }

  nextPage(): void {

    if (
      this.page <
      this.totalPages
    ) {

      this.page++;

      this.loadBooks();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }
  }

  previousPage(): void {

    if (this.page > 1) {

      this.page--;

      this.loadBooks();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }
  }

  openBook(id: string): void {

    this.router.navigate([
      '/books',
      id
    ]);

  }
}
