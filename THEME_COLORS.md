# Dark Theme Color Palettes

## Available Color Schemes

### 1. **Purple & Dark Gray** (Default - Modern, Trendy)
- Primary: `#8b5cf6` (Purple)
- Background: `#0a0a0f` → `#141420` → `#1a1a2e`
- Best for: Modern, trendy, creative vibes

### 2. **Emerald & Charcoal** (Fresh, Modern)
- Primary: `#10b981` (Emerald Green)
- Background: `#0a0f0a` → `#141914` → `#1a2e1a`
- Best for: Fresh, nature-inspired, growth-focused

### 3. **Rose & Slate** (Warm, Modern)
- Primary: `#f43f5e` (Rose Pink)
- Background: `#0f0a0a` → `#191414` → `#2e1a1a`
- Best for: Warm, energetic, bold

### 4. **Cyan & Deep Black** (Tech, Modern)
- Primary: `#06b6d4` (Cyan)
- Background: `#0a0f0f` → `#141919` → `#1a2e2e`
- Best for: Tech, futuristic, clean

### 5. **Amber & Dark** (Warm, Cozy)
- Primary: `#f59e0b` (Amber)
- Background: `#0f0a0a` → `#191414` → `#2e1f1a`
- Best for: Warm, cozy, inviting

### 6. **Indigo & Midnight** (Sophisticated)
- Primary: `#6366f1` (Indigo)
- Background: `#0a0a0f` → `#141420` → `#1a1a2e`
- Best for: Professional, sophisticated, calm

## How to Switch Themes

Add `data-theme="theme-name"` to the `<html>` tag in `layout.tsx`:

```tsx
<html lang="en" data-theme="emerald">
```

Available theme names:
- `emerald` - Emerald & Charcoal
- `rose` - Rose & Slate
- `cyan` - Cyan & Deep Black
- `amber` - Amber & Dark
- `indigo` - Indigo & Midnight
- (default) - Purple & Dark Gray

## CSS Variables

All themes use the same CSS variable names:
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--bg-card`, `--bg-hover`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--accent-primary`, `--accent-hover`, `--accent-light`
- `--border-color`, `--border-hover`
- `--success`, `--error`, `--warning`


