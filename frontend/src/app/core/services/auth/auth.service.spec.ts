import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from '../data/api.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    // Clear localStorage
    localStorage.clear();
  });

  it('should login and set token on success', (done) => {
    apiSpy.post.and.returnValue(of({ token: 'abc123' }));

    service.login('user', 'pass').subscribe(result => {
      expect(result).toBeTrue();
      expect(service.isLoggedIn).toBeTrue();
      expect(service.getToken()).toBe('abc123');
      done();
    });
  });

  it('should propagate error on failed login', (done) => {
    apiSpy.post.and.returnValue(throwError(() => new Error('fail')));

    service.login('user', 'pass').subscribe({
      next: () => fail('should have failed'),
      error: (err) => {
        expect(err).toBeTruthy();
        expect(service.isLoggedIn).toBeFalse();
        done();
      }
    });
  });
});
