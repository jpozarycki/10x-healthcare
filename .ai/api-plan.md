# REST API Plan

## 1. Resources

### Core Resources
- **Users** → `users` table
- **User Profiles** → `user_profiles` table
- **Medications** → `medications` table
- **Schedules** → `medication_schedules` table
- **Adherence Records** → `adherence_records` table
- **Notifications** → `notifications` table
- **Reports** → `adherence_reports` table

### Supporting Resources
- **Categories** → `medication_categories` table
- **Units** → `measurement_units` table
- **Skip Reasons** → `skip_reasons` table
- **Photos** → `medication_photos` table
- **Interactions** → `medication_interactions` table

## 2. Endpoints

### User Profile
#### Get Profile
- **GET** `/v1/profile`
- **Description**: Get current user's profile
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "age": "number",
    "gender": "string",
    "weight": "number",
    "weight_unit": "string",
    "health_conditions": "object",
    "allergies": "object",
    "timezone": "string"
  }
  ```

#### Update Profile
- **PUT** `/v1/profile`
- **Description**: Update user profile
- **Request Body**: Same as Get Profile response
- **Response**: `200 OK`

### Medications
#### List Medications
- **GET** `/v1/medications`
- **Query Parameters**:
  - `category`: Filter by category
  - `status`: active/inactive
  - `page`: Page number
  - `limit`: Items per page
  - `sort`: Sort field
  - `order`: asc/desc
- **Response**: `200 OK`
  ```json
  {
    "items": [{
      "id": "uuid",
      "name": "string",
      "form": "string",
      "strength": "string",
      "category": "string",
      "is_active": "boolean",
      "start_date": "date",
      "end_date": "date",
      "refill_reminder_days": "number"
    }],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
  ```

#### Create Medication
- **POST** `/v1/medications`
- **Description**: Add new medication
- **Request Body**:
  ```json
  {
    "name": "string",
    "form": "string",
    "strength": "string",
    "strength_unit_id": "uuid",
    "category": "string",
    "purpose": "string",
    "instructions": "string",
    "start_date": "date",
    "end_date": "date",
    "refill_reminder_days": "number",
    "pills_per_refill": "number",
    "schedule": {
      "type": "string",
      "pattern": "object",
      "times": ["string"],
      "with_food": "boolean"
    }
  }
  ```
- **Response**: `201 Created`

#### Get Medication
- **GET** `/v1/medications/{id}`
- **Response**: `200 OK`
  - Detailed medication info including schedules

#### Update Medication
- **PUT** `/v1/medications/{id}`
- **Request Body**: Same as Create
- **Response**: `200 OK`

#### Delete Medication
- **DELETE** `/v1/medications/{id}`
- **Response**: `204 No Content`

#### Validate Medication Interactions
- **POST** `/v1/medications/validate-interactions`
- **Description**: Validate medication interactions using AI
- **Request Body**:
  ```json
  {
    "medications": [{
      "id": "uuid",
      "name": "string",
      "strength": "string",
      "form": "string"
    }],
    "new_medication": {
      "name": "string",
      "strength": "string",
      "form": "string"
    },
    "user_context": {
      "health_conditions": ["string"],
      "allergies": ["string"],
      "age": "number"
    }
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "has_interactions": "boolean",
    "severity_level": "low|moderate|high",
    "interactions": [{
      "medication_pair": ["string", "string"],
      "description": "string",
      "severity": "string",
      "recommendations": "string",
      "confidence_score": "number"
    }],
    "disclaimer": "string",
    "model_version": "string",
    "generated_at": "timestamp"
  }
  ```

### Schedules
#### List Medication Schedules
- **GET** `/v1/medications/{id}/schedules`
- **Response**: `200 OK`
  ```json
  {
    "items": [{
      "id": "uuid",
      "schedule_type": "string",
      "schedule_pattern": "object",
      "dose_amount": "number",
      "dose_unit": "string",
      "with_food": "boolean",
      "start_date": "date",
      "end_date": "date"
    }]
  }
  ```

#### Create Schedule
- **POST** `/v1/medications/{id}/schedules`
- **Request Body**: Schedule object
- **Response**: `201 Created`

### Adherence
#### Record Dose
- **POST** `/v1/adherence/record`
- **Description**: Record medication taken/skipped
- **Request Body**:
  ```json
  {
    "medication_id": "uuid",
    "schedule_id": "uuid",
    "status": "taken|skipped",
    "taken_time": "timestamp",
    "skip_reason_id": "uuid",
    "skip_reason_custom": "string"
  }
  ```
- **Response**: `201 Created`

#### Get Adherence Stats
- **GET** `/v1/adherence/stats`
- **Query Parameters**:
  - `start_date`: Start of period
  - `end_date`: End of period
  - `medication_id`: Optional filter
- **Response**: `200 OK`
  ```json
  {
    "overall_rate": "number",
    "by_medication": [{
      "medication_id": "uuid",
      "name": "string",
      "adherence_rate": "number",
      "doses_taken": "number",
      "doses_missed": "number"
    }],
    "trends": {
      "weekly": ["number"],
      "monthly": ["number"]
    }
  }
  ```

### Notifications
#### Get Active Notifications
- **GET** `/v1/notifications`
- **Query Parameters**:
  - `status`: unread/all
  - `page`: Page number
- **Response**: `200 OK`
  ```json
  {
    "items": [{
      "id": "uuid",
      "type": "string",
      "message": "string",
      "scheduled_time": "timestamp",
      "medication": {
        "id": "uuid",
        "name": "string"
      }
    }],
    "total": "number"
  }
  ```

#### Update Notification
- **PUT** `/v1/notifications/{id}`
- **Request Body**:
  ```json
  {
    "is_read": "boolean",
    "response_action": "string"
  }
  ```
- **Response**: `200 OK`

### Reports
#### Generate Report
- **POST** `/v1/reports`
- **Description**: Generate adherence report
- **Request Body**:
  ```json
  {
    "start_date": "date",
    "end_date": "date",
    "report_type": "string",
    "medications": ["uuid"]
  }
  ```
- **Response**: `202 Accepted`
  ```json
  {
    "report_id": "uuid",
    "status": "processing"
  }
  ```

#### Get Report
- **GET** `/v1/reports/{id}`
- **Response**: `200 OK`
  - Report data or status if still processing


## 3. Validation and Business Logic

### Global Validation Rules
- All timestamps in UTC
- Date formats: ISO 8601
- UUID validation for IDs
- Required fields must not be null/empty
- String length limits as per DB schema

### Resource-Specific Validation
#### Medications
- End date must be after start date
- Valid category from enum
- Valid measurement unit
- Refill reminder days > 0
- Pills per refill > 0
- For interaction validation:
  - Confidence threshold of 0.85 for high-severity interactions
  - Multiple LLM validations for critical medications
  - Rate limiting specific to interaction checks
  - Mandatory user context for personalized analysis

#### Schedules
- Valid schedule pattern format
- No overlapping schedules
- Future dates for new schedules
- Valid dose amounts > 0

#### Adherence Records
- Valid medication and schedule
- Taken time within reasonable range
- Skip reason required if status = skipped

### Business Logic Implementation
1. Medication Management
   - Auto-calculate next refill date
   - AI-powered medication interaction validation with:
     - Confidence scoring for each interaction
     - Context-aware analysis using user's health profile
     - Mandatory medical disclaimer
     - Human-readable explanations and recommendations
   - Generate default schedules

2. Smart Reminders
   - AI-powered message generation
   - Escalation rules processing
   - Batch similar-time medications

3. Adherence Tracking
   - Calculate adherence rates
   - Identify patterns
   - Generate insights

4. Report Generation
   - Async processing for large reports
   - PDF generation
   - Data aggregation

### Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Reduced limits for intensive operations

### Error Responses
Standard error format:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

Common status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error 