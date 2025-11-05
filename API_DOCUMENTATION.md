# API Documentation - Weekly Menu Creation

**Version:** 2.0  
**Last Updated:** November 5, 2025  
**Base URL:** `/api`

---

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Data Types](#data-types)
4. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Recipe Images](#recipe-images)
   - [Weekly Menus](#weekly-menus)
   - [Canva Integration](#canva-integration)
5. [Error Handling](#error-handling)
6. [Pagination](#pagination)

---

## Introduction

This document provides a comprehensive overview of the API endpoints for the Weekly Menu Creation feature. All endpoints are built on a RESTful architecture and return JSON responses.

### API Principles

- **Stateless:** Each request is independent
- **JSON:** All data is exchanged in JSON format
- **Standard HTTP Verbs:** GET, POST, PUT, DELETE
- **Consistent Responses:** Standard success and error formats
- **Pagination:** For all list endpoints

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible. In a future release, JWT-based authentication will be implemented.

---

## Data Types

### RecipeImage

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `recipe_id` | integer | ID of the associated recipe |
| `image_url` | string | Local path to the uploaded image |
| `canva_asset_id` | string | Canva asset ID after upload |
| `is_default` | boolean | Whether this is the default image |
| `width` | integer | Image width in pixels |
| `height` | integer | Image height in pixels |
| `file_size` | integer | File size in bytes |
| `created_at` | string | Timestamp of creation |
| `updated_at` | string | Timestamp of last update |

### WeeklyMenu

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `user_id` | integer | ID of the user (default 1) |
| `week_start_date` | string | The Monday of the menu week (YYYY-MM-DD) |
| `name` | string | Optional name for the menu |
| `description` | string | Optional description of the menu |
| `total_cost` | number | Total cost for the entire week |
| `canva_design_id` | string | Canva design ID for the generated menu |
| `export_url` | string | URL to the exported menu image |
| `is_published` | boolean | Whether the menu is published/shared |
| `created_at` | string | Timestamp of creation |
| `updated_at` | string | Timestamp of last update |

### WeeklyMenuItem

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `weekly_menu_id` | integer | ID of the weekly menu |
| `day_of_week` | integer | Day of the week (1=Mon, 2=Tue, etc.) |
| `recipe_id` | integer | ID of the recipe |
| `category` | string | Category: Sabzi, Dal, Rice, Roti, Special |
| `display_order` | integer | Order in which items are displayed |
| `cost` | number | Cost of this item |
| `created_at` | string | Timestamp of creation |

### CanvaTemplate

| Field | Type | Description |
|---|---|---|
| `id` | integer | Unique identifier |
| `canva_design_id` | string | Canva design ID |
| `name` | string | Name of the template |
| `style` | string | Style of the template (e.g., modern) |
| `thumbnail_url` | string | URL to the template thumbnail |
| `page_count` | integer | Number of pages in the template |
| `is_default` | boolean | Whether this is the default template |
| `is_system_template` | boolean | Whether this is a system template |
| `created_at` | string | Timestamp of creation |

---

## Endpoints

### Health Check

#### `GET /`

Returns the status of the API.

**Response (200 OK):**
```json
{
  "message": "Recipe Costing API V2 is running",
  "version": "2.0.0",
  "features": [
    "products",
    "recipes",
    "weekly-menus",
    "canva-integration"
  ]
}
```

---

### Recipe Images

#### `GET /api/recipe-images/:recipeId`

Get all images for a specific recipe.

**Parameters:**
- `recipeId` (integer, required): ID of the recipe

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recipe_id": 1,
      "image_url": "/uploads/recipe-images/image.jpg",
      "canva_asset_id": "...",
      "is_default": true,
      ...
    }
  ]
}
```

#### `POST /api/recipe-images/upload`

Upload a new image for a recipe.

**Request Body (multipart/form-data):**
- `recipeId` (integer, required): ID of the recipe
- `image` (file, required): Image file (JPG, PNG, WEBP, max 5MB)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "recipe_id": 1,
    "image_url": "/uploads/recipe-images/new-image.jpg",
    ...
  },
  "message": "Image uploaded successfully"
}
```

#### `POST /api/recipe-images/upload-to-canva`

Upload a local image to Canva.

**Request Body (JSON):**
- `imageId` (integer, required): ID of the image to upload

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "canva_asset_id": "...",
    "thumbnail_url": "..."
  },
  "message": "Image uploaded to Canva successfully"
}
```

#### `PUT /api/recipe-images/:id/set-default`

Set an image as the default for a recipe.

**Parameters:**
- `id` (integer, required): ID of the image

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Default image updated successfully"
}
```

#### `DELETE /api/recipe-images/:id`

Delete an image.

**Parameters:**
- `id` (integer, required): ID of the image

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

### Weekly Menus

#### `GET /api/weekly-menus`

Get all weekly menus.

**Query Parameters:**
- `page` (integer, optional): Page number for pagination
- `pageSize` (integer, optional): Items per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "week_start_date": "2025-11-03",
      "name": "My First Menu",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### `GET /api/weekly-menus/:id`

Get a specific weekly menu by ID.

**Parameters:**
- `id` (integer, required): ID of the menu

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "week_start_date": "2025-11-03",
    "name": "My First Menu",
    "items": [...],
    "itemsByDay": {
      "Monday": [...],
      "Tuesday": [...]
    }
  }
}
```

#### `POST /api/weekly-menus`

Create a new weekly menu.

**Request Body (JSON):**
- `week_start_date` (string, required): YYYY-MM-DD format
- `name` (string, optional)
- `description` (string, optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    ...
  },
  "message": "Menu created successfully"
}
```

#### `PUT /api/weekly-menus/:id`

Update a weekly menu.

**Parameters:**
- `id` (integer, required): ID of the menu

**Request Body (JSON):**
- `week_start_date` (string, optional)
- `name` (string, optional)
- `description` (string, optional)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Menu updated successfully"
}
```

#### `POST /api/weekly-menus/:id/items`

Add items to a weekly menu.

**Parameters:**
- `id` (integer, required): ID of the menu

**Request Body (JSON):**
```json
{
  "items": [
    {
      "dayOfWeek": "Monday",
      "recipeId": 1,
      "category": "Sabzi",
      "displayOrder": 0
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [...], // Array of added items
  "message": "Items added successfully"
}
```

---

### Canva Integration

#### `GET /api/canva/templates`

Get all saved Canva templates.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "canva_design_id": "...",
      "name": "Modern Menu Template",
      ...
    }
  ]
}
```

#### `POST /api/canva/generate-template`

Generate new templates with AI.

**Request Body (JSON):**
- `style` (string, optional): `modern`, `traditional`, `colorful`, `minimalist`
- `customPrompt` (string, optional): Custom description

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "...",
        "thumbnail_url": "..."
      }
    ]
  }
}
```

#### `POST /api/canva/convert-candidate`

Save a generated candidate to the template library.

**Request Body (JSON):**
- `candidateId` (string, required): ID of the candidate
- `name` (string, required): Name for the template
- `style` (string, required): Style of the template

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    ...
  },
  "message": "Template saved successfully"
}
```

#### `PUT /api/canva/templates/:id/default`

Set a template as default.

**Parameters:**
- `id` (integer, required): ID of the template

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Default template updated"
}
```

#### `DELETE /api/canva/templates/:id`

Delete a template.

**Parameters:**
- `id` (integer, required): ID of the template

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

#### `POST /api/canva/export-menu`

Export a menu to a file.

**Request Body (JSON):**
- `menuId` (integer, required): ID of the menu
- `format` (string, optional): `png`, `pdf`, `jpg` (default: `png`)
- `quality` (string, optional): `low`, `medium`, `high` (default: `high`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "export_url": "..."
  },
  "message": "Menu exported successfully"
}
```

#### `POST /api/canva/share-menu`

Create a shareable link for a menu.

**Request Body (JSON):**
- `menuId` (integer, required): ID of the menu

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "share_url": "..."
  },
  "message": "Share link created successfully"
}
```

---

## Error Handling

All errors are returned in a standard format:

**Response (4xx/5xx):**
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

### Common HTTP Status Codes

- **200 OK:** Request was successful
- **201 Created:** Resource was created successfully
- **400 Bad Request:** Invalid request body or parameters
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server-side error

---

## Pagination

All list endpoints support pagination via query parameters.

**Query Parameters:**
- `page`: The page number to retrieve (default: 1)
- `pageSize`: The number of items per page (default: 10, max: 100)

**Response:**
The response for paginated endpoints includes a `pagination` object:

```json
{
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

*This documentation is automatically generated and updated.*
