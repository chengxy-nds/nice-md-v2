---
name: uikit-design-system
description: >-
  Design system and style guidelines based on the Figma UI Kit (Community).
  Provides official color palettes, typography hierarchies, elevation/shadows,
  button variants, form components, and layout tokens for modern, accessible web interfaces.
---

# UI Kit Design System Specification

This skill documents the design language, visual tokens, and component guidelines derived from the Figma UI Kit design system.

---

## 🎨 1. Color Palette

### 1.1 Brand & Primary Colors
* **Primary (Brand Focus)**: `#116ACC` (Cobalt Royal Blue)
* **Primary Hover**: `#0C4A8F`
* **Primary Active / Dark**: `#083363`
* **Primary Tint / Subtle BG**: `rgba(17, 106, 204, 0.08)` / `rgba(160, 195, 255, 0.15)`
* **Primary Light Surface**: `#CFE1F5` / `#EBF3FC`

### 1.2 Neutral & Slate Grayscale
* **Gray 1 (Text Main)**: `#1F2937` (Dark Mode: `#F9FAFB`)
* **Gray 2 (Text Secondary)**: `#374151` (Dark Mode: `#E5E7EB`)
* **Gray 3 (Text Muted)**: `#4B5563` (Dark Mode: `#9CA3AF`)
* **Gray 4 (Placeholder / Icons)**: `#6B7280`
* **Gray 5 (Border Muted)**: `#9CA3AF`
* **Gray 6 (Light Border / Divider)**: `#E5E7EB` / `#D1D5DB`
* **Gray 7 (Background Base / Surface)**: `#F8FAFC` / `#F3F4F6`
* **White (Pure Canvas / Card)**: `#FFFFFF`

### 1.3 Secondary & Accent Colors
* **Secondary 1 (Deep Navy / Header Text)**: `#182233`
* **Secondary 2 (Slate Accent / Border Tint)**: `#B3CEE2`
* **Secondary 3 (Subtle Divider)**: `#D9DDE7`
* **Secondary 4 (Accent Coral / Live Status)**: `#FD4E5D`

### 1.4 Semantic & Feedback States
* **Success**: `#76CA66` (Soft Emerald) | Tint: `rgba(118, 202, 102, 0.12)`
* **Warning**: `#FBC756` (Warm Amber) | Tint: `rgba(251, 199, 86, 0.14)`
* **Error / Danger**: `#BA0000` / `#EF4444` (Crimson) | Tint: `rgba(239, 68, 68, 0.1)`
* **Info**: `#A0C3FF` / `#116ACC` | Tint: `rgba(160, 195, 255, 0.15)`

---

## 🔠 2. Typography Scale

* **Primary Font Family**: `'Inter', 'Ubuntu', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
* **Code / Monospace**: `'JetBrains Mono', Consolas, Monaco, monospace`

| Scale | Size | Line Height | Weight | Letter Spacing | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Title** | `32px` / `24px` | `38px` / `30px` | `700` (Bold) | `-0.02em` | Page Headings, Modal Titles |
| **Heading 2** | `18px` / `20px` | `24px` / `26px` | `600` (SemiBold) | `-0.01em` | Section Titles, Card Headers |
| **Subheading** | `15px` / `16px` | `22px` | `500` (Medium) | `-0.01em` | Group Titles, Nav items |
| **Body (Main)** | `14px` | `20px` / `22px` | `400` / `500` | `0` | Default UI text, Inputs, Paragraphs |
| **Caption / Small** | `12px` / `13px` | `18px` | `400` / `500` | `0` | Badges, Helper text, Timestamps |
| **Micro** | `11px` | `14px` | `500` | `0` | Tooltips, Counter chips |

---

## 📐 3. Elevation & Shadows

* **Soft Elevation (Cards / Sidebars)**:
  `box-shadow: 0px 1px 3px rgba(19, 10, 46, 0.06), 0px 3px 12px rgba(19, 10, 46, 0.02);`
* **Medium Elevation (Dropdowns / Menus / Floating Bars)**:
  `box-shadow: 0px 6px 18px rgba(19, 10, 46, 0.08), 0px 1px 4px rgba(19, 10, 46, 0.04);`
* **High Elevation (Modals / Dialogs / Drawers)**:
  `box-shadow: 0px 12px 36px rgba(19, 10, 46, 0.12), 0px 30px 84px rgba(19, 10, 46, 0.08);`

---

## 🔘 4. Component Patterns

### 4.1 Buttons
* **Primary Button**:
  * Background: `#116ACC`
  * Hover: `#0C4A8F` with subtle glow (`0 4px 14px rgba(17, 106, 204, 0.25)`)
  * Text: `#FFFFFF`
  * Radius: `8px` (Standard) or `9999px` (Pill actions)
* **Secondary / Ghost Button**:
  * Background: `#FFFFFF` or `transparent`
  * Border: `1px solid #E5E7EB`
  * Text: `#374151`
  * Hover: Background `#F3F4F6`, Text `#1F2937`
* **Danger Button**:
  * Background: `rgba(239, 68, 68, 0.08)` -> Hover: `rgba(239, 68, 68, 0.18)`
  * Text: `#EF4444`

### 4.2 Inputs & Form Controls
* **Background**: `#FFFFFF` (Dark: `#1F2937`)
* **Border**: `1px solid #E5E7EB` (Focus: `1px solid #116ACC`, Box-shadow: `0 0 0 3px rgba(17, 106, 204, 0.15)`)
* **Radius**: `8px`
* **Padding**: `8px 12px`

### 4.3 Chips & Badges
* **Capsule Badge**:
  * Padding: `2px 8px`
  * Radius: `9999px`
  * Background: `rgba(17, 106, 204, 0.08)`
  * Text: `#116ACC`, Font Size: `12px`, Weight: `500`

---

## 💻 5. CSS Variable Implementation Reference

```css
:root {
  /* Brand Tokens */
  --brand-primary: #116ACC;
  --brand-primary-hover: #0C4A8F;
  --brand-primary-light: #CFE1F5;
  --brand-primary-subtle: rgba(17, 106, 204, 0.08);
  
  /* Neutral Surfaces */
  --bg-app: #F8FAFC;
  --bg-sidebar: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-header: #FFFFFF;
  --bg-toolbar: #F8FAFC;
  
  /* Text */
  --text-main: #1F2937;
  --text-muted: #6B7280;
  --text-subtle: #9CA3AF;
  
  /* Borders */
  --border-color: #E5E7EB;
  --border-focus: #116ACC;
  
  /* Buttons */
  --btn-primary-bg: #116ACC;
  --btn-primary-hover: #0C4A8F;
  --btn-primary-text: #FFFFFF;
  --btn-primary-radius: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(19, 10, 46, 0.05);
  --shadow-md: 0 4px 14px rgba(19, 10, 46, 0.06);
  --shadow-lg: 0 10px 30px rgba(19, 10, 46, 0.09);
}
```
