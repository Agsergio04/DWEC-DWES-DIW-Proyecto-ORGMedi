import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap, catchError, delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AsyncValidatorsService {
  private debounceTime = 500;

  emailUnique(userId?: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value;
      if (!email) return of(null);

      // debounce simulated
      return timer(this.debounceTime).pipe(
        switchMap(() => this.checkEmail(email, userId)),
        catchError(() => of(null))
      );
    };
  }

  usernameAvailable(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const username = control.value;
      if (!username || username.length < 3) return of(null);
      return timer(300).pipe(
        switchMap(() => this.checkUsername(username)),
        catchError(() => of(null))
      );
    };
  }

  private checkEmail(email: string, userId?: string): Observable<ValidationErrors | null> {
    // Simulated API: taken@example.com is already used
    return of(email === 'taken@example.com' ? { emailTaken: true } : null).pipe(delay(800));
  }

  private checkUsername(username: string): Observable<ValidationErrors | null> {
    // Simulated API: 'admin' and 'user' unavailable
    const taken = ['admin', 'user', 'takenname'];
    return of(taken.includes(username) ? { usernameTaken: true } : null).pipe(delay(600));
  }
}
