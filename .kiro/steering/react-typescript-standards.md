---
inclusion: always
---

# React TypeScript Development Standards

## Code Quality Standards

### TypeScript Best Practices
- Use strict type checking for all components
- Define proper interfaces for props and state
- Avoid `any` types - use proper type definitions
- Use type inference where appropriate
- Export types for reusability across components

### Component Structure
- Use functional components with hooks
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks
- Use proper prop destructuring
- Implement error boundaries for critical sections

### State Management
- Use React Query (TanStack Query) for server state
- Use local state for UI-only concerns
- Implement proper loading and error states
- Cache data appropriately to reduce API calls

### Performance Optimization
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Lazy load routes and heavy components
- Optimize re-renders with useMemo and useCallback

### File Organization
- Group related components in feature folders
- Keep utility functions in dedicated utils directory
- Separate business logic from UI components
- Use barrel exports (index.ts) for cleaner imports

## MediaPipe Integration Standards

### Pose Detection
- Initialize MediaPipe with proper configuration
- Handle camera permissions gracefully
- Implement proper cleanup in useEffect
- Process landmarks efficiently
- Validate pose data before processing

### Video Processing
- Use proper video constraints (resolution, fps)
- Implement frame-by-frame analysis
- Handle video loading states
- Provide visual feedback during processing
- Optimize canvas rendering performance

## Error Handling
- Implement try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors for debugging
- Implement fallback UI for failures
- Handle edge cases (no camera, unsupported browser)

## Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Provide alternative text for images
- Test with screen readers
