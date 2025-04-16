# REST API Plan

## 1. Resources

- **Users** (from the `users` table)
  - Managed by Supabase Auth.
  - Key fields: `id`, `email`, `encrypted_password`, `created_at`, `confirmed_at`.

- **Audits** (from the `audits` table)
  - Key fields: `id`, `audit_order_number`, `description`, `protocol`, `summary`, `status`, `created_at`, `updated_at`, `user_id`.
  - Validations:
    - `audit_order_number`: 2 to 20 characters (unique).
    - `protocol`: 1000 to 10000 characters.
  - Relationship: Each audit belongs to one user (one-to-many relationship with Users).

## 2. Endpoints

### Audits Resource Endpoints

#### 1. List Audits
- **Method:** GET
- **URL:** `/audits`
- **Description:** Retrieve a paginated list of audits associated with the authenticated user.
- **Query Parameters:**
  - `page` (optional, default 1)
  - `limit` (optional, default 10)
  - `sort` (optional, to define sort order)
- **Response Structure:**
  ```json
  {
    "audits": [
      {
        "id": "uuid",
        "audit_order_number": "string",
        "description": "string",
        "protocol": "string",
        "summary": "string",
        "status": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 500 Internal Server Error

#### 2. Get Audit Details
- **Method:** GET
- **URL:** `/audits/{id}`
- **Description:** Retrieve the details of a specific audit owned by the authenticated user.
- **Path Parameters:**
  - `id`: Audit UUID
- **Response Structure:**
  ```json
  {
    "id": "uuid",
    "audit_order_number": "string",
    "description": "string",
    "protocol": "string",
    "summary": "string",
    "status": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user_id": "uuid"
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 404 Not Found

#### 3. Create a New Audit
- **Method:** POST
- **URL:** `/audits`
- **Description:** Create a new audit record and associate it with the authenticated user.
- **Request Payload:**
  ```json
  {
    "audit_order_number": "string (2-20 chars)",
    "description": "string (optional)",
    "protocol": "string (1000-10000 chars)"
  }
  ```
- **Response Structure:**
  ```json
  {
    "id": "uuid",
    "audit_order_number": "string",
    "description": "string",
    "protocol": "string",
    "summary": "",
    "status": "pending",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user_id": "uuid"
  }
  ```
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request (validation errors), 401 Unauthorized

#### 4. Update (Edit) an Audit
- **Method:** PATCH
- **URL:** `/audits/{id}`
- **Description:** Update audit fields for a non-approved audit. The `audit_order_number` is immutable.
- **Allowed Fields:** `protocol`, `description`, and `summary`.
- **Request Payload (Example):**
  ```json
  {
    "protocol": "updated protocol text",
    "description": "updated description",
    "summary": "updated summary"
  }
  ```
- **Response Structure:** Returns the updated audit details in the same structure as the GET endpoint.
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 403 Forbidden (if audit is approved), 401 Unauthorized, 404 Not Found

#### 5. Generate AI Summary
- **Method:** POST
- **URL:** `/audits/generate-summary`
- **Description:** This endpoint accepts protocol text in the request payload and returns a summary as a text string where the resulting summary contains bullet points embedded in the text.
- **Request Payload:**
  ```json
  {
    "protocol": "string (1000-10000 chars)"
  }
  ```
- **Response Structure:**
  ```json
  {
    "summary": "• Bullet point 1\n• Bullet point 2\n• Bullet point 3"
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized

#### 6. Approve Audit
- **Method:** POST
- **URL:** `/audits/{id}/approve`
- **Description:** Mark an audit as approved, transitioning it to a read-only state.
- **Request Payload:** Optionally an empty body or confirmation flag.
- **Response Structure:** Returns the updated audit record with `status` set to an approved value (e.g., "approved").
- **Success Codes:** 200 OK
- **Error Codes:** 403 Forbidden (if audit is already approved or in an invalid state), 401 Unauthorized, 404 Not Found

#### 7. Delete an Audit
- **Method:** DELETE
- **URL:** `/audits/{id}`
- **Description:** Delete an audit record. Deletion is allowed only if the audit is not approved.
- **Response:** No content.
- **Success Codes:** 204 No Content
- **Error Codes:** 403 Forbidden (if audit is approved), 401 Unauthorized, 404 Not Found

## 4. Validation and Business Logic

- **Field Validations:**
  - `audit_order_number` must be between 2 and 20 characters.
  - `protocol` must be between 1000 and 10000 characters.
  - Unique constraints on `audit_order_number` are enforced to avoid duplicates.

- **Business Logic:**
  - **Create Audit:** Associates a new audit with the authenticated user and validates the input fields.
  - **Edit Audit:** Allows updating the `protocol`, `description`, and `summary` only if the audit is not in an approved state; the `audit_order_number` is immutable.
  - **Generate Summary:** Synchronously invokes an AI service (e.g., via Openrouter.ai) to produce a bullet-point summary based on the provided protocol; updates the audit record with the generated summary.
  - **Approve Audit:** Marks the audit as finalized (approved) making it read-only, thereby preventing further modifications.
  - **Delete Audit:** Permits deletion only for audits that have not been approved, ensuring finalized records are preserved.

- **Performance and Security Considerations:**
  - **Pagination, Filtering, and Sorting:** Listing endpoints support query parameters to efficiently handle large datasets.
  - **Indexing:** Database indexes on `audit_order_number` and `user_id` enhance query performance.
  - **Rate Limiting and Error Handling:** Especially on AI summary generation endpoints to manage load and prevent abuse. 