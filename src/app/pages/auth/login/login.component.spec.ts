import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../../shared/services/user.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NbSpinnerModule, NbCheckboxModule, NbButtonModule, NbThemeModule } from '@nebular/theme';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let tokenService: TokenService;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(waitForAsync(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const userSpy = jasmine.createSpyObj('UserService', ['saveUserId', 'getUserProfile', 'checkForAccess']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        ToastrModule.forRoot(),
        NbThemeModule.forRoot(),
        NbSpinnerModule,
        NbCheckboxModule,
        NbButtonModule,
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: routerSpy },
        TokenService,
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    tokenService = TestBed.inject(TokenService);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  }));

  beforeEach(() => {
    localStorage.clear();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.form.get('username').value).toBe('');
    expect(component.form.get('password').value).toBe('');
  });

  it('should mark form invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should mark form invalid with invalid email', () => {
    component.form.patchValue({ username: 'notanemail', password: 'password' });
    expect(component.form.valid).toBeFalsy();
  });

  it('should mark form valid with correct data', () => {
    component.form.patchValue({ username: 'admin@shopizer.com', password: 'password' });
    expect(component.form.valid).toBeTruthy();
  });

  it('should not call authService when form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login on valid submit', () => {
    const mockLoginResponse = { token: 'abc123', id: 1 };
    const mockUserProfile = { groups: [{ name: 'SUPERADMIN' }], merchant: 'DEFAULT' };

    authService.login.and.returnValue(of(mockLoginResponse));
    userService.getUserProfile.and.returnValue(of(mockUserProfile));

    component.form.patchValue({ username: 'admin@shopizer.com', password: 'password' });
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('admin@shopizer.com', 'password');
  });

  it('should set errorMessage on login failure', () => {
    authService.login.and.returnValue(throwError({ status: 401 }));

    component.form.patchValue({ username: 'admin@shopizer.com', password: 'wrong' });
    component.onSubmit();

    expect(component.errorMessage).toBeTruthy();
    expect(component.loading).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPass).toBe(0);
    component.showPassword();
    expect(component.showPass).toBe(1);
    component.showPassword();
    expect(component.showPass).toBe(0);
  });

  it('should prefill email when remember is set', () => {
    localStorage.setItem('isRemember', 'true');
    localStorage.setItem('loginEmail', 'saved@test.com');

    // Re-init component
    component.ngOnInit();

    expect(component.isRemember).toBeTruthy();
    expect(component.form.get('username').value).toBe('saved@test.com');
  });
});
