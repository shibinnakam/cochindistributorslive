# Technical Specification: Multi-Image Product 3D View

## Technical Context

- **Language/Frontend**: Vue.js 3.2.13 with JavaScript
- **Language/Backend**: Node.js with Express 5.1.0
- **3D Rendering**: Three.js 0.182.0
- **File Upload**: Multer 2.0.2
- **Database**: MongoDB with Mongoose 8.17.0
- **Storage**: Local file system (`/backend/uploads/`)

---

## Technical Implementation Brief

The feature enhances the existing product image upload and 3D visualization system:

1. **Frontend Changes**:
   - Modify `AddProduct.vue` to accept 3 image inputs (front, side, back) instead of one
   - Update `ThreeDBox.vue` component to handle multiple texture mapping on cube faces
   - Ensure backward compatibility with single-image products

2. **Backend Changes**:
   - Update `ProductRoutes.js` multer configuration to accept 3 image fields
   - Extend `Product.js` model to store 3 image paths
   - Modify validation to ensure all 3 images are provided
   - Update delete and update endpoints to handle 3 images

3. **3D Visualization**:
   - Use Three.js `BoxGeometry` with an array of 6 materials (one per face)
   - Create material array: [frontMat, backMat, rightMat, leftMat, topMat, bottomMat]
   - Map textures: front→index 4, back→index 5, side→indices 0,2, default→indices 1,3

4. **Data Flow**:
   - User selects 3 images in Add Product form
   - FormData includes: imageFront, imageSide, imageBack
   - Backend saves 3 files and stores 3 paths in database
   - Product list retrieves all 3 paths
   - ThreeDBox component receives all 3 image URLs and applies correct mapping

---

## Source Code Structure

```
frontend/
├── src/
│   ├── views/
│   │   ├── AddProduct.vue (MODIFIED)
│   │   └── ProductList.vue (NO CHANGE)
│   └── components/
│       └── ThreeDBox.vue (MODIFIED)

backend/
├── routes/
│   └── ProductRoutes.js (MODIFIED)
├── models/
│   └── Product.js (MODIFIED)
└── uploads/ (EXISTING - stores image files)
```

---

## Contracts

### Product Model Changes

**Current Schema**:
```javascript
{
  image: String,        // single image path
  model3D: String,      // optional 3D model
  // ... other fields
}
```

**New Schema**:
```javascript
{
  image: String,           // DEPRECATED - kept for backward compatibility
  imageFront: String,      // NEW - front view image path
  imageSide: String,       // NEW - side view image path
  imageBack: String,       // NEW - back view image path
  model3D: String,         // existing field
  // ... other fields
}
```

**Backward Compatibility Logic**:
- If `imageFront`, `imageSide`, `imageBack` exist → use them
- Else if `image` exists → use same image for all faces (legacy behavior)
- Else → use default placeholder

### API Endpoint Changes

**POST /api/products/addproduct**

**Request Changes**:
```
FormData:
- imageFront: File (required) - product front image
- imageSide: File (required) - product side image
- imageBack: File (required) - product back image
- (all other fields remain the same)
```

**Response** (unchanged):
```json
{
  "success": true,
  "message": "Product added successfully",
  "product": { /* product object with new image fields */ }
}
```

**PUT /api/products/updateproduct/:id**

**Request Changes**:
```
FormData:
- imageFront: File (optional) - update front image
- imageSide: File (optional) - update side image
- imageBack: File (optional) - update back image
- (all other fields remain the same)
```

**Frontend Component Props**

**ThreeDBox.vue - New Props**:
```javascript
props: {
  imageFront: String,   // NEW - front image URL
  imageSide: String,    // NEW - side image URL
  imageBack: String,    // NEW - back image URL
  image: String,        // EXISTING - for backward compatibility
}
```

---

## Delivery Phases

### Phase 1: Backend - Product Model & API Update
**Scope**: Update database schema and API to accept 3 images
**Deliverables**:
1. Update `Product.js` schema with new fields
2. Update `ProductRoutes.js` /addproduct endpoint to accept 3 images
3. Update /updateproduct endpoint to handle 3 images
4. Update /deleteproduct endpoint to delete 3 images
5. Implement backward compatibility logic

**Acceptance Criteria**:
- API accepts 3 image files
- Files are saved correctly to filesystem
- Database stores 3 paths
- Old products still work with single image

---

### Phase 2: Frontend - Add Product Form Update
**Scope**: Update UI to allow uploading 3 images
**Deliverables**:
1. Modify `AddProduct.vue` form to have 3 image input fields
2. Add preview for each of the 3 images
3. Update validation to require all 3 images
4. Update FormData submission to include 3 images
5. Update ProductEdit.vue to handle 3 images (if needed)

**Acceptance Criteria**:
- Form displays 3 image input fields with labels
- Each image shows preview after selection
- Form validates all 3 images are selected
- Form submits successfully with 3 images
- Error messages display correctly

---

### Phase 3: Frontend - 3D Component Update
**Scope**: Update ThreeDBox.vue to map 3 textures to cube faces
**Deliverables**:
1. Modify `ThreeDBox.vue` to accept 3 image props
2. Implement texture loading for all 3 images in parallel
3. Create material array for 6-faced cube with proper mapping
4. Update cube creation to use material array
5. Ensure rotation and interactivity work smoothly
6. Implement fallback for single image (backward compatibility)

**Acceptance Criteria**:
- 3D cube displays with correct image mappings
- Rotation is smooth (60 FPS)
- Textures load correctly
- Backward compatible with single-image products
- No console errors

---

### Phase 4: Frontend - Product List Integration
**Scope**: Update ProductList.vue to pass new image URLs to 3D viewer
**Deliverables**:
1. Update `ProductList.vue` to pass 3 image URLs to ThreeDBox
2. Ensure backward compatibility detection (check if new fields exist)
3. Test 3D view toggle with new images

**Acceptance Criteria**:
- Product list displays correctly
- 3D button works and shows correct 3D model
- Mixed products (old and new) work correctly

---

## Verification Strategy

### Phase 1 Backend Verification

**Tools**: Bash, Postman/curl, MongoDB inspection

**Steps**:
1. Run linting: `cd backend && npm run server` (ensure no errors)
2. Test API with curl:
   ```bash
   # Test multi-image upload
   curl -X POST http://localhost:5000/api/products/addproduct \
     -F "imageFront=@/path/to/front.jpg" \
     -F "imageSide=@/path/to/side.jpg" \
     -F "imageBack=@/path/to/back.jpg" \
     -F "name=TestProduct" \
     -F "description=Test Desc" \
     # ... other required fields
   ```
3. Verify files are saved in `/backend/uploads/`
4. Query MongoDB to verify 3 image paths are stored
5. Test backward compatibility with single image
6. Test validation error messages

### Phase 2 Frontend Form Verification

**Tools**: Browser console, manual testing

**Steps**:
1. Navigate to Add Product page
2. Verify 3 image input fields are visible with labels (Front, Side, Back)
3. Upload one image to each field
4. Verify previews display correctly
5. Try submitting without all 3 images → should show validation error
6. Submit form with all 3 images → should succeed
7. Check network tab to verify FormData includes all 3 files
8. Verify product appears in product list

### Phase 3 3D Component Verification

**Tools**: Browser DevTools (3D Inspector), visual inspection

**Steps**:
1. Generate test images (3 different colored images for easy verification)
2. Add product with 3 test images
3. Open ProductList and click "View 3D"
4. Rotate cube and verify:
   - Front face shows front image
   - Back face shows back image
   - Left and right faces show side image
   - Top and bottom faces are default gray
5. Verify rotation is smooth (no stuttering)
6. Verify resize handling works
7. Test backward compatibility: add product with old endpoint, verify it still works

### Phase 4 Integration Verification

**Tools**: Manual browser testing, product lifecycle testing

**Steps**:
1. Create new products with 3 images
2. Create old products with single image (simulate)
3. View product list mixed with old and new products
4. Click "View 3D" on new products → should show accurate mapping
5. Click "View 3D" on old products → should show single image on all faces
6. Edit products (change images) → should update correctly
7. Delete products → should delete all image files

---

## Required Sample Artifacts

**Sample Test Images** (can be generated by the agent):
- front.jpg: 500x500px image representing product front
- side.jpg: 500x500px image representing product side
- back.jpg: 500x500px image representing product back

These images should be distinct colors or patterns for easy visual verification during testing.

**Test Product Data**:
- Name: "TestProduct123"
- Description: "Sample test"
- originalPrice: 100
- discountPrice: 75
- quantity: 20
- manufacturingDate: 2024-01-01
- expiryDate: 2025-01-01
- batchNumber: "LOT123456"
- rackNumber: 5
- category: (use existing category ID from database)
