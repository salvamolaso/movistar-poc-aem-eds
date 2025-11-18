# Content Fragment - Complete Author-Only Setup Guide

## 🎯 Goal

Make the content-fragment block work in **AEM Author environment** for preview and testing.

**No Adobe I/O Runtime needed!** This is the simplest setup.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Access to AEM as a Cloud Service **Author** instance
- ✅ Permissions to:
  - Create Content Fragment Models
  - Create Content Fragments
  - Configure GraphQL
  - Upload images to DAM
  - Publish content
- ✅ Your code files already in place:
  - `blocks/content-fragment/content-fragment.js` ✅
  - `blocks/content-fragment/content-fragment.css` ✅
  - `blocks/content-fragment/_content-fragment.json` ✅

---

## 🚀 Step-by-Step Setup

### **PART 1: AEM Configuration**

---

### **Step 1: Create Content Fragment Model** (15 min)

#### 1.1 Navigate to Models

In AEM Author:
```
Tools → Assets → Content Fragment Models
```

#### 1.2 Create Configuration Folder (If Needed)

If you don't have a configuration folder:
1. Click **Create**
2. Name it: `your-project-name` (e.g., `movistar-demo`)
3. Click **Create** → **Open**

#### 1.3 Create New Model

1. Click **Create**
2. Enter Model Title: `CTA Banner` (or any name)
3. Click **Create** → **Open** to edit

#### 1.4 Add Fields to Model

Drag and drop these fields from the right panel:

| Order | Field Type | Field Name | Label | Required | Notes |
|-------|------------|------------|-------|----------|-------|
| 1 | **Single line text** | `title` | Title | ✅ Yes | Main heading |
| 2 | **Single line text** | `subtitle` | Subtitle | ⬜ No | Secondary text |
| 3 | **Multi line text** | `description` | Description | ⬜ No | Body content |
| 4 | **Single line text** | `ctalabel` | CTA Label | ✅ Yes | Button text |
| 5 | **Single line text** | `ctaUrl` | CTA URL | ✅ Yes | Button link |
| 6 | **Content Reference** | `bannerimage` | Banner Image | ✅ Yes | Background image |

**For each field:**
- Click on the field in the canvas
- Configure properties in the right panel
- Set "Property Name" exactly as shown in table (lowercase, no spaces!)
- Check "Required" if marked
- Click **Save** at the top when done

#### 1.5 Save and Close Model

1. Click **Save** (top right)
2. Note the model path (you'll need this later)
   - Example: `/conf/movistar-demo/settings/dam/cfm/models/cta-banner`

---

### **Step 2: Enable GraphQL Endpoint** (5 min)

#### 2.1 Navigate to GraphQL

```
Tools → General → GraphQL
```

#### 2.2 Check for Existing Endpoint

Look for an endpoint with your configuration name (e.g., `movistar-demo`)

#### 2.3 Create Endpoint (If Doesn't Exist)

1. Click **Create**
2. Name: `movistar-demo` (match your config folder)
3. Select: **Enable this endpoint**
4. Click **Create**

#### 2.4 Verify Endpoint

The endpoint URL should be:
```
https://author-pXXXXX-eXXXXX.adobeaemcloud.com/content/cq:graphql/movistar-demo/endpoint.json
```

---

### **Step 3: Create Persisted GraphQL Query** (10 min)

#### 3.1 Open GraphQL Query Editor

```
Tools → General → GraphQL Query Editor
```

Or navigate directly:
```
https://author-pXXXXX-eXXXXX.adobeaemcloud.com/aem/graphiql.html
```

#### 3.2 Select Your Configuration

In the dropdown (top right), select: **`movistar-demo`** (your config name)

#### 3.3 Write the Query

Copy and paste this query into the left panel:

```graphql
query CTAByPath($cfPath: String!, $variation: String) {
  ctaByPath(
    _path: $cfPath
    variation: $variation
  ) {
    item {
      _path
      title
      subtitle
      description {
        plaintext
      }
      ctalabel
      ctaUrl
      bannerimage {
        ... on ImageRef {
          _authorUrl
          _publishUrl
          _path
          mimeType
          width
          height
        }
      }
    }
  }
}
```

#### 3.4 Test the Query

In the **Query Variables** panel (bottom), add:
```json
{
  "cfPath": "/content/dam/movistar-demo/fragments/test-hero",
  "variation": "master"
}
```

**Note:** This will fail for now (CF doesn't exist yet) - that's OK!

#### 3.5 Save as Persisted Query

1. Click **Save As** (not just Save)
2. Enter name: `CTAByPath`
3. Click **Save**

#### 3.6 Note the Persisted Query Path

After saving, you'll see the path. It should be:
```
/graphql/execute.json/movistar-demo/CTAByPath
```

**IMPORTANT:** Write this down! You'll need it in Step 6.

---

### **Step 4: Create Content Fragment** (10 min)

#### 4.1 Navigate to Assets

```
Assets → Files
```

#### 4.2 Create Folder Structure

Navigate to or create:
```
/content/dam/movistar-demo/fragments
```

1. Click **Create** → **Folder**
2. Name: `fragments`
3. Click **Create**
4. Open the folder

#### 4.3 Upload an Image First

1. Navigate to `/content/dam/movistar-demo/images` (create if needed)
2. Click **Create** → **Files**
3. Upload a hero image (recommended: 1920x600px or larger)
4. Wait for processing to complete

#### 4.4 Create Content Fragment

Back in `/content/dam/movistar-demo/fragments`:

1. Click **Create** → **Content Fragment**
2. Select your model: **CTA Banner**
3. Click **Next**
4. Enter Properties:
   - **Title**: `Hero Banner`
   - **Name**: `hero-banner` (URL-friendly)
   - **Description**: Optional
5. Click **Create**
6. Click **Open** to edit

#### 4.5 Fill in Content Fragment Fields

Enter content for all required fields:

| Field | Example Value |
|-------|---------------|
| **title** | "Welcome to Movistar" |
| **subtitle** | "Discover our amazing offers" |
| **description** | "Get the best deals on mobile plans, internet, and TV packages. Limited time offer!" |
| **ctalabel** | "Explore Plans" |
| **ctaUrl** | "/plans" or "https://www.movistar.es/plans" |
| **bannerimage** | Click browse, select the image you uploaded |

#### 4.6 Save Content Fragment

1. Click **Save** (top right)
2. Note the full path shown in the properties:
   ```
   /content/dam/movistar-demo/fragments/hero-banner
   ```
   **Write this down!**

#### 4.7 Publish Content Fragment

1. Click **Quick Publish** (or **Publish** in the toolbar)
2. Confirm publication
3. Wait for "Published successfully" message

---

### **Step 5: Verify GraphQL Query Works** (5 min)

#### 5.1 Go Back to GraphQL Query Editor

```
Tools → General → GraphQL Query Editor
```

#### 5.2 Test with Your Real CF

Use the persisted query endpoint:
```
https://author-pXXXXX-eXXXXX.adobeaemcloud.com/graphql/execute.json/movistar-demo/CTAByPath;path=/content/dam/movistar-demo/fragments/hero-banner;variation=master
```

Or test in Query Editor with variables:
```json
{
  "cfPath": "/content/dam/movistar-demo/fragments/hero-banner",
  "variation": "master"
}
```

#### 5.3 Expected Response

You should see JSON like:
```json
{
  "data": {
    "ctaByPath": {
      "item": {
        "_path": "/content/dam/movistar-demo/fragments/hero-banner",
        "title": "Welcome to Movistar",
        "subtitle": "Discover our amazing offers",
        "description": {
          "plaintext": "Get the best deals..."
        },
        "ctalabel": "Explore Plans",
        "ctaUrl": "/plans",
        "bannerimage": {
          "_authorUrl": "https://author-pXXXXX.../image.jpg",
          "_publishUrl": "https://publish-pXXXXX.../image.jpg",
          "_path": "/content/dam/.../image.jpg",
          "mimeType": "image/jpeg",
          "width": 1920,
          "height": 600
        }
      }
    }
  }
}
```

**If you see this, your AEM setup is complete!** ✅

**If you get errors:**
- 404: Check the CF path is correct
- No data: Ensure CF is saved and published
- Field errors: Check field names match exactly

---

### **PART 2: Code Configuration**

---

### **Step 6: Update GraphQL Query Path** (2 min)

#### 6.1 Open content-fragment.js

File: `blocks/content-fragment/content-fragment.js`

#### 6.2 Find Line 14

Look for:
```javascript
GRAPHQL_QUERY: '/graphql/execute.json/ref-demo-eds/CTAByPath',
```

#### 6.3 Update with Your Path

Change to YOUR persisted query path from Step 3.6:
```javascript
GRAPHQL_QUERY: '/graphql/execute.json/movistar-demo/CTAByPath',
```

Replace `movistar-demo` with your actual configuration name.

#### 6.4 Save File

---

### **Step 7: Add AEM Metadata** (5 min)

You need to tell your EDS site where your AEM Author instance is.

#### **Option A: Using head.html** (Recommended for testing)

Create or edit: `head.html`

Add these meta tags:
```html
<meta name="hostname" content="https://author-p12345-e67890.adobeaemcloud.com">
<meta name="authorurl" content="https://author-p12345-e67890.adobeaemcloud.com">
<meta name="publishurl" content="https://publish-p12345-e67890.adobeaemcloud.com">
```

**Replace with YOUR AEM URLs!**

To find your AEM URL:
1. Look at the URL when logged into AEM
2. Or check Adobe Cloud Manager → Environments
3. Copy the full URL including `https://`

#### **Option B: Using metadata.xlsx**

If you use a metadata spreadsheet:

Add these rows:

| metadata | property | content |
|----------|----------|---------|
| hostname | | https://author-p12345-e67890.adobeaemcloud.com |
| authorurl | | https://author-p12345-e67890.adobeaemcloud.com |
| publishurl | | https://publish-p12345-e67890.adobeaemcloud.com |

Save and commit.

#### **Option C: Using placeholders**

Create/edit: `placeholders.json`

```json
{
  "data": [
    {
      "key": "hostname",
      "value": "https://author-p12345-e67890.adobeaemcloud.com"
    },
    {
      "key": "authorurl",
      "value": "https://author-p12345-e67890.adobeaemcloud.com"
    },
    {
      "key": "publishurl",
      "value": "https://publish-p12345-e67890.adobeaemcloud.com"
    }
  ]
}
```

---

### **Step 8: Configure CORS (If Needed)** (5 min)

If you're testing locally (localhost:3000), you need CORS configured.

#### 8.1 Open AEM OSGi Configuration

Navigate to:
```
http://localhost:4502/system/console/configMgr
```

Or in Cloud Manager, configure via OSGi config files.

#### 8.2 Find CORS Configuration

Search for: **Adobe Granite Cross-Origin Resource Sharing Policy**

#### 8.3 Create New Configuration

Click **+** to add new config:

| Property | Value |
|----------|-------|
| **Allowed Origins** | `http://localhost:3000` (or your EDS preview URL) |
| **Allowed Origins (Regexp)** | `https://.*\.hlx\.(page\|live)` |
| **Allowed Paths** | `/content/.*` |
| **Allowed Paths** | `/graphql/.*` |
| **Supported Methods** | `GET`, `POST`, `OPTIONS` |
| **Supported Headers** | `*` |
| **Exposed Headers** | Leave empty or `*` |
| **Max Age** | `1800` |
| **Supports Credentials** | ✅ Check |

#### 8.4 Save Configuration

Click **Save**

**Note:** For Cloud Service, you'll need to add this as an OSGi configuration file in your project.

---

### **PART 3: Usage & Testing**

---

### **Step 9: Create a Test Page** (5 min)

#### 9.1 In Your EDS Document

Create a new document or edit existing page.

#### 9.2 Add Content Fragment Block

Create a table with this structure:

```
| Content Fragment |
| /content/dam/movistar-demo/fragments/hero-banner |
| master |
| image-left |
| text-center |
| button |
```

**Explanation of each row:**

| Row | Column 1 | Column 2 | Purpose |
|-----|----------|----------|---------|
| 1 | Content Fragment | *(empty)* | Block name |
| 2 | *(empty)* | `/content/dam/movistar-demo/fragments/hero-banner` | Path to your CF |
| 3 | *(empty)* | `master` | Variation name |
| 4 | *(empty)* | `image-left` | Display style |
| 5 | *(empty)* | `text-center` | Text alignment |
| 6 | *(empty)* | `button` | CTA style |

**Note:** Use the EXACT path from Step 4.6!

#### 9.3 Save Document

---

### **Step 10: Preview Your Page** (2 min)

#### 10.1 Open Preview

In your EDS sidekick or go to:
```
https://main--your-repo--owner.hlx.page/your-page
```

#### 10.2 What You Should See

✅ A hero banner with:
- Background image
- Title: "Welcome to Movistar"
- Subtitle: "Discover our amazing offers"
- Description: "Get the best deals..."
- Button: "Explore Plans" linking to /plans

#### 10.3 Check Browser Console

Press `F12` → **Console** tab

You should see:
```
API Response: {data: {ctaByPath: {item: {...}}}}
```

**No errors!**

---

### **Step 11: Test Different Layouts** (Optional - 5 min)

Try different display styles in row 4:

#### Default (Empty Row 4)
```
| Content Fragment |
| /content/dam/movistar-demo/fragments/hero-banner |
| master |
|  |
| text-center |
| button |
```
**Result:** Image as background with gradient overlay

#### Image Left
```
| image-left |
```
**Result:** Image on left, text on right (side-by-side)

#### Image Right
```
| image-right |
```
**Result:** Image on right, text on left

#### Image Top
```
| image-top |
```
**Result:** Image above, text below

#### Image Bottom
```
| image-bottom |
```
**Result:** Text above, image below

---

## 🎉 Success Checklist

You've successfully set up the content-fragment block if:

- ✅ No errors in browser console
- ✅ Content from CF appears on page
- ✅ Title, subtitle, description all show correctly
- ✅ Image displays properly
- ✅ CTA button has correct label
- ✅ CTA button links to correct URL
- ✅ Layout matches selected style
- ✅ Network tab shows successful GraphQL request

---

## 🚨 Troubleshooting

### **Problem 1: Block is Empty / Nothing Shows**

**Check Console for Errors:**

#### Error: "Failed to fetch"
**Cause:** Network issue or CORS

**Solutions:**
1. Check AEM Author URL in metadata is correct
2. Verify you can access AEM (logged in)
3. Configure CORS (Step 8)
4. Check browser Network tab for failed requests

#### Error: "404 Not Found"
**Cause:** Wrong GraphQL path or CF path

**Solutions:**
1. Verify GraphQL query path in code (Step 6)
   - Must match: `/graphql/execute.json/YOUR-CONFIG/CTAByPath`
2. Verify CF path in document is exact
   - Must match: `/content/dam/YOUR-CONFIG/fragments/hero-banner`
3. Check for typos (paths are case-sensitive!)

#### Error: "No valid data found"
**Cause:** GraphQL response structure doesn't match

**Solutions:**
1. Test GraphQL query directly in browser:
   ```
   https://author-pXXXXX.adobeaemcloud.com/graphql/execute.json/movistar-demo/CTAByPath;path=/content/dam/movistar-demo/fragments/hero-banner;variation=master
   ```
2. Check if CF fields match model exactly
3. Verify CF is saved and published
4. Check console log: `console.log('API Response:', cardData)`

---

### **Problem 2: Image Doesn't Display**

**Check:**
1. Image is uploaded to DAM ✅
2. Image is published ✅
3. Image is referenced in CF ✅
4. Check Network tab for image URL - is it 404?

**Solutions:**
- Re-publish the image in DAM
- Try a different image
- Check image path in GraphQL response
- Verify `_authorUrl` is present in response

---

### **Problem 3: CORS Error**

**Error in Console:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions:**
1. Configure CORS in AEM (Step 8)
2. Add your EDS domain to allowed origins
3. Add `/graphql/.*` to allowed paths
4. Restart AEM (if local) or redeploy config (if Cloud)

---

### **Problem 4: Content Fragment Path Not Found**

**Solutions:**
1. Check CF path is EXACT match (case-sensitive)
2. Remove trailing slashes
3. CF must be published (not just saved)
4. Try opening CF in AEM - can you access it?

---

### **Problem 5: Field Values Not Showing**

**Cause:** Field name mismatch

**Solutions:**
1. Check CF Model field names:
   - Must be: `title`, `subtitle`, `description`, `ctalabel`, `ctaUrl`, `bannerimage`
   - All lowercase, exact match!
2. Re-create CF Model if needed
3. Migrate content to new CF using correct model

---

### **Problem 6: Authentication Error**

**Error:** "Unauthorized" or "403 Forbidden"

**Solutions:**
1. Ensure you're logged into AEM Author
2. Check your AEM user has permissions:
   - Read access to `/content/dam`
   - Execute GraphQL queries
3. Try accessing GraphQL endpoint directly in browser
4. Clear browser cookies/cache and re-login

---

## 🔍 Debugging Tips

### **Enable Detailed Logging**

Add this to `content-fragment.js` (after line 64):

```javascript
console.log('=== DEBUG INFO ===');
console.log('Environment:', isAuthor ? 'Author' : 'Publish');
console.log('Request URL:', requestConfig.url);
console.log('Request Config:', requestConfig);
console.log('Content Path:', contentPath);
console.log('Variation:', variationname);
```

### **Test GraphQL Query Directly**

In browser, navigate to:
```
https://author-pXXXXX.adobeaemcloud.com/graphql/execute.json/YOUR-CONFIG/CTAByPath;path=/content/dam/YOUR-CONFIG/fragments/hero-banner;variation=master
```

Replace placeholders with your values.

**Expected:** JSON response with your CF data

### **Check Network Tab**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Look for GraphQL request
5. Click on it → **Preview** to see response
6. Check **Headers** for errors

### **Validate CF Model**

1. Open CF in AEM
2. Go to **Properties**
3. Check **Template** - should match your model
4. If wrong, you'll need to migrate or recreate

---

## 📊 Quick Reference

### **Your Configuration Values**

Fill this out as you set up:

| Item | Your Value |
|------|------------|
| **AEM Author URL** | `https://author-p_____-e_____.adobeaemcloud.com` |
| **Configuration Name** | `movistar-demo` (or yours) |
| **CF Model Path** | `/conf/____/settings/dam/cfm/models/____` |
| **GraphQL Query Path** | `/graphql/execute.json/____/CTAByPath` |
| **CF Path** | `/content/dam/____/fragments/____` |
| **Image Path** | `/content/dam/____/images/____` |

### **Code Updates Required**

| File | Line | Change |
|------|------|--------|
| `content-fragment.js` | 14 | Update `GRAPHQL_QUERY` path |
| `head.html` (or metadata) | N/A | Add `hostname`, `authorurl`, `publishurl` |

### **Display Style Options**

| Value | Description |
|-------|-------------|
| *(empty)* | Default - image as background with gradient |
| `image-left` | Side-by-side: image left, text right |
| `image-right` | Side-by-side: image right, text left |
| `image-top` | Stacked: image top, text bottom |
| `image-bottom` | Stacked: text top, image bottom |

### **Text Alignment Options**

| Value | Description |
|-------|-------------|
| `text-left` | Left-aligned text |
| `text-center` | Center-aligned text |
| `text-right` | Right-aligned text |

---

## 🎓 Next Steps

Once this works in Author:

1. ✅ Create more Content Fragments with different content
2. ✅ Create variations (e.g., holiday_promo, summer_sale)
3. ✅ Test different layout styles
4. ✅ Customize CSS for your brand
5. ✅ Set up Adobe I/O Runtime for Publish environment (see SETUP_GUIDE.md)

---

## 📚 Related Documentation

- **HOW_IT_WORKS.md** - Detailed explanation of the code
- **SETUP_GUIDE.md** - Full setup including Publish
- **QUICK_SETUP_CHECKLIST.md** - Checkbox format
- **VISUAL_SETUP_FLOW.md** - Diagrams and flowcharts

---

## ✅ Final Verification

Before considering setup complete, verify:

- [ ] Content Fragment Model created with all 6 fields
- [ ] GraphQL endpoint enabled
- [ ] Persisted query `CTAByPath` created and tested
- [ ] Content Fragment created, filled, and published
- [ ] Image uploaded to DAM and published
- [ ] Code updated with correct GraphQL path
- [ ] Metadata configured with AEM Author URL
- [ ] CORS configured (if needed)
- [ ] Test page created with CF block
- [ ] Page preview shows content correctly
- [ ] Browser console shows no errors
- [ ] Image displays properly
- [ ] CTA button works

---

**Setup Complete!** 🎉

**Estimated Time:** 45-60 minutes for first-time setup

**Last Updated:** November 18, 2025

