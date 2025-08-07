# AI Influencer Platform

A comprehensive platform for managing AI-generated content and influencer profiles.

## Features

### File Management (Vault)

The Vault component provides a powerful file management system with the following capabilities:

#### File Upload
- **Drag & Drop**: Simply drag files from your computer and drop them onto the upload area
- **Click to Upload**: Click the upload card to open a file browser
- **Multiple File Types**: Supports images and videos
- **Auto-detection**: Automatically detects file type and format
- **Progress Tracking**: Real-time upload progress with visual feedback

#### Upload Locations
- **Root Level**: Upload files directly to the main vault
- **Folder Level**: Upload files to any specific folder
- **Empty Folders**: Special prominent upload area when folders are empty

#### Upload Features
- **File Preview**: See a preview of your file before uploading
- **Custom Filename**: Option to rename files during upload
- **Metadata Support**: Files are stored with comprehensive metadata
- **Database Integration**: Files are tracked in the database with full metadata

#### How to Upload Files

1. **Navigate to Vault**: Go to the Vault page in the application
2. **Choose Location**: Navigate to the folder where you want to upload (or stay at root)
3. **Upload Methods**:
   - **Method 1**: Drag and drop files directly onto the upload card
   - **Method 2**: Click the upload card to open the file browser
4. **File Selection**: Choose your file (supports images and videos)
5. **Review**: The upload modal will show file preview and allow filename editing
6. **Upload**: Click "Upload File" to complete the process

#### Supported File Types
- **Images**: JPG, PNG, GIF, WebP, and other image formats
- **Videos**: MP4, MOV, AVI, and other video formats
- **File Size**: No strict limits, but larger files may take longer to upload

#### Upload Card Features
- **Visual Feedback**: Changes appearance when dragging files over it
- **Responsive Design**: Adapts to different screen sizes
- **Empty State**: Special styling when no files exist in the current location
- **Accessibility**: Keyboard and screen reader friendly

#### File Management After Upload
Once uploaded, files can be:
- **Viewed**: Click to see full details
- **Downloaded**: Download files to your computer
- **Shared**: Generate shareable links
- **Organized**: Move between folders
- **Tagged**: Add custom tags for organization
- **Rated**: Rate files with star ratings
- **Favorited**: Mark files as favorites
- **Deleted**: Remove files when no longer needed

## Technical Details

### Upload Process
1. File is validated and processed
2. File is uploaded to the backend storage
3. Metadata is created and stored in the database
4. File is indexed for search and filtering
5. Success notification is shown to the user

### Error Handling
- File validation errors
- Network upload failures
- Duplicate filename handling
- Storage quota exceeded
- Invalid file type detection

### Security
- File type validation
- Size limits enforcement
- User authentication required
- Secure file storage

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Navigate to the Vault page to test file upload functionality

## Contributing

When contributing to the file upload functionality:
- Test with various file types and sizes
- Ensure drag and drop works across browsers
- Verify error handling for edge cases
- Test accessibility features
- Update documentation for any new features 