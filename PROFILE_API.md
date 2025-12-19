# Profile Management API Documentation

## Endpoints

### POST /api/profile
Create a new profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "johndoe",
  "displayName": "John Doe",
  "bio": "Software developer",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": { ... }
  }
}
```

**Validation:**
- Username: 3-30 chars, lowercase letters, numbers, hyphens, underscores only
- Display name: required
- Username must be unique

---

### GET /api/profile
Get current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "...",
      "username": "johndoe",
      "displayName": "John Doe",
      "bio": "...",
      "avatar": "...",
      "theme": {},
      "colors": {},
      "font": "...",
      "backgroundImage": "..."
    }
  }
}
```

---

### PUT /api/profile
Update current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "username": "newusername",
  "displayName": "New Name",
  "bio": "Updated bio",
  "avatar": "https://example.com/new-avatar.jpg",
  "theme": { "name": "dark" },
  "colors": { "primary": "#000000" },
  "font": "Inter",
  "backgroundImage": "https://example.com/bg.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": { ... }
  }
}
```

---

### GET /api/profile/:username
Get public profile by username (no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "...",
      "username": "johndoe",
      "displayName": "John Doe",
      "bio": "...",
      "avatar": "...",
      "theme": {},
      "colors": {},
      "font": "...",
      "backgroundImage": "..."
    }
  }
}
```

---

### GET /api/profile/check/username?username=johndoe
Check if username is available (no authentication required).

**Query Parameters:**
- `username` (required): Username to check

**Response (200):**
```json
{
  "success": true,
  "data": {
    "username": "johndoe",
    "available": true
  }
}
```

---

## Testing with cURL

### Create Profile
```bash
curl -X POST http://localhost:3001/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "displayName": "John Doe",
    "bio": "Software developer"
  }'
```

### Get Own Profile
```bash
curl -X GET http://localhost:3001/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:3001/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio"
  }'
```

### Get Public Profile
```bash
curl -X GET http://localhost:3001/api/profile/johndoe
```

### Check Username Availability
```bash
curl -X GET "http://localhost:3001/api/profile/check/username?username=johndoe"
```

---

## Username Rules

- Minimum length: 3 characters
- Maximum length: 30 characters
- Allowed characters: lowercase letters (a-z), numbers (0-9), hyphens (-), underscores (_)
- Must be unique across all profiles
- Case-insensitive (automatically converted to lowercase)
