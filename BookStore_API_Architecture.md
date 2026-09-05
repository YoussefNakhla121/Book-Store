# Book Store REST API
### Backend Architecture & 4-Developer Work Breakdown

**Stack:** Node.js · Express.js · MongoDB · Mongoose · JWT · REST
**Prepared for:** 4-person Computer Science student team · **Scope:** Backend only (Angular frontend to follow later)

---

## 1. System Architecture Overview

The backend follows a layered MVC-inspired structure: **routes** define endpoints, **controllers** handle request/response, **services** hold business logic, **models** define Mongoose schemas, and cross-cutting concerns (auth, validation, error handling) live in shared **middleware**. This keeps modules independent enough for four people to work in parallel with minimal merge conflicts.

### Recommended Folder Structure

```
book-store-api/
|-- src/
|   |-- config/
|   |   |-- db.js                  # MongoDB connection
|   |   `-- env.js                  # env var loader/validator
|   |-- models/
|   |   |-- User.js
|   |   |-- Book.js
|   |   |-- Category.js
|   |   |-- Cart.js
|   |   |-- Order.js
|   |   |-- Review.js
|   |   `-- Wishlist.js
|   |-- controllers/
|   |   |-- auth.controller.js
|   |   |-- user.controller.js
|   |   |-- book.controller.js
|   |   |-- category.controller.js
|   |   |-- cart.controller.js
|   |   |-- order.controller.js
|   |   |-- review.controller.js
|   |   |-- wishlist.controller.js
|   |   `-- admin.controller.js      # sales / inventory / rating reports
|   |-- routes/
|   |   |-- auth.routes.js           # Swagger JSDoc comments live above
|   |   |-- user.routes.js           # each route, owned by the same dev
|   |   |-- book.routes.js           # who wrote the route below it
|   |   |-- category.routes.js
|   |   |-- cart.routes.js
|   |   |-- order.routes.js
|   |   |-- review.routes.js
|   |   |-- wishlist.routes.js
|   |   |-- admin.routes.js
|   |   `-- index.js                 # mounts all routers on /api/v1
|   |-- middlewares/
|   |   |-- auth.middleware.js       # verifyJWT (protect)
|   |   |-- role.middleware.js       # authorize('admin', ...)
|   |   |-- validate.middleware.js   # runs express-validator/Joi schemas
|   |   |-- error.middleware.js      # centralized error handler
|   |   `-- notFound.middleware.js
|   |-- services/                    # business logic per module
|   |-- validators/                  # request schemas per module
|   |-- utils/
|   |   |-- ApiError.js
|   |   |-- ApiResponse.js
|   |   |-- asyncHandler.js
|   |   `-- paginate.js
|   |-- app.js                       # express app + Swagger + middleware wiring
|   `-- server.js                    # entry point, starts HTTP server
|-- seeds/                           # ONE seeder file per model, same owner as the model
|   |-- user.seed.js
|   |-- book.seed.js
|   |-- order.seed.js
|   |-- review.seed.js
|   `-- index.js                     # runs every seeder together (shared runner)
|-- tests/                           # ONE test file per module, same owner as the module
|   |-- auth.test.js
|   |-- book.test.js
|   |-- cart.test.js
|   |-- order.test.js
|   |-- review.test.js
|   `-- wishlist.test.js
|-- .env.example
|-- .gitignore
|-- package.json
`-- README.md
```

### API Conventions (agree on these before coding)

- Base URL: `/api/v1` — versioned from day one.
- Consistent JSON envelope: `{ success, message, data, meta }` for every response.
- Pagination via query params: `?page=1&limit=10`, returned inside `meta` (totalItems, totalPages, currentPage).
- Filtering via query params scoped to each resource (e.g. category, author, price range, status).
- Searching via `?search=keyword` against a MongoDB text index.
- Sorting via `?sort=price,-createdAt` (comma-separated, `-` = descending).
- Errors always flow through the shared error-handling middleware — controllers only ever `throw` or call `next(err)`.
- JWT: short-lived access token (~15 min) + longer-lived refresh token; roles: `user` and `admin`.
- **Docs & tests are not a separate role.** Swagger/OpenAPI docs are generated from JSDoc comments written directly above each route (via `swagger-jsdoc`), and each module gets its own Jest/Supertest file in `tests/`. Whoever writes an endpoint documents and tests that endpoint — Developer 1 only sets up the shared tooling once, in week 1.

---

## 2. Required Modules / Features

| Module | Purpose | Owner |
|---|---|---|
| Auth | Register, login, JWT issue/refresh, logout | Developer 1 |
| Users | Profile management, admin user management | Developer 1 |
| Books | Catalog CRUD, pagination, filtering, search | Developer 2 |
| Categories | Genre/category CRUD, linked to books | Developer 2 |
| Cart | Per-user shopping cart before checkout | Developer 3 |
| Orders | Checkout, order history, order status | Developer 3 |
| Reviews & Ratings | Per-book reviews, average rating rollup | Developer 4 |
| Wishlist | Save-for-later list per user | Developer 4 |
| Admin Analytics | Sales, inventory & rating reports for admins | Developer 4 |

> Documentation, database seeding, and testing are **not** a separate module owned by one person — each developer writes the Swagger annotations, seed script, and test file for the models/endpoints they build (see each developer's own hour breakdown below).

### Core Database Models

| Model | Key Fields | Owner |
|---|---|---|
| `User` | name, email, passwordHash, role, address, refreshToken | Developer 1 |
| `Book` | title, author, isbn, description, price, stock, category, images, averageRating | Developer 2 |
| `Category` | name, slug, description, parentCategory (optional) | Developer 2 |
| `Cart` | user, items[{book, quantity}] | Developer 3 |
| `Order` | user, items[{book, quantity, price}], totalAmount, shippingAddress, orderStatus, paymentStatus | Developer 3 |
| `Review` | book, user, rating (1-5), comment | Developer 4 |
| `Wishlist` | user, books[] (saved-for-later book references) | Developer 4 |

> Note: a `Cart` model is included as a lightweight, recommended addition to Developer 3's scope — it makes checkout logic cleaner. It can be dropped in favor of a client-side cart if the team wants to reduce scope.

---

## 3. Team Division at a Glance

Work is split by **domain** (vertical slices), not by layer — each developer owns their models, controllers, routes, validation, **documentation, seed data, and tests** for their modules end-to-end. Nobody is assigned a catch-all "QA" role; every hour estimate below already includes that developer's own Swagger docs, seed script, and test file. This minimizes file overlap and merge conflicts, and mirrors how real backend teams divide REST APIs. Developer 1's auth/middleware work is a shared dependency, so it should be prioritized first and stubbed early for the others.

| Dev | Focus Area | Owns Models | Est. Hours |
|---|---|---|---|
| 1 | Auth, Users & Core Infrastructure | User | ~34h |
| 2 | Books & Categories (Catalog) | Book, Category | ~32h |
| 3 | Cart & Orders (Checkout) | Cart, Order | ~34h |
| 4 | Reviews, Wishlist & Admin Analytics | Review, Wishlist | ~30h |

> Total estimated effort: **~130 hours** across the team (~32.5h per person, each within a 30-34h band) — roughly 3-4 weeks at 8-10 hours/week each, typical for a student sprint project. Every developer's total already includes their own docs/seed/test time, so no one is quietly carrying the others' cleanup work.

---

## Developer 1 — Authentication, Users & Core Infrastructure
*The foundation everyone else builds on*

### Responsibilities
- Initialize the project: repo structure, `package.json`, ESLint/Prettier config, `.env.example`.
- Set up MongoDB connection (`config/db.js`) and environment variable loading/validation.
- Build the shared infrastructure everyone depends on: `asyncHandler`, `ApiError`/`ApiResponse` helpers, centralized error-handling middleware, 404 handler.
- Implement JWT access + refresh token issuing, password hashing (bcrypt), and the `protect` and `authorize(role)` middleware used by every other module.
- Build registration, login, token refresh, and logout flows.
- Build user profile management and admin user administration endpoints.
- Own the top-level `app.js`/`server.js` wiring and merge coordination for shared middleware changes.
- Set up the shared Jest/Supertest config and the Swagger/OpenAPI base (info block, security scheme, `swagger-jsdoc` wiring) that the other three developers plug their own route-level docs and tests into — a one-time setup, not an ongoing role.
- Write the Swagger annotations, seed script, and test file for their **own** auth/user endpoints.

### Database Model Owned: `User`

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase, indexed |
| password | String | required, bcrypt-hashed, select: false |
| role | String (enum) | 'user' \| 'admin', default 'user' |
| phone | String | optional |
| address | Object | { street, city, state, zip, country } |
| refreshToken | String | hashed, select: false |
| isActive | Boolean | default true; supports admin ban/disable |

### API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Create account (user role by default) | Public |
| POST | `/api/v1/auth/login` | Authenticate, issue access + refresh token | Public |
| POST | `/api/v1/auth/refresh-token` | Exchange refresh token for new access token | Public* |
| POST | `/api/v1/auth/logout` | Invalidate refresh token | Authenticated |
| GET | `/api/v1/users/me` | Get own profile | Authenticated |
| PUT | `/api/v1/users/me` | Update own profile | Authenticated |
| PUT | `/api/v1/users/me/password` | Change own password | Authenticated |
| GET | `/api/v1/users` | List users, paginated + filter by role | Admin |
| GET | `/api/v1/users/:id` | Get any user by id | Admin |
| PUT | `/api/v1/users/:id` | Update role / active status | Admin |
| DELETE | `/api/v1/users/:id` | Delete a user | Admin |

*Requires a valid refresh token (cookie or body), not an access token.

### Estimated Workload: ~34 hours

| Task | Hours |
|---|---|
| Project setup, config, shared utils/middleware | 6h |
| Shared Jest/Supertest + Swagger scaffolding (one-time, used by all 4) | 4h |
| User model + password hashing | 2h |
| Auth endpoints (register/login/refresh/logout) | 7h |
| JWT + role middleware | 4h |
| User profile + admin user endpoints | 5h |
| Own Swagger docs, seed script & tests for auth/user module | 6h |

### Dependencies
- **Blocks everyone:** Developers 2, 3, and 4 all need the `protect`/`authorize` middleware and error-handling utilities to build protected routes.
- **Mitigation:** deliver a working auth middleware + User model by the end of week 1, even before login/registration UX is polished — others can start integrating immediately, and only need a mock/stub JWT in the meantime.

---

## Developer 2 — Books & Categories (Catalog)
*The core product catalog, search, and filtering logic*

### Responsibilities
- Design and build the Book and Category schemas, including the relationship between them.
- Implement full CRUD for books, restricted to admins for write operations.
- Implement pagination, filtering (category, author, price range, availability), text search, and sorting on the book listing endpoint — the most query-heavy endpoint in the API.
- Implement CRUD for categories, including optional nested/parent categories.
- Add a MongoDB text index on `title`, `author`, and `description` for the search feature.
- Write input validation for book/category payloads (price > 0, stock >= 0, valid category reference, etc.).
- Write the Swagger annotations, seed script (sample books/categories), and test file for their **own** catalog endpoints.

### Database Models Owned: `Book`, `Category`

**Book**

| Field | Type | Notes |
|---|---|---|
| title | String | required, text-indexed |
| author | String | required, text-indexed |
| isbn | String | unique |
| description | String | text-indexed |
| price | Number | required, min 0 |
| discountPrice | Number | optional |
| stock | Number | required, min 0 |
| category | ObjectId (ref Category) | required |
| images | [String] | URLs |
| averageRating / numReviews | Number | denormalized, updated by Reviews module |

**Category**

| Field | Type | Notes |
|---|---|---|
| name | String | required, unique |
| slug | String | auto-generated from name |
| description | String | optional |
| parentCategory | ObjectId (ref Category) | optional, enables subcategories |

### API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/books` | List books — pagination, filter, search, sort | Public |
| GET | `/api/v1/books/:id` | Get single book detail | Public |
| POST | `/api/v1/books` | Create a book | Admin |
| PUT | `/api/v1/books/:id` | Update a book | Admin |
| DELETE | `/api/v1/books/:id` | Delete a book | Admin |
| PATCH | `/api/v1/books/:id/stock` | Adjust stock quantity | Admin |
| GET | `/api/v1/categories` | List all categories | Public |
| GET | `/api/v1/categories/:id` | Get single category + its books | Public |
| POST | `/api/v1/categories` | Create a category | Admin |
| PUT | `/api/v1/categories/:id` | Update a category | Admin |
| DELETE | `/api/v1/categories/:id` | Delete a category | Admin |

Example query support on `GET /books`:
`?page=1&limit=12&category=fiction&minPrice=5&maxPrice=40&author=orwell&search=animal&sort=-averageRating`

### Estimated Workload: ~32 hours

| Task | Hours |
|---|---|
| Book + Category schemas | 4h |
| Book CRUD endpoints | 6h |
| Pagination, filtering, search, sorting logic | 8h |
| Category CRUD endpoints | 4h |
| Validation layer for both resources | 3h |
| Own Swagger docs, seed script & tests for catalog module | 7h |

### Dependencies
- Depends on Developer 1's `protect`/`authorize('admin')` middleware for write endpoints — can build read-only endpoints independently in the meantime.
- Developer 3 (Orders) and Developer 4 (Reviews/Wishlist) both depend on the **final shape** of the Book schema — the `_id`, `price`, and `stock` fields should be finalized and communicated early, ideally by mid-week 1.

---

## Developer 3 — Cart & Orders (Checkout)
*Turning a browsing session into a completed purchase*

### Responsibilities
- Design the Cart and Order schemas.
- Implement cart operations: add/update/remove items, view cart, clear cart.
- Implement checkout: convert a cart into an order, snapshot item prices at time of purchase, decrement book stock.
- Implement order history and order detail retrieval for regular users (own orders only).
- Implement admin order management: list all orders (filterable by status), update order status, view any order.
- Implement order cancellation logic with appropriate status guards (e.g. only 'pending' orders are cancellable by the customer).
- Write the Swagger annotations, seed script (sample carts/orders), and test file for their **own** cart/order endpoints.

### Database Models Owned: `Cart`, `Order`

**Cart**

| Field | Type | Notes |
|---|---|---|
| user | ObjectId (ref User) | required, unique (one cart per user) |
| items | [{ book, quantity }] | book: ObjectId ref Book |
| updatedAt | Date | auto-managed |

**Order**

| Field | Type | Notes |
|---|---|---|
| user | ObjectId (ref User) | required |
| items | [{ book, quantity, price }] | price snapshotted at purchase time |
| totalAmount | Number | computed server-side, never trust client |
| shippingAddress | Object | { street, city, state, zip, country } |
| paymentStatus | String (enum) | 'pending' \| 'paid' \| 'failed' |
| orderStatus | String (enum) | 'pending' \| 'processing' \| 'shipped' \| 'delivered' \| 'cancelled' |

### API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/cart` | View own cart | Authenticated |
| POST | `/api/v1/cart/items` | Add item to cart | Authenticated |
| PUT | `/api/v1/cart/items/:bookId` | Update item quantity | Authenticated |
| DELETE | `/api/v1/cart/items/:bookId` | Remove item from cart | Authenticated |
| DELETE | `/api/v1/cart` | Clear entire cart | Authenticated |
| POST | `/api/v1/orders` | Checkout — create order from cart | Authenticated |
| GET | `/api/v1/orders/my` | Own order history, paginated | Authenticated |
| GET | `/api/v1/orders/:id` | Get one order (own, or any if admin) | Authenticated |
| PATCH | `/api/v1/orders/:id/cancel` | Cancel own pending order | Authenticated |
| GET | `/api/v1/orders` | List all orders, filter by status | Admin |
| PATCH | `/api/v1/orders/:id/status` | Update order status | Admin |

### Estimated Workload: ~34 hours

| Task | Hours |
|---|---|
| Cart + Order schemas | 4h |
| Cart endpoints | 6h |
| Checkout / order-creation logic (stock check, price snapshot, totals) | 8h |
| Order history, detail & cancellation endpoints | 5h |
| Admin order management endpoints | 4h |
| Own Swagger docs, seed script & tests for cart/order module | 7h |

### Dependencies
- Depends on Developer 1's auth middleware for all endpoints (cart/orders are always user-specific).
- Depends on Developer 2's **finalized Book schema** (needs `price` and `stock` fields) before checkout logic can be written — this is the tightest cross-dependency in the project.
- Recommend Developer 2 shares the Book schema/model file (even as a draft) by day 2-3 so Developer 3 isn't blocked.

---

## Developer 4 — Reviews, Wishlist & Admin Analytics
*Customer feedback, saved-for-later books, and reporting for admins*

### Responsibilities
- Design the Review schema and implement per-book review CRUD.
- Implement average rating / review-count rollup onto the Book document whenever a review is added, edited, or deleted.
- Design the Wishlist schema and implement add/view/remove endpoints for a per-user saved-books list.
- Build read-only admin analytics endpoints (sales overview, top-rated/most-reviewed books, low-stock alerts) that aggregate data across Books, Orders, and Reviews for the admin dashboard the Angular frontend will consume later.
- Write the Swagger annotations, seed script (sample reviews & wishlists), and test file for their **own** review/wishlist/analytics endpoints — same standard as every other developer.

### Database Models Owned: `Review`, `Wishlist`

**Review**

| Field | Type | Notes |
|---|---|---|
| book | ObjectId (ref Book) | required |
| user | ObjectId (ref User) | required |
| rating | Number | required, 1-5 |
| comment | String | optional, max length validated |
| (compound index) | book + user | unique — one review per user per book |

**Wishlist**

| Field | Type | Notes |
|---|---|---|
| user | ObjectId (ref User) | required, unique (one wishlist per user) |
| books | [ObjectId] (ref Book) | saved-for-later book references |

### API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/books/:bookId/reviews` | List reviews for a book, paginated | Public |
| POST | `/api/v1/books/:bookId/reviews` | Add a review (one per user per book) | Authenticated |
| PUT | `/api/v1/reviews/:id` | Edit own review | Authenticated (owner) |
| DELETE | `/api/v1/reviews/:id` | Delete a review | Owner or Admin |
| GET | `/api/v1/wishlist` | View own wishlist | Authenticated |
| POST | `/api/v1/wishlist/items` | Add a book to wishlist | Authenticated |
| DELETE | `/api/v1/wishlist/items/:bookId` | Remove a book from wishlist | Authenticated |
| GET | `/api/v1/admin/stats/overview` | Total users, orders, revenue snapshot | Admin |
| GET | `/api/v1/admin/stats/top-books` | Top-rated / most-reviewed books | Admin |
| GET | `/api/v1/admin/stats/low-stock` | Books below a stock threshold | Admin |

### Estimated Workload: ~30 hours

| Task | Hours |
|---|---|
| Review schema + CRUD endpoints | 6h |
| Rating rollup logic onto Book | 3h |
| Wishlist schema + endpoints | 7h |
| Admin analytics endpoints (aggregation queries) | 7h |
| Own Swagger docs, seed script & tests for review/wishlist/analytics | 7h |

### Dependencies
- Depends on Developer 1's auth middleware for all endpoints (reviews, wishlist, and admin stats all require a logged-in user).
- Depends on Developer 2's Book model for reviews, wishlist entries, and the ratings/stock fields used in analytics.
- The **admin analytics** endpoints additionally depend on Developer 3's Order model (for revenue figures) — schedule this piece for week 3, once Orders is stable, and build Reviews and Wishlist first.

---

## 4. Suggested Integration Timeline

A rough 3-week cadence that keeps the shared dependency (auth) from blocking the rest of the team. Each developer writes their own docs/seed/tests as they build in Week 2 — nothing is saved up for one person at the end. Week 3's end-to-end integration testing and README assembly are done **together**, not assigned to a single teammate.

| Week | Everyone | Dev 1 | Dev 2 | Dev 3 | Dev 4 |
|---|---|---|---|---|---|
| 1 | Agree on schemas, API & docs/test conventions (Section 1) | Setup, User model, auth + JWT middleware, shared Swagger/Jest scaffolding | Book/Category schemas, read-only endpoints | Cart schema, cart endpoints (mocked auth) | Review + Wishlist schemas, review CRUD start |
| 2 | Integrate auth middleware into all routes | User endpoints; own docs/seed/tests for auth & users | Full CRUD, pagination/filter/search; own docs/seed/tests | Checkout logic once Book schema is final; own docs/seed/tests | Wishlist endpoints, rating rollup; own docs/seed/tests |
| 3 | Merge branches, joint end-to-end testing, assemble README together | Support integration, edge cases | Support integration, edge cases | Order admin endpoints, cancellation | Admin analytics endpoints (needs Orders) |

---

## 5. Key Success Factors

- **Lock the schemas early.** Book, User, and Order shapes should be agreed on and shared in a common doc/branch by day 2 — most cross-dependencies stem from schema shape, not endpoint logic.
- **Developer 1 ships auth middleware first, even in rough form.** A stubbed `protect()` that just checks for a bearer token unblocks the rest of the team days earlier than waiting for a polished version.
- **Use feature branches per developer** (e.g. `feature/auth`, `feature/catalog`) merging into a shared `develop` branch to avoid one long conflict-heavy merge at the end.
- **Agree on the response envelope and error format up front** so the eventual Angular frontend can consume every module the same way.
- **Nobody owns "QA" alone.** Each developer's estimate already bakes in the time to document, seed, and test their own module — this keeps the workload even and means no one is left cleaning up after the other three in the final days.
- **Reserve the last few days for joint integration testing** of full user journeys (register → browse → cart → checkout → review) and merging branches together as a team, not as one person's solo task.

---
*Book Store REST API — Backend Architecture Document*
