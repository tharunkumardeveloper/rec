/**
 * Utility to transform default/generic user names to proper Indian names
 */

export function transformUserName(name: string): string {
  // Transform generic "Athlete" name to an Indian name
  if (name === 'Athlete' || name === 'athlete') {
    return 'Rohan Mehta';
  }
  return name;
}

export function getDefaultProfilePic(originalName: string, currentProfilePic?: string): string {
  // If already has a profile pic, return it
  if (currentProfilePic && currentProfilePic !== '') {
    return currentProfilePic;
  }
  
  // If the original name was "Athlete", use aryan.webp
  if (originalName === 'Athlete' || originalName === 'athlete') {
    return '/ppl/aryan.webp';
  }
  
  // Default fallback
  return '/ppl/dharani.webp';
}
