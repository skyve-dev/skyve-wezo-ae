# Photo Management Component

## Overview
The Photo Management component provides a comprehensive interface for managing property photos in the Wezo.ae platform. It allows users to upload, organize, delete, and link/unlink photos to their properties.

## Features

### 1. Display All Available Photos
- Shows all photos (both attached and unattached to properties)
- Grid layout with responsive design
- Visual indicators for attached/unattached status
- Shows property name for attached photos

### 2. Sort Photos by Upload Date
- **Newest First**: Default sorting showing most recent uploads first
- **Oldest First**: Shows older uploads first
- Sorting is based on the photo's creation timestamp

### 3. Delete Individual Photos
- Each photo card has a delete button
- Confirmation dialog before deletion
- Removes photo from both UI and database
- Works for both attached and unattached photos

### 4. Link/Unlink Photos from Properties
- **Linking Photos**:
  - Select multiple unattached photos by clicking on them
  - Choose a property from the dropdown
  - Click "Attach Selected" to link photos to the property
  
- **Unlinking Photos**:
  - Photos attached to properties show a "Detach" button
  - Click to remove the photo's association with the property
  - Photo remains in the system but becomes unattached

### 5. Upload New Photos
- Drag-and-drop or click to select files
- Multiple file selection supported
- Accepts common image formats (JPEG, PNG, WebP)
- Progress indicator during upload
- Success/error messages for upload status

## Usage

### Accessing the Photo Management Page
Navigate to `/dashboard/photos` or click "Manage Photos" from the dashboard.

### API Endpoints Used

#### Photo Operations
- `GET /api/photos/unattached` - Fetch all unattached photos
- `POST /api/photos/upload` - Upload new photos
- `DELETE /api/photos/:photoId` - Delete a photo
- `POST /api/photos/attach/:propertyId` - Attach photos to a property

#### Property Operations
- `GET /api/properties/my-properties` - Fetch user's properties
- `DELETE /api/properties/:propertyId/photos/:photoId` - Detach photo from property

## Component Structure

```typescript
interface ExtendedPhoto extends Photo {
  id: string;
  propertyId?: string | null;
  createdAt?: string;
}
```

### State Management
- `photos`: Array of all photos
- `properties`: Array of user's properties
- `selectedPhotos`: Set of selected photo IDs for bulk operations
- `selectedProperty`: Currently selected property for attachment
- `sortOrder`: Current sort order (newest/oldest)
- `filterType`: Current filter (all/attached/unattached)

## Filter Options
- **All Photos**: Shows all photos regardless of attachment status
- **Attached to Property**: Shows only photos linked to properties
- **Unattached**: Shows only photos not linked to any property

## Error Handling
- Network errors are caught and displayed to the user
- File upload validation (file type and size)
- Confirmation dialogs for destructive actions
- Success messages for completed operations

## Responsive Design
- Grid layout adapts to screen size
- Minimum card width of 250px
- Automatic column adjustment based on viewport

## Security Considerations
- All API calls include JWT authentication token
- Server-side validation of user ownership
- File type validation on upload
- CORS configuration for API requests