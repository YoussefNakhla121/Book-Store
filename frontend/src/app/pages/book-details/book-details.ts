import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css'
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private cdr = inject(ChangeDetectorRef);

  book: Book | null = null;
  loading = true;
  errorMessage = '';

  quantity = 1;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    console.log('Book ID:', id);

    if (!id) {
      this.errorMessage = 'Book ID not found';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.bookService.getBookById(id).subscribe({
      next: (response) => {
        console.log('Book response:', response);

        this.book = response.data;
        this.quantity = 1;
        this.loading = false;

        this.cdr.detectChanges();

        console.log('Book:', this.book);
        console.log('Loading:', this.loading);
      },

      error: (error) => {
        console.error('Book error:', error);

        this.errorMessage = 'Book not found';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }

  increaseQuantity(): void {
    if (this.book && this.quantity < this.book.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }
}
