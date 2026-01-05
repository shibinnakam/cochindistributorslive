# Feature Specification: Multi-Image Product 3D View

## User Stories

### User Story 1 - Admin Uploads Multiple Product Images

**Acceptance Scenarios**:

1. **Given** an admin is adding a new product, **When** they navigate to the image upload section, **Then** they should see input fields for Front Image, Side Image, and Back Image
2. **Given** an admin has uploaded all 3 images (front, side, back), **When** they click "Add Product", **Then** the product should be saved with all 3 images
3. **Given** an admin is adding a product, **When** they upload files with incorrect formats (e.g., video files), **Then** they should see an error message and the upload should fail
4. **Given** an admin has uploaded images and clicks the Submit button, **When** the product is saved successfully, **Then** a confirmation message should appear

---

### User Story 2 - Customer Views Accurate 3D Product Model

**Acceptance Scenarios**:

1. **Given** a customer is viewing a product listing, **When** they click "View 3D 🧊" button, **Then** a 3D cube should appear with the correct image mappings (front/back on front-back faces, side images on left-right faces, default color on top-bottom)
2. **Given** the 3D view is open, **When** the customer rotates the product by dragging, **Then** they should see the correctly mapped images on respective faces
3. **Given** the 3D model is displaying, **When** the customer views different angles, **Then** the images should appear correctly mapped and realistic
4. **Given** the 3D view is open, **When** the customer clicks the close button (❌), **Then** the 3D view should close and return to the product card view

---

## Requirements

### Functional Requirements

1. **Multiple Image Upload**:
   - Allow uploading 3 product images: Front, Side, and Back
   - Support both JPG and PNG formats
   - File size limit: 5MB per image
   - All 3 images are required for product creation

2. **Image Mapping to 3D Cube**:
   - Front Image → Front face of cube
   - Back Image → Back face of cube
   - Side Image → Left and Right faces of cube
   - Default material (light gray) → Top and Bottom faces

3. **3D Visualization**:
   - Display accurate 3D cube with correctly mapped images
   - Support rotation and zoom on the 3D model
   - Maintain smooth performance during rotation

4. **Backward Compatibility**:
   - Existing products with single image should still work (display the same image on all faces as before)
   - Gracefully handle products without images

5. **Database and File Storage**:
   - Store 3 image paths in the product database
   - Organize uploaded files in backend uploads folder

### Technical Requirements

1. Use existing Three.js library (already in dependencies)
2. Minimal changes to existing API structure
3. Use FormData for file uploads with multiple files
4. Implement proper validation on both frontend and backend

### Non-Functional Requirements

1. Performance: 3D rendering should be smooth (60 FPS)
2. Responsiveness: 3D view should adapt to container size
3. Accessibility: 3D view should work on desktop browsers supporting WebGL
4. File Security: Only accept image files with proper validation

---

## Success Criteria

1. ✅ Admin can upload 3 distinct product images during product creation
2. ✅ All 3 images are correctly mapped to the 3D cube faces
3. ✅ 3D view displays with proper image textures and smooth rotation
4. ✅ Existing products with single images continue to work
5. ✅ No server errors during multi-image upload
6. ✅ File validation prevents invalid file types
7. ✅ Product list loads and displays correctly with new multi-image support
