import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { RegisterPage } from './pages/register/register';
import { StyleGuidePage } from './pages/style-guide/style-guide';
import { DemoPage } from './pages/demo/demo';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'style-guide', component: StyleGuidePage },
  { path: 'demo', component: DemoPage },
];
