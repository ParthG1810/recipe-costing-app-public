# Weekly Menu Creation - Implementation Roadmap

**Author:** Manus AI  
**Date:** November 5, 2025  
**Status:** Ready to Begin Implementation

---

## Overview

This document provides a detailed, step-by-step implementation roadmap for the Weekly Menu Creation feature. Based on the successful proof-of-concept, we have validated all critical technical components and can proceed with confidence.

**Estimated Timeline:** 6-7 weeks  
**Complexity:** Medium-High  
**Risk Level:** Low (all critical components validated)

---

## Phase 1: Database & API Foundation (Week 1)

### Objectives
- Set up database tables
- Create backend API endpoints
- Establish Canva authentication flow
- Test basic CRUD operations

### Tasks

#### 1.1 Database Setup
- [ ] Execute `database/weekly_menu_schema.sql` on MySQL server
- [ ] Verify all 6 tables are created successfully:
  - `recipe_images`
  - `weekly_menus`
  - `weekly_menu_items`
  - `canva_templates`
  - `menu_shares`
  - `menu_feedback`
- [ ] Test views: `weekly_menu_summary`, `recipe_with_default_image`
- [ ] Test stored procedure: `get_weekly_menu_details`

#### 1.2 Backend API Endpoints

Create the following API routes in the backend:

**Recipe Images:**
```
POST   /api/recipe-images/upload          - Upload image for recipe
POST   /api/recipe-images/upload-to-canva - Upload image to Canva
GET    /api/recipe-images/:recipeId       - Get all images for recipe
PUT    /api/recipe-images/:id/set-default - Set image as default
DELETE /api/recipe-images/:id             - Delete image
```

**Weekly Menus:**
```
POST   /api/weekly-menus                  - Create new weekly menu
GET    /api/weekly-menus                  - Get all menus for user
GET    /api/weekly-menus/:id              - Get specific menu with items
PUT    /api/weekly-menus/:id              - Update menu metadata
DELETE /api/weekly-menus/:id              - Delete menu
GET    /api/weekly-menus/week/:date       - Get menu for specific week
```

**Weekly Menu Items:**
```
POST   /api/weekly-menu-items             - Add item to menu
PUT    /api/weekly-menu-items/:id         - Update item
DELETE /api/weekly-menu-items/:id         - Delete item
GET    /api/weekly-menu-items/menu/:id    - Get all items for menu
```

**Canva Templates:**
```
POST   /api/canva/generate-template       - Generate template with AI
POST   /api/canva/convert-candidate       - Convert candidate to design
GET    /api/canva/templates               - Get all templates
POST   /api/canva/templates               - Save template
PUT    /api/canva/templates/:id/default   - Set default template
DELETE /api/canva/templates/:id           - Delete template
```

**Menu Export & Share:**
```
POST   /api/menu-export/:menuId           - Export menu to image
POST   /api/menu-share/:menuId            - Create shareable link
GET    /api/menu-share/:token             - View shared menu (public)
POST   /api/menu-feedback/:shareId        - Submit feedback (public)
```

#### 1.3 Canva Authentication

- [ ] Set up Canva OAuth configuration
- [ ] Store Canva credentials securely in environment variables
- [ ] Implement token refresh logic
- [ ] Test authentication flow

#### 1.4 Testing

- [ ] Test all API endpoints with Postman or similar tool
- [ ] Verify database constraints and foreign keys
- [ ] Test error handling for invalid inputs
- [ ] Document API endpoints in Swagger/OpenAPI format

**Deliverables:**
- ✅ Database tables created and tested
- ✅ All API endpoints implemented and documented
- ✅ Canva authentication working
- ✅ Basic CRUD operations tested

---

## Phase 2: Recipe Image Management (Week 2)

### Objectives
- Build image upload interface
- Implement image cropper
- Auto-upload to Canva
- Display image gallery

### Tasks

#### 2.1 Frontend Page Structure

Create new page: `/app/recipe-image-management/page.tsx`

**Layout:**
- Left panel: List of all recipes (scrollable)
- Right panel: Image gallery for selected recipe
- Top bar: Search and filter recipes

#### 2.2 Image Upload Component

- [ ] Create drag-and-drop upload area
- [ ] Support multiple file selection (up to 5 images per recipe)
- [ ] Validate file types (JPG, PNG, WEBP)
- [ ] Validate file sizes (max 5MB per image)
- [ ] Show upload progress indicator

#### 2.3 Image Cropper Integration

- [ ] Install `react-image-crop` or similar library
- [ ] Create cropper modal that opens after upload
- [ ] Set fixed aspect ratio to 1:1 (square)
- [ ] Allow zoom and pan for perfect crop
- [ ] Save cropped image to server

#### 2.4 Canva Upload Integration

- [ ] After image is saved locally, automatically upload to Canva
- [ ] Use Canva MCP `upload-asset-from-url` tool
- [ ] Store Canva asset ID in database
- [ ] Handle upload errors gracefully

#### 2.5 Image Gallery Component

- [ ] Display all images for selected recipe in grid layout
- [ ] Show "Default" badge on default image
- [ ] Implement "Set as Default" button
- [ ] Implement "Delete" button with confirmation
- [ ] Add hover-to-zoom effect
- [ ] Show Canva upload status (uploaded/pending)

#### 2.6 Testing

- [ ] Test upload with various image formats
- [ ] Test cropper with different image sizes
- [ ] Test Canva upload integration
- [ ] Test default image selection
- [ ] Test image deletion
- [ ] Test with multiple recipes

**Deliverables:**
- ✅ Recipe Image Management page fully functional
- ✅ Images uploaded, cropped, and stored
- ✅ Images automatically uploaded to Canva
- ✅ Image gallery displays all images
- ✅ Default image selection working

---

## Phase 3: Weekly Menu Builder (Week 3)

### Objectives
- Build 6-day menu builder interface
- Implement categorized item selection
- Add cost calculation
- Implement save/load functionality

### Tasks

#### 3.1 Frontend Page Structure

Create new page: `/app/weekly-menu-builder/page.tsx`

**Layout:**
- Top: Week selector (date picker for Monday)
- Main area: Six cards (Monday to Saturday)
- Bottom: Total cost summary and action buttons

#### 3.2 Week Selector Component

- [ ] Create date picker that only allows Mondays
- [ ] Display week range (e.g., "November 4-9, 2025")
- [ ] Load existing menu if one exists for selected week
- [ ] Show "New Menu" or "Edit Menu" indicator

#### 3.3 Day Card Component

Each day card should have:
- [ ] Day name and date header
- [ ] List of added items (grouped by category)
- [ ] "Add Item" button for each category:
  - Sabzi
  - Dal/Kadhi
  - Rice
  - Roti/Paratha
  - Special Items
- [ ] Cost for the day
- [ ] Remove item button for each added item

#### 3.4 Item Selection Modal

- [ ] Create modal that opens when "Add Item" is clicked
- [ ] Display recipes filtered by selected category
- [ ] Show recipe image (default image)
- [ ] Show recipe name and cost
- [ ] Allow single or multiple selection
- [ ] Add "Select" button to confirm

#### 3.5 Cost Calculation

- [ ] Calculate cost for each day automatically
- [ ] Calculate total cost for the week
- [ ] Display costs in a summary panel
- [ ] Update costs in real-time as items are added/removed

#### 3.6 Save/Load Functionality

- [ ] Implement "Save Menu" button
- [ ] Save menu name (optional)
- [ ] Save all items to database
- [ ] Implement "Load Previous Menu" dropdown
- [ ] Allow duplicating a previous menu to a new week

#### 3.7 Testing

- [ ] Test adding items to each day
- [ ] Test removing items
- [ ] Test cost calculation accuracy
- [ ] Test save functionality
- [ ] Test load functionality
- [ ] Test with incomplete menus (some days empty)

**Deliverables:**
- ✅ Weekly Menu Builder page fully functional
- ✅ 6-day menu creation working
- ✅ Item selection by category working
- ✅ Cost calculation accurate
- ✅ Save/load functionality working

---

## Phase 4: AI Template Generation (Week 4)

### Objectives
- Create template generation interface
- Integrate Canva AI generation
- Display template candidates
- Implement template selection

### Tasks

#### 4.1 Frontend Page Structure

Create new page: `/app/menu-templates/page.tsx`

**Layout:**
- Top: Template style selector
- Main area: Generated template candidates (grid)
- Bottom: "Generate Templates" button

#### 4.2 Template Style Selector

- [ ] Create style selector with 4 options:
  - Modern (clean, minimalist)
  - Traditional (decorative, ornate)
  - Colorful (vibrant, festive)
  - Minimalist (simple, elegant)
- [ ] Allow custom prompt input (advanced users)
- [ ] Show example of each style

#### 4.3 AI Generation Integration

- [ ] Create backend endpoint that calls Canva MCP `generate-design`
- [ ] Build prompts for each style:
  ```javascript
  const prompts = {
    modern: "Create a modern weekly tiffin menu for Monday to Saturday with clean layout, sans-serif fonts, and space for 4 food images per day. Use neutral colors with accent colors. Include sections for Sabzi, Dal, Rice, and Roti.",
    traditional: "Create a traditional Indian tiffin menu with decorative borders, traditional patterns, and ornate fonts. Use warm colors like orange, red, and gold. Include space for food images and daily items.",
    colorful: "Create a vibrant, colorful weekly tiffin menu with bold colors, playful fonts, and space for food photography. Use Indian food theme with spices and traditional elements.",
    minimalist: "Create a minimalist weekly tiffin menu with simple layout, lots of white space, and clean typography. Use one or two accent colors. Focus on readability and elegance."
  };
  ```
- [ ] Call Canva API with selected style prompt
- [ ] Handle generation errors gracefully
- [ ] Show loading indicator during generation

#### 4.4 Template Candidate Display

- [ ] Display 4 generated candidates in grid layout
- [ ] Show thumbnail for each candidate
- [ ] Add "Select" button on each candidate
- [ ] Add "Regenerate" button to generate new candidates
- [ ] Add "View Full Size" option

#### 4.5 Template Conversion

- [ ] When user selects a candidate, call `create-design-from-candidate`
- [ ] Save converted design ID to database
- [ ] Store template metadata (name, style, thumbnail)
- [ ] Show success message
- [ ] Redirect to menu population page

#### 4.6 Template Library

- [ ] Display previously generated/saved templates
- [ ] Allow setting a default template
- [ ] Allow deleting templates
- [ ] Show template details (style, created date)

#### 4.7 Testing

- [ ] Test generation for each style
- [ ] Test candidate selection
- [ ] Test conversion to editable design
- [ ] Test template library display
- [ ] Test default template selection

**Deliverables:**
- ✅ Template generation page functional
- ✅ AI generation working for all styles
- ✅ Template selection and conversion working
- ✅ Template library displaying saved templates

---

## Phase 5: Auto-populate & Export (Week 5)

### Objectives
- Populate template with menu data
- Implement export functionality
- Create shareable links
- Generate QR codes

### Tasks

#### 5.1 Menu Population Page

Create new page: `/app/menu-finalize/page.tsx`

**Layout:**
- Left: Menu data summary (items, costs, dates)
- Center: Template preview
- Right: Export options

#### 5.2 Data Population Logic

**Note:** This is the most complex part. Canva's editing capabilities via MCP are limited. We have two options:

**Option A: Manual Editing in Canva**
- [ ] Provide "Edit in Canva" button
- [ ] Open design in Canva web app
- [ ] User manually replaces text and images
- [ ] User returns to app and exports

**Option B: Programmatic Population (if editing tools available)**
- [ ] Use Canva editing transaction tools (need to explore)
- [ ] Programmatically replace placeholder text with:
  - Recipe names
  - Dates
  - Prices
  - Delivery information
- [ ] Programmatically replace placeholder images with recipe images
- [ ] Use Canva asset IDs stored in database

**Recommendation:** Start with Option A (simpler, guaranteed to work), then explore Option B if time permits.

#### 5.3 Export Functionality

- [ ] Create export options panel:
  - Format: PNG, PDF, JPG
  - Quality: Regular, Pro
  - Size: Social Media (1080x1080), Print (A4), Custom
- [ ] Call Canva MCP `export-design` tool
- [ ] Show export progress
- [ ] Download exported file
- [ ] Store export URL in database

#### 5.4 Shareable Links

- [ ] Generate unique share token (UUID)
- [ ] Create public URL: `https://yourapp.com/menu/[token]`
- [ ] Store share link in database
- [ ] Create public page to display shared menu
- [ ] Track view count

#### 5.5 QR Code Generation

- [ ] Use QR code library (e.g., `qrcode.react`)
- [ ] Generate QR code for share link
- [ ] Allow downloading QR code as PNG
- [ ] Optionally overlay QR code on menu design

#### 5.6 Social Media Export

- [ ] Create presets for social media sizes:
  - Instagram Post: 1080x1080
  - Instagram Story: 1080x1920
  - Facebook Post: 1200x630
- [ ] Export in appropriate format for each platform
- [ ] Provide "Share to WhatsApp" button

#### 5.7 Testing

- [ ] Test export in all formats
- [ ] Test shareable link generation
- [ ] Test QR code generation
- [ ] Test social media exports
- [ ] Test public menu view page

**Deliverables:**
- ✅ Menu population working (manual or automatic)
- ✅ Export functionality working for all formats
- ✅ Shareable links generated and working
- ✅ QR codes generated
- ✅ Social media exports working

---

## Phase 6: Integration & Polish (Week 6)

### Objectives
- Connect all pages with navigation
- Add navigation menu
- Polish UI/UX
- Fix bugs
- Optimize performance

### Tasks

#### 6.1 Navigation Menu

- [ ] Add "Weekly Menu" section to main navigation
- [ ] Create submenu items:
  - Recipe Images
  - Menu Builder
  - Templates
  - My Menus (list of all created menus)
- [ ] Add icons for each menu item
- [ ] Ensure consistent navigation across all pages

#### 6.2 Workflow Integration

- [ ] Create guided workflow:
  1. Upload recipe images (if not done)
  2. Build weekly menu
  3. Select/generate template
  4. Finalize and export
- [ ] Add "Next Step" buttons to guide users
- [ ] Show progress indicator (Step 1 of 4)
- [ ] Allow skipping steps if already completed

#### 6.3 UI/UX Polish

- [ ] Ensure consistent styling across all pages
- [ ] Match existing app design patterns (fixed nav buttons, inline forms)
- [ ] Add loading states for all async operations
- [ ] Add empty states (e.g., "No images uploaded yet")
- [ ] Add success/error notifications
- [ ] Improve mobile responsiveness

#### 6.4 Performance Optimization

- [ ] Implement image lazy loading
- [ ] Cache recipe list and template list
- [ ] Optimize database queries (use indexes)
- [ ] Compress uploaded images automatically
- [ ] Implement pagination for large lists

#### 6.5 Error Handling

- [ ] Add error boundaries for React components
- [ ] Handle Canva API errors gracefully
- [ ] Show user-friendly error messages
- [ ] Implement retry logic for failed API calls
- [ ] Log errors for debugging

#### 6.6 Testing

- [ ] End-to-end testing of complete workflow
- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Test with different browsers
- [ ] Test with slow network connection
- [ ] Test with large datasets (many recipes, many menus)

**Deliverables:**
- ✅ All pages connected with navigation
- ✅ Guided workflow implemented
- ✅ UI/UX polished and consistent
- ✅ Performance optimized
- ✅ Error handling robust

---

## Phase 7: Documentation & Launch (Week 7)

### Objectives
- Create user documentation
- Record video tutorials
- Conduct user testing
- Deploy to production
- Announce launch

### Tasks

#### 7.1 User Documentation

- [ ] Create user guide: `WEEKLY_MENU_USER_GUIDE.md`
- [ ] Include screenshots for each step
- [ ] Create FAQ section
- [ ] Document common issues and solutions
- [ ] Create quick start guide (1-page)

#### 7.2 Video Tutorials

- [ ] Record screen capture of complete workflow
- [ ] Create short tutorial videos (2-3 minutes each):
  - Uploading recipe images
  - Building a weekly menu
  - Generating templates with AI
  - Exporting and sharing menus
- [ ] Add voiceover or captions
- [ ] Upload to YouTube or embed in app

#### 7.3 User Testing

- [ ] Recruit 3-5 tiffin service owners for beta testing
- [ ] Provide test accounts and instructions
- [ ] Collect feedback via survey
- [ ] Fix critical issues identified
- [ ] Iterate based on feedback

#### 7.4 Deployment

- [ ] Test on staging environment
- [ ] Run database migrations on production
- [ ] Deploy backend API changes
- [ ] Deploy frontend changes
- [ ] Verify all features working in production
- [ ] Monitor error logs

#### 7.5 Launch Announcement

- [ ] Update app homepage with feature announcement
- [ ] Send email to existing users
- [ ] Post on social media
- [ ] Create demo video for marketing
- [ ] Update app description in stores (if applicable)

**Deliverables:**
- ✅ User documentation complete
- ✅ Video tutorials recorded
- ✅ User testing completed
- ✅ Feature deployed to production
- ✅ Launch announced

---

## Success Criteria

The feature will be considered successfully implemented when:

1. ✅ All database tables are created and functioning
2. ✅ All API endpoints are implemented and tested
3. ✅ Recipe Image Management page is fully functional
4. ✅ Weekly Menu Builder page is fully functional
5. ✅ AI template generation is working
6. ✅ Export functionality works for all formats
7. ✅ Shareable links and QR codes are generated
8. ✅ End-to-end workflow is smooth and intuitive
9. ✅ User documentation is complete
10. ✅ Feature is deployed to production

---

## Risk Mitigation

### Risk 1: Canva Pro Requirement
**Mitigation:** 
- Clearly communicate Pro requirement in UI
- Provide fallback: manual template import
- Consider partnering with Canva for business accounts

### Risk 2: Limited Editing Capabilities
**Mitigation:**
- Focus on auto-population rather than complex editing
- Provide "Edit in Canva" button for advanced editing
- Set user expectations appropriately

### Risk 3: API Rate Limits
**Mitigation:**
- Implement request queuing
- Cache frequently accessed data
- Monitor API usage and set alerts

### Risk 4: Image Storage Costs
**Mitigation:**
- Implement automatic image compression
- Set file size limits
- Consider using cloud storage with CDN

---

## Next Steps

1. **Immediate:** Begin Phase 1 (Database & API Foundation)
2. **Week 1:** Complete database setup and API endpoints
3. **Week 2:** Build Recipe Image Management page
4. **Week 3:** Build Weekly Menu Builder page
5. **Week 4:** Implement AI template generation
6. **Week 5:** Implement export and sharing
7. **Week 6:** Integration and polish
8. **Week 7:** Documentation and launch

---

## Resources

### Documentation
- [Canva Integration Analysis](./CANVA_INTEGRATION_ANALYSIS.md)
- [Feature Specification](./FEATURE_SPEC_WEEKLY_MENU.md)
- [Proof of Concept Summary](./PROOF_OF_CONCEPT_SUMMARY.md)
- [Database Schema](./database/weekly_menu_schema.sql)

### Sample Files
- [Sample Menu Template](./canva_samples/menu_template_full.png)

### External Resources
- [Canva API Documentation](https://www.canva.dev/)
- [React Image Crop](https://www.npmjs.com/package/react-image-crop)
- [QR Code React](https://www.npmjs.com/package/qrcode.react)

---

*This roadmap provides a clear, actionable plan for implementing the Weekly Menu Creation feature. Follow each phase sequentially, and adjust timelines as needed based on progress and feedback.*
