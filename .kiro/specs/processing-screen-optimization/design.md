# Design Document

## Overview

This design document outlines the optimization strategy for processing preview and output screens across both normal mode (VideoProcessor) and test mode (TestVideoProcessor/TestWorkoutInterface). The focus is on restructuring mobile layouts with proper vertical hierarchy, implementing bright red gradient theme for test mode processing screens, optimizing PC video sizing, fixing GIF visibility, and ensuring consistent visual presentation across all devices and modes.

## Architecture

### Component Hierarchy

```
Normal Mode:
- VideoProcessor (Processing + Results)
  ├── Processing Screen (Live preview with metrics)
  └── Results Screen (Video player + metrics grid)

Test Mode:
- TestWorkoutInterface (Wrapper)
  ├── TestWorkoutDetail (Pre-workout with GIF)
  ├── TestVideoProcessor (Processing + Results)
  └── TestSkeletonRenderer (Visualization)
```

### Theme System

Both modes share the same component structure but apply different theme colors:
- **Normal Mode**: Uses default theme (primary colors: blue/purple tones)
- **Test Mode**: Uses red theme via CSS overrides in `test-mode-theme.css`

## Components and Interfaces

### 1. Mobile Processing Screen Layout Restructuring

#### Current Issues
- Processing screen components not in optimal vertical order
- Privacy information not prominently displayed
- Inconsistent layout hierarchy between mobile and desktop

#### Design Solution

**Mobile Layout Structure (Both Normal and Test Mode):**
```tsx
<ProcessingScreen className="mobile-layout">
  <Header sticky>
    <BackButton />
    <Title />
  </Header>
  
  <Content className="flex flex-col space-y-4 p-4">
    {/* 1. Live Processing Section - TOP */}
    <LiveProcessingSection className="order-1">
      <VideoCanvas>
        <MediaPipeOverlay />
        <SkeletonVisualization />
      </VideoCanvas>
      <RepCounter badge position="top-right" />
    </LiveProcessingSection>
    
    {/* 2. Processing Progress Section - SECOND */}
    <ProcessingProgressSection className="order-2">
      <ProgressBar percentage={progress} />
      <StatusText>Processing frame {current} of {total}</StatusText>
    </ProcessingProgressSection>
    
    {/* 3. Live Metrics Section - THIRD */}
    <LiveMetricsSection className="order-3">
      <MetricsGrid columns={2}>
        <MetricBox label="Reps" value={reps} />
        <MetricBox label="Time" value={time} />
        <MetricBox label="Form" value={formScore} />
        <MetricBox label="Pace" value={pace} />
      </MetricsGrid>
    </LiveMetricsSection>
    
    {/* 4. Privacy Text - BOTTOM */}
    <PrivacyInfoSection className="order-4">
      <InfoText icon="💡">
        Processing happens entirely in your browser - no data is sent to any server!
      </InfoText>
      <InfoText icon="⚡">
        Processing continues even when this tab is minimized or inactive
      </InfoText>
    </PrivacyInfoSection>
  </Content>
</ProcessingScreen>
```

**Responsive Behavior:**
- Mobile (<768px): Vertical stack with full-width components
- Tablet (768px-1024px): Vertical stack with constrained max-width
- Desktop (>1024px): See PC-specific layout below

### 2. PC Processing Screen Layout Optimization

#### Current Issues
- Live metrics not centered on desktop views
- Inefficient use of horizontal space
- Inconsistent alignment across sections

#### Design Solution

**PC Layout Structure (>1024px):**
```tsx
<ProcessingScreen className="pc-layout">
  <Header sticky>
    <BackButton />
    <Title />
  </Header>
  
  <Content className="max-w-6xl mx-auto px-8 py-6">
    {/* Live Processing Section - Centered */}
    <LiveProcessingSection className="mx-auto max-w-4xl mb-6">
      <VideoCanvas className="w-full aspect-video" />
    </LiveProcessingSection>
    
    {/* Processing Progress Section - Centered */}
    <ProcessingProgressSection className="mx-auto max-w-2xl mb-6">
      <ProgressBar />
      <StatusText className="text-center" />
    </ProcessingProgressSection>
    
    {/* Live Metrics Section - CENTERED */}
    <LiveMetricsSection className="mx-auto max-w-4xl mb-6">
      <MetricsGrid columns={4} className="justify-center">
        <MetricBox />
        <MetricBox />
        <MetricBox />
        <MetricBox />
      </MetricsGrid>
    </LiveMetricsSection>
    
    {/* Privacy Text - Centered */}
    <PrivacyInfoSection className="mx-auto max-w-2xl text-center">
      <InfoText />
      <InfoText />
    </PrivacyInfoSection>
  </Content>
</ProcessingScreen>
```

**Centering Strategy:**
- Use `mx-auto` (margin: 0 auto) for horizontal centering
- Apply `max-w-*` constraints for optimal readability
- Use flexbox/grid `justify-center` for metric alignment
- Maintain consistent spacing with `mb-*` utilities

### 3. PC Output Screen Video Size Optimization

#### Current Issues
- Output video too large on PC, requiring scrolling to see metrics
- Poor viewport utilization
- Metrics hidden below fold

#### Design Solution

**PC Output Screen Layout:**
```tsx
<OutputScreen className="pc-layout">
  <Header sticky>
    <BackButton />
    <Title />
  </Header>
  
  <Content className="max-w-7xl mx-auto px-8 py-6">
    {/* Video Player - Constrained Height */}
    <VideoPlayerSection className="mb-6">
      <VideoPlayer 
        className="w-full max-h-[50vh] object-contain"
        src={processedVideoUrl}
        controls
      />
    </VideoPlayerSection>
    
    {/* Metrics Grid - Visible Without Scrolling */}
    <MetricsSection>
      <MetricsGrid columns={4} gap={4}>
        <MetricBox />
        <MetricBox />
        <MetricBox />
        <MetricBox />
        {/* Additional metrics... */}
      </MetricsGrid>
    </MetricsSection>
  </Content>
</OutputScreen>
```

**Video Sizing Strategy:**
- Max height: 50vh (50% of viewport height)
- Width: 100% of container (respects max-width)
- Object-fit: contain (maintains aspect ratio)
- Ensures first row of metrics visible without scroll
- Allows scrolling for additional metrics if needed

**Responsive Breakpoints:**
- Mobile (<768px): max-h-[40vh]
- Tablet (768px-1024px): max-h-[45vh]
- Desktop (>1024px): max-h-[50vh]
- Large Desktop (>1440px): max-h-[55vh]

### 4. Test Mode GIF Visibility Fix

#### Current Issues
- GIFs not visible in TestWorkoutDetail screen
- Missing workout demonstration in test mode
- Inconsistent experience compared to normal mode

#### Design Solution

**GIF Display Component for Test Mode:**
```tsx
<TestWorkoutDetail>
  <Header>
    <BackButton />
    <Title>{activityName}</Title>
  </Header>
  
  <Content>
    {/* GIF Demonstration Section */}
    <GIFSection className="mb-6">
      <GIFContainer className="relative aspect-video rounded-lg overflow-hidden border-2 border-red-500/30">
        {loading ? (
          <LoadingSpinner className="text-red-500" />
        ) : error ? (
          <FallbackIcon className="w-16 h-16 text-red-400" />
        ) : (
          <img
            src={getTestGifPath(activityName)}
            alt={`${activityName} demonstration`}
            className="w-full h-full object-contain bg-gray-900"
            onError={() => setError(true)}
            onLoad={() => setLoading(false)}
          />
        )}
      </GIFContainer>
      <Caption className="text-center text-red-300 text-sm mt-2">
        Watch the demonstration for proper form
      </Caption>
    </GIFSection>
    
    {/* Rest of workout details... */}
  </Content>
</TestWorkoutDetail>
```

**GIF Path Mapping:**
```typescript
const getTestGifPath = (activityName: string): string => {
  const gifMap: Record<string, string> = {
    'Push-ups': '/ghost/pushup.gif',
    'Pull-ups': '/ghost/pullup.gif',
    'Sit-ups': '/ghost/situp.gif',
    'Shuttle Run': '/ghost/shuttlerun.gif',
    'Sit & Reach': '/ghost/sit&reach.gif',
    'Vertical Jump': '/ghost/verticaljump.gif',
    'Knee Push-ups': '/ghost/kneepushup.gif'
  };
  
  return gifMap[activityName] || '/placeholder.svg';
};
```

**Visibility Enhancements:**
- Dark background (bg-gray-900) for GIF contrast
- Red-themed border matching test mode
- Proper aspect ratio container
- Loading and error states
- Positioned prominently before instructions

### 5. Test Mode Bright Red Gradient Theme Implementation

#### Design Approach

**Bright Red Gradient Definition:**
```css
/* Primary bright red gradient for test mode */
.test-mode-bright-red-gradient {
  background: linear-gradient(135deg, #ff0000 0%, #ff3333 25%, #ff0000 50%, #cc0000 75%, #ff0000 100%);
}

/* Alternative vibrant gradient */
.test-mode-vibrant-gradient {
  background: linear-gradient(to bottom right, #ff1744, #f50057, #ff0000);
}

/* Animated gradient option */
.test-mode-animated-gradient {
  background: linear-gradient(45deg, #ff0000, #ff3333, #ff0000, #cc0000);
  background-size: 400% 400%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

**Component-Specific Styling:**

**Processing Progress Section:**
```tsx
<ProcessingProgressSection className="test-mode-processing-progress">
  <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-lg p-4">
    <ProgressBar className="bg-red-900" />
    <StatusText className="text-black font-semibold">
      Processing frame {current} of {total}
    </StatusText>
  </div>
</ProcessingProgressSection>
```

**Live Processing Section:**
```tsx
<LiveProcessingSection className="test-mode-live-processing">
  <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4">
    <VideoCanvas />
  </div>
</LiveProcessingSection>
```

**Live Metrics Section:**
```tsx
<LiveMetricsSection className="test-mode-live-metrics">
  {/* Outer container: bright red gradient */}
  <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-lg p-4">
    {/* Inner metric boxes: white background */}
    <MetricsGrid>
      <MetricBox className="bg-white rounded-md p-3">
        <Value className="text-red-600 font-bold">{reps}</Value>
        <Label className="text-gray-700">Reps</Label>
      </MetricBox>
      <MetricBox className="bg-white rounded-md p-3">
        <Value className="text-blue-600 font-bold">{time}</Value>
        <Label className="text-gray-700">Time</Label>
      </MetricBox>
      {/* More metrics... */}
    </MetricsGrid>
  </div>
</LiveMetricsSection>
```

**Privacy Text Section:**
```tsx
<PrivacyInfoSection className="test-mode-privacy">
  <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4">
    <InfoText className="text-black font-medium">
      💡 Processing happens entirely in your browser - no data is sent to any server!
    </InfoText>
    <InfoText className="text-black font-medium">
      ⚡ Processing continues even when this tab is minimized or inactive
    </InfoText>
  </div>
</PrivacyInfoSection>
```

### 6. Test Mode Text Color Contrast Strategy

#### Contrast Requirements

**Black Text on Bright Red Gradient:**
```css
/* Ensure sufficient contrast for readability */
.test-mode-text-on-red {
  color: #000000; /* Pure black */
  font-weight: 600; /* Semi-bold for better visibility */
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1); /* Subtle highlight */
}

/* For smaller text */
.test-mode-small-text {
  color: #000000;
  font-weight: 500;
  font-size: 0.875rem; /* 14px */
}
```

**White Inner Containers with Colored Text:**
```css
/* Metric boxes inside bright red container */
.test-mode-metric-inner {
  background: #ffffff;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

/* Metric values - use vibrant colors */
.test-mode-metric-value {
  color: #dc2626; /* Red-600 for primary metrics */
  font-weight: 700;
  font-size: 1.5rem;
}

.test-mode-metric-value.success {
  color: #16a34a; /* Green-600 for positive metrics */
}

.test-mode-metric-value.warning {
  color: #ea580c; /* Orange-600 for warnings */
}

/* Metric labels - use neutral dark */
.test-mode-metric-label {
  color: #374151; /* Gray-700 */
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**Contrast Ratios:**
- Black (#000000) on Bright Red (#ff0000): ~5.25:1 ✓ WCAG AA
- Black (#000000) on Red-600 (#dc2626): ~6.8:1 ✓ WCAG AA
- Red-600 (#dc2626) on White (#ffffff): ~7.0:1 ✓ WCAG AAA
- Gray-700 (#374151) on White (#ffffff): ~10.7:1 ✓ WCAG AAA

## Data Models

### Processing Screen Layout Model
```typescript
interface ProcessingScreenLayout {
  mode: 'normal' | 'test';
  viewport: 'mobile' | 'tablet' | 'desktop';
  sections: {
    liveProcessing: ProcessingSection;
    progress: ProgressSection;
    liveMetrics: MetricsSection;
    privacyInfo: PrivacySection;
  };
}

interface ProcessingSection {
  order: number; // 1 for top position
  visible: boolean;
  className: string;
  style: React.CSSProperties;
}

interface ProgressSection {
  order: number; // 2 for second position
  percentage: number;
  currentFrame: number;
  totalFrames: number;
  backgroundColor: string; // Bright red gradient for test mode
  textColor: string; // Black for test mode
}

interface MetricsSection {
  order: number; // 3 for third position
  metrics: MetricDisplay[];
  containerBg: string; // Bright red gradient for test mode
  innerBg: string; // White for test mode
  centered: boolean; // True for PC view
}

interface PrivacySection {
  order: number; // 4 for bottom position
  messages: string[];
  backgroundColor: string; // Bright red gradient for test mode
  textColor: string; // Black for test mode
}
```

### Metric Display Model
```typescript
interface MetricDisplay {
  value: string | number;
  label: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  icon?: React.ComponentType;
  format?: 'number' | 'time' | 'percentage' | 'distance';
}
```

### Theme Configuration
```typescript
interface ThemeConfig {
  mode: 'normal' | 'test';
  colors: {
    background: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    metricBg: string;
    border: string;
    accent: string;
  };
  gradients: {
    brightRed: string; // For test mode processing sections
    enabled: boolean; // True for test mode containers
  };
  textColors: {
    onBrightRed: string; // Black (#000000)
    onWhite: string; // Dark gray or colored
  };
}
```

### Video Output Configuration
```typescript
interface VideoOutputConfig {
  viewport: 'mobile' | 'tablet' | 'desktop';
  maxHeight: {
    mobile: string; // '40vh'
    tablet: string; // '45vh'
    desktop: string; // '50vh'
    largeDesktop: string; // '55vh'
  };
  aspectRatio: string; // '16/9' or 'video'
  objectFit: 'contain' | 'cover';
}
```

## Error Handling

### GIF Loading Errors
```tsx
<GIFDisplay>
  {gifError ? (
    <FallbackIcon className="w-16 h-16 text-muted" />
  ) : (
    <img 
      src={gifPath}
      onError={() => setGifError(true)}
      alt="Workout demonstration"
    />
  )}
</GIFDisplay>
```

### Scroll Performance Degradation
```tsx
// Detect scroll performance issues
useEffect(() => {
  let lastScrollTime = Date.now();
  let frameDrops = 0;
  
  const checkPerformance = () => {
    const now = Date.now();
    const delta = now - lastScrollTime;
    
    if (delta > 32) { // More than 2 frames dropped
      frameDrops++;
      if (frameDrops > 5) {
        // Disable animations
        document.body.classList.add('reduce-motion');
      }
    } else {
      frameDrops = Math.max(0, frameDrops - 1);
    }
    
    lastScrollTime = now;
  };
  
  window.addEventListener('scroll', checkPerformance);
  return () => window.removeEventListener('scroll', checkPerformance);
}, []);
```

## Testing Strategy

### Layout Order Verification
- Verify mobile processing screen shows: Live Processing → Progress → Metrics → Privacy (in order)
- Test PC processing screen has centered live metrics
- Confirm layout consistency between normal and test modes
- Validate responsive breakpoints (375px, 768px, 1024px, 1440px)

### Visual Regression Testing
- Screenshot comparison for both modes at all breakpoints
- Verify bright red gradient application in test mode
- Check black text visibility on red backgrounds
- Confirm white inner containers in test mode metrics
- Validate GIF visibility in TestWorkoutDetail

### Video Sizing Testing
- Test PC output screen video fits within 50vh
- Verify first row of metrics visible without scrolling
- Check aspect ratio preservation
- Test at multiple desktop resolutions (1920x1080, 2560x1440, 3840x2160)

### Color Contrast Testing
- Verify black text on bright red meets WCAG AA (>4.5:1)
- Check metric values on white backgrounds meet WCAG AAA (>7:1)
- Test readability in different lighting conditions
- Validate color-blind friendly combinations

### Theme Consistency Testing
- Verify bright red gradient applied to all test mode processing sections
- Check normal mode maintains original styling
- Test theme switching doesn't break layouts
- Validate CSS cascade and specificity

### Accessibility Testing
- WCAG AA contrast ratio verification
- Keyboard navigation testing
- Screen reader compatibility
- Focus indicator visibility
- Test with reduced motion preferences

### Cross-Browser Testing
- Chrome/Edge (Chromium)
- Firefox
- Safari (iOS and macOS)
- Mobile browsers (Chrome Mobile, Safari Mobile)

### Performance Testing
- Measure layout shift (CLS < 0.1)
- Test video loading performance
- Monitor GIF loading times
- Check rendering performance with bright gradients

## Implementation Notes

### CSS Architecture
- Use CSS custom properties for theme values
- Leverage CSS containment for performance
- Apply will-change sparingly
- Use transform for animations (GPU-accelerated)

### React Best Practices
- Memoize expensive components
- Use useCallback for event handlers
- Implement virtualization for long lists
- Debounce scroll handlers

### Theme Switching
- Test mode applies CSS class wrapper
- CSS cascade handles theme overrides
- No JavaScript theme switching needed
- Maintains component reusability

## Migration Path

1. **Phase 1**: Restructure Mobile Processing Screen Layout
   - Reorder components: Live Processing → Progress → Metrics → Privacy
   - Apply to both VideoProcessor (normal) and TestVideoProcessor (test)
   - Test layout on mobile devices

2. **Phase 2**: Implement PC Processing Screen Centering
   - Center-align live metrics section
   - Apply consistent centering to all sections
   - Test on desktop viewports

3. **Phase 3**: Optimize PC Output Screen Video Sizing
   - Constrain video height to 50vh
   - Ensure metrics visible without scrolling
   - Test at multiple resolutions

4. **Phase 4**: Fix Test Mode GIF Visibility
   - Add GIF display to TestWorkoutDetail
   - Implement loading and error states
   - Apply test mode theme styling

5. **Phase 5**: Implement Bright Red Gradient Theme
   - Apply bright red gradients to test mode processing sections
   - Update text colors to black on red backgrounds
   - Create white inner containers for metrics
   - Test contrast and readability

6. **Phase 6**: Testing and Refinement
   - Visual regression testing
   - Accessibility audit
   - Cross-browser verification
   - Performance optimization
