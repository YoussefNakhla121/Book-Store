import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Books } from './books/books';
import { Category } from './category/category';
import { Cart } from './cart/cart';
import { Profile } from './profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'books', component: Books },
  { path: 'category', component: Category },
  { path: 'cart', component: Cart },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: 'home' }
];