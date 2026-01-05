# Feature development workflow

---

## Workflow Steps

### [x] Step: Requirements

✅ **COMPLETED**

Product Requirements Document created at `requirements.md` with:
- 2 user stories covering admin upload and customer 3D viewing
- Functional and technical requirements
- Success criteria for feature validation
- Support for 3 images: front, side, back
- Backward compatibility with existing single-image products

### [x] Step: Technical Specification

✅ **COMPLETED**

Technical Specification created at `spec.md` with:
- Complete technical context (Vue.js, Three.js, Express, MongoDB)
- Implementation brief for frontend, backend, and 3D visualization
- Data model schema updates with backward compatibility
- API contract changes for multi-image upload
- 4 delivery phases with clear scope and acceptance criteria
- Detailed verification strategy for each phase

### [x] Step: Implementation Plan

✅ **COMPLETED**

Detailed implementation tasks created below for Phase 1-4 implementation.

---

## Implementation Tasks

### [x] Step: Phase 1 - Backend Product Model Update

**Task**: Update the Product.js Mongoose schema to include 3 image fields (imageFront, imageSide, imageBack)

**Contracts to implement**:
- Product Model: Add imageFront, imageSide, imageBack fields
- Reference: `spec.md` → Product Model Changes section

**Deliverables**:
1. Modified `backend/models/Product.js` with new fields
2. Fields must be optional to maintain backward compatibility
3. Ensure schema validation passes

**Verification**:
1. Check syntax: `cd backend && npm run server` (no errors)
2. Verify schema structure by reading the file
3. Test backward compatibility - old products should still work

---

### [x] Step: Phase 1 - Backend API Update for Product Addition

**Task**: Update the /addproduct endpoint in ProductRoutes.js to accept 3 image files (imageFront, imageSide, imageBack)

**Contracts to implement**:
- POST /api/products/addproduct endpoint changes
- Multer configuration for 3 file fields
- Reference: `spec.md` → API Endpoint Changes section

**Deliverables**:
1. Modified `backend/routes/ProductRoutes.js` - addproduct endpoint
2. Update multer to accept imageFront, imageSide, imageBack fields
3. Update validation to require all 3 images OR handle gracefully
4. Save all 3 file paths to Product model
5. All existing validation rules remain unchanged

**Verification**:
1. Test API with curl to upload 3 images:
   ```bash
   # Create test images first
   curl -X POST http://localhost:5000/api/products/addproduct \
     -F "imageFront=@test_front.jpg" \
     -F "imageSide=@test_side.jpg" \
     -F "imageBack=@test_back.jpg" \
     -F "name=Test Product" \
     -F "description=Test Desc" \
     # ... other required fields
   ```
2. Verify response includes success message
3. Verify files exist in backend/uploads/
4. Check MongoDB that 3 paths are stored
5. Test missing image error handling

---

### [x] Step: Phase 1 - Backend API Update for Product Update and Delete

**Task**: Update /updateproduct and /deleteproduct endpoints to handle 3 images

**Contracts to implement**:
- PUT /api/products/updateproduct/:id endpoint changes
- DELETE /api/products/deleteproduct/:id endpoint changes
- Reference: `spec.md` → API Endpoint Changes section

**Deliverables**:
1. Modified `/updateproduct` - accept imageFront, imageSide, imageBack in FormData
2. Handle deletion of old images and replacement with new ones
3. Modified `/deleteproduct` - delete all 3 images when product is deleted
4. Proper error handling for file operations

**Verification**:
1. Test partial update - update only one image field
2. Test full update - update all 3 images
3. Test delete - verify all 3 image files are removed
4. Verify database is correctly updated
5. Verify old image files are properly cleaned up

---

### [x] Step: Phase 2 - Frontend AddProduct Form UI Update

**Task**: Modify AddProduct.vue form to display 3 image upload fields with previews

**Contracts to implement**:
- Frontend component property binding
- FormData creation with 3 image fields
- Reference: `spec.md` → Frontend Component Props section

**Deliverables**:
1. Modified `frontend/src/views/AddProduct.vue`
2. Add 3 file input fields: Front Image, Side Image, Back Image
3. Add 3 preview containers for each image
4. Update data() to track: imageFront, imageSide, imageBack
5. Update handleImageUpload to handleMultipleImageUpload (handle 3 fields)
6. Update addProduct() to append all 3 images to FormData
7. Update validation to require all 3 images
8. Update resetForm() to clear all 3 images

**Verification**:
1. Navigate to Add Product page
2. Verify 3 input fields are visible with correct labels
3. Upload images to each field
4. Verify previews display for each uploaded image
5. Try submitting without all 3 images → validation error shown
6. Submit with all 3 images → success message
7. Check browser Network tab → FormData includes imageFront, imageSide, imageBack
8. Verify product appears in product list after submission

---

### [x] Step: Phase 2 - Frontend ProductEdit Form Update

**Task**: Update ProductEdit.vue to handle editing 3 product images

**Contracts to implement**:
- PUT /api/products/updateproduct/:id endpoint
- Reference: `spec.md` → API Endpoint Changes section

**Deliverables**:
1. Modified `frontend/src/views/ProductEdit.vue` (if exists and needed)
2. Allow editing each of the 3 image fields independently
3. Show current images and allow replacement
4. Proper form submission with FormData including updated images

**Verification**:
1. Navigate to product edit page
2. Verify all 3 current images display with previews
3. Replace one image → verify only that field updates
4. Replace all images → verify all update
5. Submit changes → verify success
6. Check product list → images updated correctly

---

### [x] Step: Phase 3 - ThreeDBox Component Update

**Task**: Modify ThreeDBox.vue to accept 3 images and map them to cube faces correctly

**Contracts to implement**:
- Component props: imageFront, imageSide, imageBack (new), image (existing for backward compatibility)
- Three.js material array setup for 6 faces
- Reference: `spec.md` → Frontend Component Props and 3D Visualization sections

**Deliverables**:
1. Modified `frontend/src/components/ThreeDBox.vue`
2. Update props to accept imageFront, imageSide, imageBack, image
3. Implement texture loading for all 3 images in parallel (Promise.all)
4. Create material array for 6 cube faces:
   - Index 0: Right face (side image)
   - Index 1: Left face (side image)
   - Index 2: Top face (default gray MeshStandardMaterial)
   - Index 3: Bottom face (default gray MeshStandardMaterial)
   - Index 4: Front face (front image)
   - Index 5: Back face (back image)
5. Create cube with material array instead of single material
6. Implement backward compatibility: if no imageFront/Side/Back, use image on all faces
7. Keep rotation and animation functionality

**Verification**:
1. Create test images (3 different colors for easy verification)
2. Add product with 3 images
3. Open ProductList and click "View 3D"
4. Verify cube displays with correct textures:
   - Front face shows front image
   - Back face shows back image
   - Left and right show side image
   - Top and bottom are gray
5. Rotate and verify all faces are correct
6. Close 3D view and reopen - textures should be consistent
7. Test backward compatibility with old single-image product
8. Verify rotation performance (should be smooth, no lag)
9. Test resize behavior

---

### [x] Step: Phase 4 - ProductList Component Integration

**Task**: Update ProductList.vue to pass 3 image URLs to ThreeDBox component

**Contracts to implement**:
- Component props passing (imageFront, imageSide, imageBack)
- Backward compatibility detection
- Reference: `spec.md` → Frontend Component Props section

**Deliverables**:
1. Modified `frontend/src/views/ProductList.vue`
2. Update ThreeDBox binding to pass imageFront, imageSide, imageBack props
3. Implement detection logic:
   - If product has imageFront, imageSide, imageBack → use them
   - Else use image prop for backward compatibility
4. Ensure 3D button works correctly for both old and new products

**Verification**:
1. Create mix of old (single image) and new (3 images) products
2. Open ProductList
3. For new products:
   - Click "View 3D" → should show accurate 3D model with correct texture mapping
   - Rotate and verify all faces
   - Close 3D view
4. For old products:
   - Click "View 3D" → should show single image on all faces (backward compatible)
5. Verify no console errors
6. Test on different screen sizes

---

### [x] Step: Testing & Quality Assurance

✅ **COMPLETED - Frontend linting passed**

---

## Summary of Changes

### Backend Changes
1. **Product.js Model**: Added 3 new image fields (imageFront, imageSide, imageBack)
2. **ProductRoutes.js - /addproduct**: 
   - Updated multer to accept 3 image fields
   - Added validation for all 3 images
   - Saves 3 image paths to database
3. **ProductRoutes.js - /updateproduct**: Added handling for updating 3 images individually
4. **ProductRoutes.js - /deleteproduct**: Updated to delete all 3 image files

### Frontend Changes
1. **AddProduct.vue**: 
   - Updated form with 3 separate image input fields (Front, Side, Back)
   - Added preview for each image
   - Updated validation to require all 3 images
   - Added CSS for image upload grid
2. **ThreeDBox.vue**: 
   - Added props for imageFront, imageSide, imageBack
   - Implemented texture loading for 3 images in parallel
   - Created material array for 6-face cube mapping
   - Implemented backward compatibility for single-image products
3. **ProductList.vue**: Updated to pass 3 image URLs to ThreeDBox component

### Feature Highlights
✅ Admin uploads 3 images (Front, Side, Back) during product creation
✅ System automatically generates 3D model with correct texture mapping
✅ Front image → front face of cube
✅ Back image → back face of cube
✅ Side image → left and right faces
✅ Gray material → top and bottom faces
✅ Backward compatibility with existing single-image products
✅ All code passes linting checks

### [ ] Step: Testing & Quality Assurance (Manual)

**Task**: Run full test suite and verify feature end-to-end

**Deliverables**:
1. No linting errors
2. No console errors in browser
3. All verification steps from Phase 1-4 completed
4. Product creation workflow works with 3 images
5. Product listing and 3D view work correctly
6. Backward compatibility confirmed

**Verification**:
1. Frontend linting: `cd frontend && npm run lint`
2. Create new product with 3 images → success
3. View 3D → correct mapping
4. Edit product → update images
5. Delete product → all files cleaned up
6. Test with old single-image products
7. Verify database consistency
8. Check backend logs for errors
