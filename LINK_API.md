# Link Management API Documentation

## Endpoints

### POST /api/links
Create a new link (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My Portfolio",
  "url": "https://example.com",
  "icon": "https://example.com/icon.png",
  "description": "Check out my work"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Link created successfully",
  "data": {
    "link": {
      "id": "...",
      "title": "My Portfolio",
      "url": "https://example.com",
      "icon": "...",
      "description": "...",
      "order": 0,
      "clicks": 0
    }
  }
}
```

**Validation:**
- Title: required
- URL: required, must be valid HTTP/HTTPS URL
- Icon: optional
- Description: optional

---

### GET /api/links
Get all links for current user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "links": [
      {
        "id": "...",
        "title": "My Portfolio",
        "url": "https://example.com",
        "icon": "...",
        "description": "...",
        "order": 0,
        "clicks": 5
      }
    ]
  }
}
```

**Note:** Links are returned sorted by order (ascending).

---

### PUT /api/links/:id
Update a link (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "url": "https://newurl.com",
  "icon": "https://example.com/new-icon.png",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Link updated successfully",
  "data": {
    "link": { ... }
  }
}
```

---

### DELETE /api/links/:id
Delete a link (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Link deleted successfully"
}
```

**Note:** Remaining links are automatically reordered after deletion.

---

### PUT /api/links/reorder
Reorder links (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "linkIds": ["link_id_1", "link_id_2", "link_id_3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Links reordered successfully",
  "data": {
    "links": [ ... ]
  }
}
```

**Note:** Order is determined by array position (0 = first, 1 = second, etc.)

---

### GET /api/links/public/:username
Get all links for a public profile (no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "links": [
      {
        "id": "...",
        "title": "My Portfolio",
        "url": "https://example.com",
        "icon": "...",
        "description": "...",
        "order": 0
      }
    ]
  }
}
```

**Note:** Click counts are not included in public API.

---

### GET /api/links/track/:id
Track a link click and get redirect URL (no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com"
  }
}
```

**Note:** This endpoint increments the click counter and returns the URL to redirect to.

---

## Testing with cURL

### Create Link
```bash
curl -X POST http://localhost:3001/api/links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Portfolio",
    "url": "https://example.com",
    "description": "Check out my work"
  }'
```

### Get All Links
```bash
curl -X GET http://localhost:3001/api/links \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Link
```bash
curl -X PUT http://localhost:3001/api/links/LINK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'
```

### Delete Link
```bash
curl -X DELETE http://localhost:3001/api/links/LINK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reorder Links
```bash
curl -X PUT http://localhost:3001/api/links/reorder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "linkIds": ["id1", "id2", "id3"]
  }'
```

### Get Public Links
```bash
curl http://localhost:3001/api/links/public/johndoe
```

### Track Link Click
```bash
curl http://localhost:3001/api/links/track/LINK_ID
```

---

## Link Ordering

- Links are automatically ordered when created (0, 1, 2, ...)
- Use `/reorder` endpoint to change the order
- When a link is deleted, remaining links are automatically reordered
- Links are always returned sorted by order (ascending)

---

## Click Tracking

- Each link has a `clicks` counter
- Use `/track/:id` endpoint to increment counter and get redirect URL
- Click counts are only visible to the link owner (not in public API)
