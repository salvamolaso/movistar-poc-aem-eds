# Customer Service Features Block - Universal Editor Guide

## Overview

The **Customer Service Features** block displays a main heading, three feature columns with icons and descriptions, and a call-to-action button. It's designed to showcase customer service benefits in a clean, centered layout.

## Block Configuration

### Block Structure

The block is now available in Universal Editor under the **Blocks** group as "Customer Service Features".

### Fields in Universal Editor

When you add the Customer Service Features block, you'll see the following fields in the properties panel:

#### Main Heading
- **Field:** Main Heading (richtext)
- **Purpose:** The main title for the features section
- **Example:** "La nueva experiencia de atención al cliente"

#### Feature 1
- **Feature 1 Icon** (image reference): Icon image for the first feature
- **Feature 1 Title** (text): Short title for the first feature
- **Feature 1 Description** (richtext): Description text for the first feature

#### Feature 2
- **Feature 2 Icon** (image reference): Icon image for the second feature
- **Feature 2 Title** (text): Short title for the second feature
- **Feature 2 Description** (richtext): Description text for the second feature

#### Feature 3
- **Feature 3 Icon** (image reference): Icon image for the third feature
- **Feature 3 Title** (text): Short title for the third feature
- **Feature 3 Description** (richtext): Description text for the third feature

#### Call-to-Action
- **CTA Link** (content reference): Link destination for the button
- **CTA Text** (text): Button text (defaults to "Ver detalle")

## How to Add This Block in Universal Editor

### Step 1: Open Your Page in Universal Editor

1. Navigate to your AEM instance and open Universal Editor
2. Open the page where you want to add the Customer Service Features block

### Step 2: Add a New Section (if needed)

1. Click the **"+"** button in the content tree or canvas
2. Select **"Section"** from the components panel
3. The new section will be added to your page

### Step 3: Add the Customer Service Features Block

1. Inside the section, click the **"+"** button to add a component
2. From the **"Blocks"** group, select **"Customer Service Features"**
3. The block will be added to your section

### Step 4: Configure the Block

1. Click on the Customer Service Features block to select it
2. The properties panel will open on the right side
3. Fill in the fields:

#### Main Heading
- Click on "Main Heading" field
- Enter your main title (e.g., "La nueva experiencia de atención al cliente")
- You can use rich text formatting if needed (bold, italic, etc.)

#### Feature 1
- **Icon:** Click "Feature 1 Icon" and browse to select an icon image from your DAM
  - Recommended: SVG icons at 64x64px or larger
  - The icon should be simple and clear
- **Title:** Enter the feature title (e.g., "Atención personalizada")
- **Description:** Enter the feature description
  - Keep it concise (2-3 lines recommended)

#### Feature 2
- Follow the same process as Feature 1
- Example: "Resolución rápida de reclamaciones"

#### Feature 3
- Follow the same process as Feature 1
- Example: "Cuenta tu consulta solo 1 vez"

#### Call-to-Action
- **Link:** Click "CTA Link" and select or enter the destination page/URL
- **Text:** Enter the button text (default is "Ver detalle")
  - Can be changed to any text like "Learn More", "Contact Us", etc.

### Step 5: Preview and Publish

1. Use the **Preview** button to see how the block looks on the published site
2. Make any necessary adjustments to content or styling
3. When satisfied, **Publish** the page

## Content Best Practices

### Icons
- **Format:** Use SVG for best quality and scalability
- **Size:** Upload at minimum 64x64px, preferably 128x128px or vector
- **Style:** Keep icons simple, clean, and consistent across all three features
- **Color:** Icons will display at their original colors; consider using Movistar blue (#019DF4) for brand consistency

### Titles
- **Length:** Keep titles short and impactful (3-6 words ideal)
- **Clarity:** Make it immediately clear what the benefit is
- **Consistency:** Use similar grammatical structure across all three titles

### Descriptions
- **Length:** 2-3 lines maximum for best visual balance
- **Focus:** Explain the benefit clearly and concisely
- **Voice:** Keep consistent tone and voice across all descriptions

### CTA Button
- **Action-Oriented:** Use verbs that encourage action ("Ver detalle", "Learn More", "Contact Us")
- **Relevance:** Ensure the link goes somewhere relevant to the features described
- **Clarity:** Make it obvious what happens when clicked

## Design Notes

### Visual Layout
- The block displays with a **centered layout**
- On mobile: Features stack vertically
- On tablet/desktop (768px+): Features display in a 3-column grid
- Icons are centered above each feature title
- The CTA button is centered below all features

### Spacing
- Block has generous padding (60px mobile, 80px desktop)
- Features have 40-50px gap between them
- All content is center-aligned for a balanced appearance

### Colors
- Icons: Display in their original colors (Movistar blue recommended)
- Text: Uses default text color from theme
- CTA Button: Movistar blue (#019DF4) background with white text
- Button hover state: Darker blue (#0176ba)

## Technical Files Created

For reference, the following files were created for this block:

1. **JavaScript:** `/blocks/customer-service-features/customer-service-features.js`
2. **CSS:** `/blocks/customer-service-features/customer-service-features.css`
3. **Block Definition:** `/blocks/customer-service-features/_customer-service-features.json`
4. **Model Definition:** `/models/_customer-service-features.json`
5. **Component Configuration:** Updated in `component-models.json`, `component-definition.json`, and `component-filters.json`
6. **Test Content:** `/drafts/customer-service-features-test.plain.html`

## Icons Created

Three placeholder SVG icons were created in `/icons/`:
- `person-chat.svg` - For personalized attention
- `clock.svg` - For fast resolution
- `checkmark.svg` - For one-time consultation

These can be replaced with your own icons by uploading new images to your DAM and selecting them in the Universal Editor.

## Testing the Block

A test page has been created at:
- **Local:** `http://localhost:3000/drafts/customer-service-features-test`

This shows the block with sample content and can be used as a reference when authoring.

## Support

If you need to modify the block's appearance or functionality, the CSS and JavaScript files can be edited by developers. Contact your development team for custom modifications.

