import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Book,
  BooksResponse
} from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5000/api/v1/books';

  getBooks(
    page: number = 1,
    limit: number = 5,
    search: string = '',
    category: string = '',
    sort: string = ''
  ): Observable<BooksResponse> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    if (category) {
      params = params.set(
        'category',
        category
      );
    }

    if (sort) {
      params = params.set(
        'sort',
        sort
      );
    }

    return this.http.get<BooksResponse>(
      this.apiUrl,
      { params }
    );
  }

  getBookById(id: string): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/${id}`
    );
  }

  createBook(book: any): Observable<any> {

    return this.http.post(
      this.apiUrl,
      book
    );
  }

  updateBook(
    id: string,
    book: any
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      book
    );
  }

  updateStock(
    id: string,
    stock: number
  ): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/${id}/stock`,
      { stock }
    );
  }

  deleteBook(id: string): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
