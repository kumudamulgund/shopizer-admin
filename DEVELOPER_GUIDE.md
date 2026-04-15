# Shopizer Admin - Developer Guide

## Tech Stack

- **Angular** (TypeScript) built on the **Nebular** UI framework (by Akveo)
- **ngx-translate** for i18n
- **ngx-toastr** for notifications
- **ng-bootstrap** for UI widgets
- **TinyMCE** for rich text editing

## Architecture Pattern: Feature-Module Based with Lazy Loading

The app follows Angular's recommended modular architecture with lazy-loaded feature modules.

### Top-Level Structure

```
shopizer-admin/src/app/
├── app.module.ts              # Root module (bootstrap)
├── app-routing.module.ts      # Root routes
├── @core/                     # Core services, data interfaces, mock data
│   ├── core.module.ts         # Singleton services (role provider, analytics, etc.)
│   ├── data/                  # Data interfaces/contracts
│   ├── mock/                  # Mock data services (dashboard charts, etc.)
│   └── utils/                 # Layout & state utilities
├── @theme/                    # UI shell & shared UI components
│   ├── theme.module.ts
│   ├── components/            # Header, Footer, Error, TinyMCE, ImageBrowser
│   ├── layouts/               # Sample layout (sidebar + header + content)
│   ├── pipes/                 # Capitalize, Plural, Round, Timing, etc.
│   └── styles/                # Themes (default, dark, cosmic, corporate), SCSS
└── pages/                     # Feature modules (lazy-loaded)
```

### Feature Modules (under `pages/`)

Each feature is a self-contained module with its own routing, components, and services:

| Module | Path | Purpose |
|---|---|---|
| `home` | `/pages/home` | Dashboard |
| `catalogue` | `/pages/catalogue` | Products, Categories, Brands, Options, Types, Product Groups, Catalogues |
| `orders` | `/pages/orders` | Order list, details, history, invoices, transactions |
| `store-management` | `/pages/store-management` | Store CRUD, branding, landing page, retailer management |
| `user-management` | `/pages/user-management` | Users list, user form, profile, password change |
| `customers` | `/pages/customer` | Customer list, add/edit, credentials, options |
| `content` | `/pages/content` | Pages, Boxes, Files, Images, Promotions |
| `shipping` | `/pages/shipping` | Origin, packages, methods, rules, country configuration |
| `payment` | `/pages/payment` | Payment methods, configuration |
| `tax-management` | `/pages/tax-management` | Tax classes, tax rates |
| `auth` | `/auth` | Login, register, forgot/reset password |

### Internal Module Pattern

Each feature module follows a consistent structure:

```
pages/<feature>/
├── <feature>.module.ts              # NgModule declaration
├── <feature>-routing.module.ts      # Child routes
├── <feature>.component.ts           # Container component
├── services/                        # HTTP services (API calls)
├── <sub-feature>-list/              # List component
├── <sub-feature>-form/              # Create/Edit form component
└── models/                          # (optional) TypeScript interfaces
```

## API Communication Layer

- **`CrudService`** — Generic HTTP wrapper that prefixes all calls with `environment.apiUrl` (default: `http://localhost:8080/api`). All feature services (e.g., `ProductService`, `OrdersService`, `StoreService`) inject `CrudService` and call its `get/post/put/delete` methods.
- A separate **`shippingApi`** base URL exists for shipping-related calls.
- **`AuthInterceptor`** — Attaches JWT Bearer token to every outgoing request and handles 401 responses (logout/token refresh).
- **`GlobalHttpInterceptorService`** — Global error handling interceptor.

## Authentication & Authorization

- **JWT-based auth** — Token stored via `TokenService`, attached by `AuthInterceptor`.
- **Role-based route guards** under `shared/guards/`:
  - `AuthGuard` — Basic authentication check
  - `SuperadminStoreRetailCatalogueGuard`, `OrdersGuard`, `AdminGuard`, `MarketplaceGuard`, etc. — Role-based access control
- Menu items are dynamically shown/hidden based on guard functions in `pages-menu.ts`.

## Shared Module (`pages/shared/`)

Cross-cutting concerns used by all feature modules:

- `components/` — Paginator, ImageUploading, NotFound, 500 error
- `services/` — `CrudService`, `UserService`, `ConfigService`, `ConnectionStatusService`
- `guards/` — Route guards
- `interceptors/` — HTTP interceptors
- `models/` — Shared TypeScript models (Country, etc.)
- `validation/` — Custom validators (e.g., `EqualValidator`)

## Deployment Modes

The app supports 3 modes configured via `environment.mode`:

- **`STANDARD`** — Single store
- **`MARKETPLACE`** — Categories/options are global
- **`BTB`** — Business-to-business

This controls menu visibility and guard behavior throughout the app.
