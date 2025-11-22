# Engine Scroll Hero - Integration Guide

## Overview

Apple-style scroll reveal component featuring car engine visuals with smooth parallax, staggered animations, and optional 3D model support.

## Features

- **Smooth Scroll Animations**: Scale, opacity, parallax with eased cubic-bezier timing
- **Staggered Reveals**: 0.5s delay between each engine (configurable)
- **3D Model Support**: Optional WebGL/Three.js rendering with automatic fallback
- **Accessibility**: Full keyboard navigation, screen reader support, respects `prefers-reduced-motion`
- **Performance**: Lazy loading, LQIP, IntersectionObserver, code-split 3D bundle
- **Responsive**: Mobile-optimized with proper aspect ratios

## Quick Start

The component is already integrated into the Hero section at `src/components/Hero.tsx`.

### Basic Usage

```tsx
import EngineScrollHero, { EngineItem } from './components/EngineScrollHero';

const items: EngineItem[] = [
  {
    id: 'unique-id',
    title: 'V8 Power',
    description: 'Raw power and precision',
    image: 'path/to/high-res.jpg',
    imageLQIP: 'path/to/low-quality-placeholder.jpg',
    altText: 'Descriptive alt text for accessibility',
    use3D: false // Set to true for 3D models
  }
];

<EngineScrollHero
  items={items}
  autoplay={true}
  staggerDelay={0.5}
  itemPadding="12rem"
/>
```

## Configuration Props

### EngineScrollHero Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `EngineItem[]` | required | Array of engine items to display |
| `autoplay` | `boolean` | `true` | Auto-trigger animations on scroll |
| `staggerDelay` | `number` | `0.5` | Delay in seconds between reveals |
| `itemPadding` | `string` | `"12rem"` | Vertical spacing between items |

### EngineItem Interface

```typescript
interface EngineItem {
  id: string;              // Unique identifier
  title: string;           // Main heading
  description: string;     // Subtitle text
  image?: string;          // High-res image URL
  imageLQIP?: string;      // Low-quality placeholder (50px width)
  model3D?: string;        // Path to GLTF/GLB file
  altText: string;         // Accessibility description
  use3D?: boolean;         // Enable 3D model rendering
}
```

## Asset Preparation

### Images

**Recommended Specifications:**
- Format: JPEG (lossy) or WebP
- Resolution: 1920x1440px (4:3 aspect ratio)
- Compression: 80-85% quality
- File size: < 300KB per image

**LQIP (Low-Quality Image Placeholder):**
- Width: 50px
- Format: JPEG
- Quality: 40%
- Purpose: Instant display while high-res loads

**Example using Pexels:**
```
High-res: https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1200
LQIP:     https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=50
```

### 3D Models

**Format:** GLTF (.gltf) or Binary GLTF (.glb)

**Compression:** Use Draco compression
```bash
gltf-pipeline -i model.gltf -o model.glb -d
```

**Optimization Checklist:**
- ✅ Triangulate all meshes
- ✅ Merge duplicate vertices
- ✅ Remove unused materials/textures
- ✅ Apply Draco compression
- ✅ Target < 2MB per model

**Model Setup:**
- Scale: Normalized to ~1.5 units
- Origin: Center of model
- Materials: PBR (Metallic-Roughness workflow)
- Lighting: Works with HDR environment maps

## Animation Details

### Timing Curve
```
cubic-bezier(0.25, 0.1, 0.25, 1) - easeInOutCubic
Duration: 700ms per item
```

### Transform Properties

Each reveal includes:
1. **Opacity**: 0 → 1
2. **Scale**: 0.95 → 1
3. **Y-offset**: 20px → 0
4. **Rotation-Y**: ±15deg → 0 (alternating sides)
5. **Glow effect**: Animated gradient overlay

### Parallax Effect

Images move at 0.7x scroll speed relative to page scroll (subtle depth).

## Accessibility

### Keyboard Navigation
- Each engine item is focusable with `tabIndex={0}`
- Use Tab to cycle through items
- Screen readers announce `role="img"` with `aria-label`

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations set to duration: 0 */
  /* Only opacity transitions remain */
}
```

## Performance

### Lazy Loading Strategy
1. Images use native `loading="lazy"`
2. 3D models code-split with `React.lazy()`
3. LQIP displays instantly, high-res fades in

### IntersectionObserver
- Margin: `-20%` (trigger before viewport)
- Once: `false` (re-trigger on re-enter)

### Bundle Impact
- **Image mode**: ~8KB (Framer Motion overhead)
- **3D mode**: +180KB (Three.js, react-three-fiber, drei)
  - Code-split: Only loads when 3D item mounts

### Performance Checklist

**Manual Testing:**
1. Open DevTools → Performance tab
2. Record while scrolling through hero
3. Check: FPS stays > 55, no long tasks > 50ms

**Lighthouse:**
```bash
npm run build
npm run preview
# Open Lighthouse, run audit
```

**Target Metrics:**
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms

## Fallback Behavior

### No WebGL Support
If `window.WebGLRenderingContext` is undefined:
- Automatically falls back to static image
- Same reveal animation applied

### No Image Provided
Shows placeholder SVG icon with gradient background.

### Reduced Motion Enabled
- Animations duration set to 0
- Only fade-in opacity transition remains
- No scale/transform effects

## Integration Examples

### Replace Placeholder Images

```tsx
const engineItems: EngineItem[] = [
  {
    id: 'my-engine-1',
    title: 'Custom V8',
    description: 'High-performance custom engine',
    image: '/assets/engines/v8-highres.jpg',      // Your image
    imageLQIP: '/assets/engines/v8-lqip.jpg',     // Your LQIP
    altText: 'Custom built V8 engine with chrome headers',
    use3D: false
  }
];
```

### Add 3D Model

```tsx
{
  id: '3d-engine',
  title: '3D Interactive Engine',
  description: 'Explore every detail',
  model3D: '/models/engine.glb',                   // Your GLTF
  image: '/assets/engines/fallback.jpg',           // Fallback image
  imageLQIP: '/assets/engines/fallback-lqip.jpg',
  altText: '3D model of turbocharged inline-4 engine',
  use3D: true                                       // Enable 3D
}
```

### Disable Autoplay

```tsx
<EngineScrollHero
  items={engineItems}
  autoplay={false}  // No auto-reveal, user controls scroll
  staggerDelay={0.5}
/>
```

### Adjust Timing

```tsx
<EngineScrollHero
  items={engineItems}
  staggerDelay={0.3}    // Faster reveals
  itemPadding="8rem"    // Tighter spacing
/>
```

## Test Plan

### Manual QA Checklist

**Desktop (Chrome/Firefox/Safari):**
- [ ] Scroll down: items appear in order with 0.5s stagger
- [ ] Each item scales, fades, slides smoothly
- [ ] Glow effect pulses (gradient overlay)
- [ ] Keyboard Tab: can focus each engine item
- [ ] No layout shift when images load

**Mobile (iPhone/Android):**
- [ ] Animations smooth at 60fps
- [ ] Touch scroll triggers reveals
- [ ] Images lazy load (check Network tab)
- [ ] Pinch-to-zoom works on images

**Accessibility:**
- [ ] Screen reader (NVDA/VoiceOver): reads alt text for each engine
- [ ] System setting: Enable "Reduce Motion"
- [ ] Result: Animations disabled, only fade-in
- [ ] Keyboard navigation reaches all items

**Performance:**
- [ ] Lighthouse score: Performance > 90
- [ ] DevTools Performance: No frame drops during scroll
- [ ] Bundle size: Check dist/ folder < 500KB gzipped

### Edge Cases
- [ ] Slow 3G: LQIP shows instantly, high-res loads progressively
- [ ] No JavaScript: Static images visible (no animations)
- [ ] WebGL disabled: Falls back to images automatically
- [ ] Very long scroll: Memory usage stable (no leaks)

## Troubleshooting

### Images Not Loading
- Check CORS headers if using external URLs
- Verify image paths are correct (relative to public folder)
- Use browser DevTools Network tab to debug 404s

### 3D Models Not Appearing
- Ensure `.glb` file is in `/public` folder
- Check browser console for Three.js errors
- Test WebGL support: Visit https://get.webgl.org/
- Try fallback: Set `use3D: false` temporarily

### Animations Stuttering
- Reduce image file sizes (< 300KB each)
- Use fewer items (< 6 recommended)
- Check CPU usage in DevTools Performance
- Disable 3D models if on low-end device

### Layout Shifts
- Ensure container has `aspect-[4/3]` class
- LQIP must have same aspect ratio as high-res
- Reserve height with `min-h-screen` on parent

## Tech Stack

- **React 18** - Component framework
- **TypeScript** - Type safety
- **Framer Motion** - Animation library
- **Three.js** - 3D rendering (optional)
- **@react-three/fiber** - React bindings for Three.js
- **@react-three/drei** - Helpers for R3F (OrbitControls, Environment)
- **Tailwind CSS** - Utility styling

## Files Structure

```
src/
├── components/
│   ├── EngineScrollHero.tsx    # Main scroll hero component
│   ├── Engine3DModel.tsx       # 3D model renderer (lazy loaded)
│   └── Hero.tsx                # Integration example
└── ...
```

## Next Steps

1. **Replace Placeholder Images**: Add your own high-quality engine photos
2. **Optional 3D**: Export GLTF models and set `use3D: true`
3. **Customize Timing**: Adjust `staggerDelay` to taste
4. **Performance Audit**: Run Lighthouse and optimize as needed

## Support

For issues or questions:
- Check browser console for errors
- Verify asset paths and formats
- Test with `use3D: false` first (simpler)
- Ensure modern browser (Chrome 90+, Safari 14+, Firefox 88+)
