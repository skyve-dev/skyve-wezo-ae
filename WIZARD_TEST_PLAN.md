# Property Wizard System - Test Plan

## 🚀 Access the Application
Open your browser and navigate to: http://localhost:3002/wezo-homeowner/

## 📝 Test Scenarios

### 1. **Test Wizard Creation Flow** (New Property)

#### Steps:
1. **Navigate to Properties List**
   - Login to the application
   - Click on "Properties" in the navigation

2. **Start New Property Creation**
   - Click "Add Property" button
   - Verify wizard mode opens with Step 1: Property Details

3. **Test Sequential Navigation**
   - **Step 1: Details**
     - Fill in property name, description, type
     - Click "Next" → Should move to Step 2
     - Click "Previous" → Should return to Step 1
   
   - **Step 2: Location**
     - Enter address information
     - Verify "Previous" button works
     - Click "Next" to proceed
   
   - **Step 3: Layout**
     - Set bedroom/bathroom counts
     - Test Previous/Next navigation
   
   - **Step 4: Amenities**
     - Select available amenities
     - Continue testing navigation
   
   - **Step 5: Photos** (Optional)
     - Should show "Save Property First" message
     - Can skip this step
   
   - **Step 6: Services**
     - Configure services
   
   - **Step 7: Rules**
     - Set house rules
   
   - **Step 8: Pricing**
     - Set pricing information
     - Verify "Next" button changes to "Create Property"

4. **Complete Property Creation**
   - Click "Create Property" on final step
   - Should redirect to edit mode with new property ID

### 2. **Test Navigation Guards**

#### Steps:
1. **Start Creating Property**
   - Begin wizard and fill some data in Step 1
   - Try to navigate away (browser back, click logo, etc.)
   - **Expected**: Confirmation dialog appears

2. **Test Cancel Button**
   - Click "Cancel" (X) button in top-right
   - **Expected**: Confirmation dialog "Cancel Property Creation?"
   - Click "Yes, Cancel" → Should return to properties list
   - Click "Continue Editing" → Should stay in wizard

3. **Test Browser Navigation**
   - Make changes in wizard
   - Press browser back button
   - **Expected**: Should show confirmation dialog
   - Try refreshing page (F5)
   - **Expected**: Browser's native "Leave site?" dialog

### 3. **Test localStorage Persistence**

#### Steps:
1. **Create Draft and Exit**
   - Start new property creation
   - Fill in details for first 3 steps
   - Click "Back" button (top-left) - NOT Cancel
   - **Expected**: Data saved to localStorage

2. **Resume Draft**
   - Navigate back to "Add Property"
   - **Expected**: Wizard resumes from Step 3
   - **Expected**: All previous data is restored

3. **Test Save Draft Button**
   - Click save icon in bottom navigation
   - Make more changes
   - Navigate away and return
   - **Expected**: All changes preserved

### 4. **Test Editing Mode** (Existing Property)

#### Steps:
1. **Edit Existing Property**
   - From properties list, click "Edit" on any property
   - **Expected**: Opens in Tab mode (NOT wizard mode)
   - **Expected**: Can freely navigate between tabs

2. **Test Change Detection**
   - Make changes to any field
   - **Expected**: Floating save button appears with "UNSAVED CHANGES" animation
   - Try to navigate away
   - **Expected**: Confirmation dialog appears

3. **Test Tab Memory**
   - Navigate to "Pricing" tab
   - Click back to properties list
   - Return to edit same property
   - **Expected**: Opens on "Pricing" tab (last active)

### 5. **Test Error Handling**

#### Steps:
1. **Test Validation**
   - Try to proceed without filling required fields
   - **Expected**: Validation errors displayed

2. **Test Network Errors**
   - Create property with network disconnected
   - **Expected**: Error message displayed

## 🔍 Things to Verify

### Visual Elements:
- ✅ Progress bar updates correctly
- ✅ Step indicators show completion status
- ✅ Mobile responsive navigation works
- ✅ Animations are smooth

### Data Persistence:
- ✅ Form data saves between steps
- ✅ Draft persists across browser sessions
- ✅ Changes detected accurately
- ✅ Tab positions remembered

### User Experience:
- ✅ Clear visual feedback for all actions
- ✅ Confirmation dialogs consistent
- ✅ Loading states displayed properly
- ✅ Error messages helpful

## 🐛 Known Limitations

1. **Photos in Creation Mode**
   - Photos cannot be uploaded until property is created
   - This is by design - photos require property ID
   - Users see "Save Property First" message

2. **Browser Limitations**
   - beforeunload dialog uses browser's native text
   - Cannot customize browser's "Leave site?" message

## 📊 Success Criteria

- [ ] Can create new property through wizard
- [ ] Can edit existing property with tabs
- [ ] Navigation guards prevent data loss
- [ ] localStorage persistence works
- [ ] Mobile experience is smooth
- [ ] All confirmation dialogs work
- [ ] No console errors during testing

## 🎯 Quick Test Commands

Open browser console and run:
```javascript
// Check localStorage for wizard data
localStorage.getItem('property-wizard-draft')

// Check localStorage for edit state
localStorage.getItem('property-edit-state')

// Clear wizard data (simulate cancel)
localStorage.removeItem('property-wizard-draft')
```

## 📱 Mobile Testing

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device
4. Test wizard navigation on mobile viewport

---

**Testing Environment:**
- URL: http://localhost:3002/wezo-homeowner/
- Test Account: admin@wezo.ae / Admin@123456
- Browser: Chrome (recommended) or Firefox