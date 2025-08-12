## Sellup Admin API

Base URL: `http://localhost:3000`

Authentication: All endpoints except login require header `Authorization: Bearer <admin-token>`.

### Auth
- POST `/admin/login`
  - Body:
    ```json
    { "email": "admin@example.com", "password": "StrongPassword123!" }
    ```
  - Response:
    ```json
    { "success": true, "token": "<jwt>", "adminInfo": { ... } }
    ```

### Users
- GET `/admin/users`
  - Query params:
    - `page` (number, default 1)
    - `limit` (number, default 20)
    - `search` (string)
    - `isActive` (boolean, default true)
    - `isDeleted` (boolean, default false)
    - Optional field filters: `name`, `lastName`, `email`, `phoneNumber`, `city`, `state`, `area`, `zipCode`, `country`
  - Response: `{ users: [..], page, limit, total, totalPages }`

- GET `/admin/users/:userId`
  - Fetch a single user by id
  - Response: `{ user }`

- PATCH `/admin/users/:userId`
  - Body (any subset):
    ```json
    {
      "name": "New",
      "lastName": "Name",
      "email": "new@example.com",
      "phoneNumber": "9876543210",
      "address": "Street",
      "area": "Area",
      "city": "City",
      "state": "State",
      "country": "Country",
      "zipCode": "380001",
      "avatar": "https://...",
      "latitude": 23.02,
      "longitude": 72.57,
      "isActive": true,
      "isDeleted": false,
      "productLimit": 20,
      "isChatEnabled": true,
      "isCallEnabled": false
    }
    ```
  - Response: `{ message, user }`

- DELETE `/admin/users/:userId`
  - Query:
    - `hard` (boolean, default false) — if true, permanently deletes the user
  - Soft delete (default): sets `isDeleted=true` and `isActive=false`
  - Response (soft): `{ message: "User soft deleted", user }
  - Response (hard): `{ message: "User permanently deleted" }`

- GET `/admin/users-with-products`
  - Same query params as `/admin/users`
  - Response includes `productCount` per user: `{ users: [ { ..., productCount } ], page, limit, total, totalPages }`

- GET `/admin/users/counts`
  - Returns aggregate metrics:
    ```json
    {
      "totalUsers": 1200,
      "newUsersLast7Days": 45,
      "inactiveUsers": 130,
      "deletedUsers": 12
    }
    ```

### Products
- GET `/admin/products`
  - Query params:
    - `page`, `limit`, `search`
    - Status: `isDelete` (boolean, default false)
    - Filters: `category`, `subCategory`, `rentType`, `vendorName`, `vendorPhone`
    - Location: `city`, `state`, `area`, `country`, `zipCode`
    - `userId` (to fetch products by user)
    - Price range: `priceMin`, `priceMax`
  - Response: `{ products: [..], page, limit, total, totalPages }`

- GET `/admin/users/:userId/products`
  - Query: `page`, `limit`
  - Returns all non-deleted products for a user: `{ products: [..], page, limit, total, totalPages }`

- DELETE `/admin/products/:productId`
  - Query:
    - `hard` (boolean, default false) — if true, permanently deletes the product
  - Soft delete (default): sets `isDelete=true`
  - Response (soft): `{ message: "Product soft deleted", product }`
  - Response (hard): `{ message: "Product permanently deleted" }`

### Postman Collection
Import `docs/Admin.postman_collection.json` into Postman. Set `baseUrl` and use the "Admin Login" request to populate `{{adminToken}}` automatically.


