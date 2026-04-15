import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { UserService } from '../../shared/services/user.service';
import { CrudService } from '../../shared/services/crud.service';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let crudService: jasmine.SpyObj<CrudService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const crudSpy = jasmine.createSpyObj('CrudService', ['post', 'get']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        TokenService,
        UserService,
        { provide: CrudService, useValue: crudSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    tokenService = TestBed.inject(TokenService);
    crudService = TestBed.inject(CrudService) as jasmine.SpyObj<CrudService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call crudService.post with correct params on login', () => {
    const mockResponse = { token: 'abc123', id: 1 };
    crudService.post.and.returnValue({ subscribe: (cb: any) => cb(mockResponse) } as any);

    service.login('admin@shopizer.com', 'password').subscribe(res => {
      expect(res.token).toBe(mockResponse.token);
      expect(res.id).toBe(mockResponse.id);
    });

    expect(crudService.post).toHaveBeenCalledWith('/v1/private/login', {
      username: 'admin@shopizer.com',
      password: 'password',
    });
  });

  it('should clear token and roles on logout', () => {
    tokenService.saveToken('test-token');
    localStorage.setItem('roles', '{}');
    localStorage.setItem('merchant', 'DEFAULT');

    service.logout();

    expect(tokenService.getToken()).toBeNull();
    expect(localStorage.getItem('roles')).toBeNull();
    expect(localStorage.getItem('merchant')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['auth']);
  });

  it('should call correct endpoint for forgot password', () => {
    crudService.post.and.returnValue({ subscribe: () => {} } as any);

    service.forgot('admin@shopizer.com', 'http://localhost/reset');

    expect(crudService.post).toHaveBeenCalledWith('/v1/user/password/reset/request', {
      username: 'admin@shopizer.com',
      returnUrl: 'http://localhost/reset',
    });
  });
});
