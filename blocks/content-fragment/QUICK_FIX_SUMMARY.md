# Universal Editor - Quick Fix Summary

## ✅ What I Just Fixed

Updated `head.html` with Universal Editor connection metadata:

```html
<meta name="urn:adobe:aue:system:aemconnection" content="aem:https://author-p171966-e1846391.adobeaemcloud.com">
<meta name="urn:adobe:aue:config" content="https://main--movistar-poc-aem-eds--salvamolaso.hlx.page">
```

---

## 🚀 Next Steps (Do These Now!)

### **Step 1: Fix Content Fragment Image** (5 min)

The error shows it's trying to load `/content/dam/telephonica/imagetest.html` - that's wrong!

**In AEM:**
1. Open your Content Fragment: `/content/dam/telephonica/...`
2. Find the **bannerimage** field
3. **Remove** any reference to `imagetest.html`
4. Click **Browse** 
5. Select an **actual image file** (.jpg, .png, .webp)
   - Path should be like: `/content/dam/telephonica/images/hero.jpg`
   - NOT: `/content/dam/telephonica/imagetest.html`
6. **Save** the Content Fragment
7. **Quick Publish**

---

### **Step 2: Deploy Your Changes** (2 min)

The `head.html` changes need to be deployed:

```bash
cd /Users/yashb/Documents/Demos/Telephonica_Demo/eds_code/movistar-poc-aem-eds

git add head.html
git commit -m "Add Universal Editor connection metadata"
git push origin main
```

**Wait 1-2 minutes for deployment to complete.**

---

### **Step 3: Verify EDS Site is Live** (1 min)

Open these URLs in your browser to confirm they work:

**Your EDS site:**
```
https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
```

**Your JavaScript file:**
```
https://main--movistar-poc-aem-eds--salvamolaso.hlx.page/blocks/content-fragment/content-fragment.js
```

✅ Both should load without 404

---

### **Step 4: Clear Cache & Test** (2 min)

1. **Close all browser tabs** with AEM/Universal Editor
2. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Or hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
3. **Reopen Universal Editor**
4. **Load your page** with the Content Fragment

---

## ✅ Expected Result

After completing all steps:

**Before (Current):**
- ❌ Button with CF path
- ❌ Error: "Failed to fetch dynamically imported module"
- ❌ Error: "imagetest.html"

**After (Fixed):**
- ✅ Content Fragment renders properly
- ✅ Shows title, subtitle, description, image, CTA
- ✅ Elements are editable in Universal Editor
- ✅ No errors in console

---

## 🚨 If Still Not Working

### Check Image in AEM

1. Navigate to: `/content/dam/telephonica/images/` (or wherever your images are)
2. Upload a test image if needed
3. Publish the image
4. In Content Fragment, reference this published image

### Verify GitHub Repo Names

In your fstab.yaml:
```yaml
url: "...franklin.delivery/salvamolaso/movistar-poc-aem-eds/main"
```

Matches your EDS URL:
```
https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
```

**If different, update head.html line 2 with correct org/repo names.**

---

## 📊 What These Meta Tags Do

### `urn:adobe:aue:system:aemconnection`
Tells Universal Editor where your AEM instance is:
```
aem:https://author-p171966-e1846391.adobeaemcloud.com
```

### `urn:adobe:aue:config`
Tells Universal Editor where to load your EDS blocks from:
```
https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
```

**Without these:** Universal Editor tries to load blocks from AEM (wrong place!) → Error

**With these:** Universal Editor loads blocks from your EDS site → Success!

---

## 🔄 Complete Flow (After Fix)

```
1. You open page in Universal Editor
   ↓
2. Universal Editor reads meta tags from head.html
   ↓
3. Knows to load blocks from:
   https://main--movistar-poc-aem-eds--salvamolaso.hlx.page
   ↓
4. Fetches: /blocks/content-fragment/content-fragment.js
   ↓
5. Runs your JavaScript
   ↓
6. JavaScript fetches CF data from AEM via GraphQL
   ↓
7. Renders content with title, subtitle, image, CTA
   ↓
8. Universal Editor makes elements editable
   ↓
9. ✅ Success!
```

---

**Do Steps 1-4 above and it should work!** 🎉

