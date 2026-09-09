import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { CategoryService } from '../../services/category';

import { Category } from '../../models/book';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class CategoriesComponent implements OnInit {

  private categoryService = inject(CategoryService);

  private cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];

  loading = true;

  errorMessage = '';

  ngOnInit(): void {

    this.categoryService.getCategories().subscribe({

      next: (response) => {

        console.log('Categories response:', response);

        this.categories = response.data ?? [];

        this.loading = false;

        this.cdr.detectChanges();

        console.log('Categories:', this.categories);
        console.log('Loading:', this.loading);

      },

      error: (error) => {

        console.error('Categories error:', error);

        this.errorMessage = 'Unable to load categories';

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

  }
}
