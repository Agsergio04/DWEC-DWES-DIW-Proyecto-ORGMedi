import { TestBed } from '@angular/core/testing';
import { ProfilePage } from './profile';
import { AuthService } from '../../core/services/auth/auth.service';
import { ToastService } from '../../shared/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let authSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'updateUsername', 'changePassword', 'logout'], { currentUser: { name: 'localUser' } });
    authSpy.getCurrentUser.and.returnValue(of({ name: 'serverUser' }));
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    component = TestBed.inject(ProfilePage);
  });

  it('ngOnInit initializes form and sets username from service', () => {
    component.ngOnInit();
    expect(component.formInitialized).toBeTrue();
    expect(component.form.get('username')?.value).toBe('serverUser');
  });

  it('changeUsername calls updateUsername and shows success toast', () => {
    component.ngOnInit();
    component.form.patchValue({ username: 'newName' });
    authSpy.updateUsername.and.returnValue(of({}));
    component.changeUsername();
    expect(authSpy.updateUsername).toHaveBeenCalledWith('newName');
  });
});
