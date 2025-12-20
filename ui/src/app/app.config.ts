import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { authInterceptor } from './auth/auth.interceptor';
import { authErrorInterceptor } from './auth/auth-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, authErrorInterceptor])),
    importProvidersFrom(BrowserAnimationsModule),
    provideHotToastConfig({
      position: 'top-right',
      duration: 3000,
      dismissible: true
    })
  ]
};