---
inclusion: fileMatch
fileMatchPattern: "**/components/**/*.tsx"
---

# UI/UX Design Guidelines

## Design System

### Color Palette
- Primary: Fitness-focused blues and greens
- Success: Green for valid reps and good form
- Error: Red for invalid reps and form issues
- Warning: Yellow for caution states
- Neutral: Grays for backgrounds and text

### Typography
- Use system fonts for performance
- Clear hierarchy (headings, body, captions)
- Readable font sizes (minimum 14px for body)
- Proper line height for readability

### Spacing
- Use consistent spacing scale (4px, 8px, 16px, 24px, 32px)
- Maintain proper padding and margins
- Use Tailwind spacing utilities
- Ensure touch targets are at least 44x44px

## Component Patterns

### Workout Cards
- Display workout type with icon/gif
- Show key metrics prominently
- Use progress indicators
- Implement hover states
- Make cards tappable/clickable

### Video Player
- Show clear play/pause controls
- Display progress bar
- Show current time and duration
- Implement fullscreen option
- Add playback speed controls

### Forms
- Use clear labels
- Provide inline validation
- Show error messages near inputs
- Implement loading states
- Disable submit during processing

### Feedback Components
- Use toast notifications for quick feedback
- Implement loading spinners for async operations
- Show progress bars for long operations
- Use modals for important confirmations
- Provide success/error animations

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach
- Design for mobile first
- Enhance for larger screens
- Test on actual devices
- Optimize touch interactions
- Consider thumb zones

### Layout Patterns
- Use flexbox and grid for layouts
- Implement collapsible navigation on mobile
- Stack content vertically on small screens
- Use horizontal scrolling sparingly
- Ensure proper viewport meta tag

## Accessibility

### ARIA Labels
- Add aria-label to icon buttons
- Use aria-describedby for form hints
- Implement aria-live for dynamic content
- Use proper heading hierarchy
- Add alt text to all images

### Keyboard Navigation
- Ensure all interactive elements are focusable
- Implement logical tab order
- Add visible focus indicators
- Support keyboard shortcuts
- Test with keyboard only

### Screen Reader Support
- Use semantic HTML
- Provide text alternatives
- Announce dynamic changes
- Use proper form labels
- Test with screen readers

## Animation Guidelines

### Performance
- Use CSS transforms for animations
- Avoid animating layout properties
- Use will-change sparingly
- Implement reduced motion preferences
- Keep animations under 300ms

### Purpose
- Use animations to guide attention
- Provide feedback for interactions
- Smooth state transitions
- Indicate loading states
- Celebrate achievements

## Loading States

### Skeleton Screens
- Show content structure while loading
- Match actual content layout
- Use subtle animations
- Avoid jarring transitions
- Implement for slow operations

### Progress Indicators
- Show determinate progress when possible
- Use spinners for indeterminate operations
- Provide time estimates for long operations
- Allow cancellation when appropriate
- Show what's happening ("Processing video...")
