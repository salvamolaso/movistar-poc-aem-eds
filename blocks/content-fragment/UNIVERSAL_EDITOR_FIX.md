# Universal Editor - Content Fragment Fix

## 🚨 Problem

Universal Editor shows:
1. ❌ Button with CF path instead of content
2. ❌ Error: `Failed to fetch dynamically imported module`
3. ❌ Trying to load from: `https://author-p171966-e1846391.adobeaemcloud.com/content/Telephonica.promo-block.resource/blocks/content-fragment/content-fragment.js`

**Root Cause:** Universal Editor is trying to load blocks from AEM instead of from Edge Delivery Services.

---

## ✅ Solution: Configure Universal Editor Connection

You need to tell Universal Editor where your EDS site is hosted.

---

### **Fix 1: Add Connection Metadata** (Required)

Universal Editor needs to know your EDS site URL.

#### Option A: Add to head.html (Recommended)

Open: `head.html`

Add this meta tag **at the very top** (before other meta tags):

```html
<meta name="urn:adobe:aue:system:aemconnection" content="aem:https://author-p171966-e1846391.adobeaemcloud.com">
```

**Full head.html should look like:**
```html
<meta name="urn:adobe:aue:system:aemconnection" content="aem:https://author-p171966-e1846391.adobeaemcloud.com">
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="hostname" content="https://author-p171966-e1846391.adobeaemcloud.com">
<meta name="authorurl" content="https://author-p171966-e1846391.adobeaemcloud.com">
<meta name="publishurl" content="https://publish-p171966-e1846391.adobeaemcloud.com">
<script src="/scripts/aem.js" type="module"></script>
<script src="/scripts/scripts.js" type="module"></script>
<link rel="stylesheet" href="/styles/styles.css"/>
```

---

### **Fix 2: Ensure Your EDS Site is Accessible**

Universal Editor needs to **fetch your JavaScript files** from your live EDS site.

#### Check Your EDS Site URL

Based on your fstab.yaml, your site should be at:
```
https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
```

Or:
```
https://main--movistar-poc-aem-eds--salvamolaso.hlx.live
```

#### Test Accessibility

Open this URL in browser:
```
https://main--movistar-poc-aem-eds--salvamolaso.hlx.page/blocks/content-fragment/content-fragment.js
```

**Expected:** You should see your JavaScript file

**If 404:** Your site isn't deployed or path is wrong

---

### **Fix 3: Update Connection Metadata with EDS URL**

Universal Editor needs **both** the AEM connection AND your EDS site URL.

#### Add to head.html:

```html
<meta name="urn:adobe:aue:system:aemconnection" content="aem:https://author-p171966-e1846391.adobeaemcloud.com">
<meta name="urn:adobe:aue:config" content="https://main--movistar-poc-aem-eds--salvamolaso.hlx.page">
```

**Replace** `salvamolaso/movistar-poc-aem-eds` with your actual GitHub org/repo names!

---

### **Fix 4: Check Content Fragment Image Path**

The error also mentions:
```
RequestURI=/content/dam/telephonica/imagetest.html
```

This suggests your **bannerimage** in the Content Fragment might be pointing to the wrong thing.

#### In AEM:

1. Open your Content Fragment
2. Check **bannerimage** field
3. Ensure it's pointing to an **image file**, not an HTML file
4. Should be something like: `/content/dam/telephonica/images/hero.jpg`
5. NOT: `/content/dam/telephonica/imagetest.html`

#### Fix:

1. Remove the current image reference
2. Click **Browse**
3. Select an actual **image file** (JPG, PNG, WebP)
4. Save and Publish

---

### **Fix 5: Universal Editor Configuration in AEM**

Universal Editor needs proper configuration in AEM.

#### Check AEM OSGi Configuration

1. Navigate to: `https://author-p171966-e1846391.adobeaemcloud.com/system/console/configMgr`
2. Search for: **Universal Editor**
3. Look for: **Universal Editor CORS Configuration**
4. Add your EDS domains:
   ```
   https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
   https://main--movistar-poc-aem-eds--salvamolaso.hlx.live
   ```

---

### **Fix 6: Verify Your EDS Site Repo and Org**

Based on your fstab.yaml:
```yaml
url: "https://author-p171966-e1846391.adobeaemcloud.com/bin/franklin.delivery/salvamolaso/movistar-poc-aem-eds/main"
```

Your EDS site should be:
- **GitHub Org:** `salvamolaso`
- **GitHub Repo:** `movistar-poc-aem-eds`
- **Branch:** `main`

**EDS URLs:**
- Preview: `https://main--movistar-poc-aem-eds--salvamolaso.hlx.page`
- Live: `https://main--movistar-poc-aem-eds--salvamolaso.hlx.live`

**Verify these URLs are accessible!**

---

## 📋 Complete Fix Checklist

Apply all of these:

```
☐ Fix 1: Add AEM connection metadata to head.html
   <meta name="urn:adobe:aue:system:aemconnection" content="aem:https://author-p171966-e1846391.adobeaemcloud.com">

☐ Fix 2: Add EDS config metadata to head.html
   <meta name="urn:adobe:aue:config" content="https://main--movistar-poc-aem-eds--salvamolaso.hlx.page">

☐ Fix 3: Verify EDS site is accessible
   Open: https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
   Should see: Your site content

☐ Fix 4: Verify JavaScript file is accessible
   Open: https://main--movistar-poc-aem-eds--salvamolaso.hlx.page/blocks/content-fragment/content-fragment.js
   Should see: Your JS code

☐ Fix 5: Fix Content Fragment image reference
   - Open CF in AEM
   - Check bannerimage field
   - Should point to .jpg/.png, NOT .html
   - Re-select correct image
   - Save & Publish

☐ Fix 6: Commit and push changes to GitHub
   git add head.html
   git commit -m "Add Universal Editor connection metadata"
   git push

☐ Fix 7: Wait for deployment (~1 minute)
   Check: https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
   Should have updated head.html

☐ Fix 8: Clear browser cache
   Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

☐ Fix 9: Test in Universal Editor again
   Open your page in Universal Editor
   Content Fragment should load properly now
```

---

## 🔍 Why This Happens

**Universal Editor Flow:**

```
User opens page in Universal Editor
    ↓
Universal Editor reads <meta name="urn:adobe:aue:config">
    ↓
Loads blocks from EDS site (not AEM!)
    ↓
Fetches: https://YOUR-EDS-SITE.hlx.page/blocks/content-fragment/content-fragment.js
    ↓
Decorates block with your JavaScript
    ↓
Block fetches content from AEM via GraphQL
    ↓
Renders content
```

**Without the metadata:**
```
Universal Editor doesn't know where EDS site is
    ↓
Tries to load from AEM (wrong!)
    ↓
Error: Module not found
    ↓
Shows button with CF path (fallback)
```

---

## 🧪 Testing Steps

After applying all fixes:

### Step 1: Test EDS Site Directly

```
1. Open: https://main--movistar-poc-aem-eds--salvamolaso.hlx.page/your-page
2. Content Fragment should render properly
3. Check browser console - no errors
```

### Step 2: Test in Universal Editor

```
1. Open your page in AEM with Universal Editor
2. Content Fragment should load (not just a button)
3. Click on CF elements - should be editable
4. Edit title/subtitle - should update
```

### Step 3: Verify No Errors

```
1. Open DevTools (F12)
2. Console tab - no "Failed to fetch" errors
3. Network tab - blocks load from hlx.page, not from AEM
```

---

## 🚨 Still Not Working?

### Check These:

#### 1. Is Your EDS Site Deployed?

```bash
# Push latest changes
git add .
git commit -m "Universal Editor fixes"
git push origin main

# Wait 1-2 minutes for deployment
```

#### 2. Correct GitHub Repo?

Verify in fstab.yaml:
```yaml
url: "https://author-p171966-e1846391.adobeaemcloud.com/bin/franklin.delivery/YOUR-ORG/YOUR-REPO/main"
```

Match with:
```html
<meta name="urn:adobe:aue:config" content="https://main--YOUR-REPO--YOUR-ORG.hlx.page">
```

#### 3. CF Image Field?

In AEM Content Fragment:
- bannerimage should be **Content Reference** type
- Should point to an IMAGE in DAM
- NOT a content fragment
- NOT an HTML file
- Should be published

#### 4. Browser Cache?

```
1. Clear ALL browser cache
2. Close browser completely
3. Reopen
4. Hard refresh: Cmd+Shift+R
```

#### 5. Check AEM Logs?

In AEM:
```
Tools → Operations → Diagnosis → Log Messages
Filter for: "BinaryProvider" or "content-fragment"
```

---

## 📝 Quick Fix Summary

**Minimum changes needed:**

1. **Add to head.html:**
```html
<meta name="urn:adobe:aue:system:aemconnection" content="aem:https://author-p171966-e1846391.adobeaemcloud.com">
<meta name="urn:adobe:aue:config" content="https://main--movistar-poc-aem-eds--salvamolaso.hlx.page">
```

2. **Fix CF image:**
- Point to .jpg/.png file, not .html

3. **Deploy:**
```bash
git push
# Wait 1 minute
```

4. **Test:**
- Refresh Universal Editor

---

**That should fix it!** 🎉

