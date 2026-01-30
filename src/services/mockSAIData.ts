/**
 * Mock SAI Data Service
 * Provides demo coaches and athletes for SAI Admin Dashboard
 * Real workouts still work - this just adds visual demo data
 */

export interface MockCoach {
  id: string;
  name: string;
  profilePic: string;
  athleteCount: number;
  totalWorkouts: number;
}

export interface MockAthlete {
  id: string;
  name: string;
  profilePic: string;
  coachName: string;
  workoutCount: number;
  lastWorkout: string;
}

// Mock coaches using images from ppl folder
export const MOCK_COACHES: MockCoach[] = [
  {
    id: 'coach-1',
    name: 'Gautham Vasudev Menon',
    profilePic: '/ppl/sundar kumar.jpg',
    athleteCount: 0, // Will be calculated dynamically
    totalWorkouts: 0
  },
  {
    id: 'coach-2',
    name: 'Rahul Dravid',
    profilePic: '/ppl/dravid.avif',
    athleteCount: 3,
    totalWorkouts: 12
  },
  {
    id: 'coach-3',
    name: 'Manish Paul',
    profilePic: '/ppl/manish paul.jpg',
    athleteCount: 2,
    totalWorkouts: 8
  }
];

// Mock athletes using images from ppl folder
export const MOCK_ATHLETES: MockAthlete[] = [
  // Athletes under Rahul Dravid
  {
    id: 'athlete-1',
    name: 'Aryan Sharma',
    profilePic: '/ppl/aryan.webp',
    coachName: 'Rahul Dravid',
    workoutCount: 5,
    lastWorkout: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'athlete-2',
    name: 'Dev Patel',
    profilePic: '/ppl/dev patel.jpg',
    coachName: 'Rahul Dravid',
    workoutCount: 4,
    lastWorkout: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    id: 'athlete-3',
    name: 'Umesh Yadav',
    profilePic: '/ppl/umesh yadav.jpeg',
    coachName: 'Rahul Dravid',
    workoutCount: 3,
    lastWorkout: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  
  // Athletes under Manish Paul
  {
    id: 'athlete-4',
    name: 'Dharani Kumar',
    profilePic: '/ppl/dharani.webp',
    coachName: 'Manish Paul',
    workoutCount: 4,
    lastWorkout: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    id: 'athlete-5',
    name: 'Pranshika Singh',
    profilePic: '/ppl/pranshika.webp',
    coachName: 'Manish Paul',
    workoutCount: 4,
    lastWorkout: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  }
];

/**
 * Get all mock coaches with real athlete data merged in
 */
export function getMockCoachesWithRealData(realAthletes: Array<{ name: string; workoutCount: number }>): MockCoach[] {
  const coaches = [...MOCK_COACHES];
  
  // Update Gautham Vasudev Menon with real athlete data
  const gvmCoach = coaches.find(c => c.name === 'Gautham Vasudev Menon');
  if (gvmCoach) {
    gvmCoach.athleteCount = realAthletes.length;
    gvmCoach.totalWorkouts = realAthletes.reduce((sum, a) => sum + a.workoutCount, 0);
  }
  
  return coaches;
}

/**
 * Get all mock athletes with real athlete data merged in
 */
export function getMockAthletesWithRealData(realAthletes: Array<{ 
  name: string; 
  workoutCount: number; 
  lastWorkout: string;
  athleteProfilePic?: string;
}>): MockAthlete[] {
  const mockAthletes = [...MOCK_ATHLETES];
  
  // Add real athletes under Gautham Vasudev Menon
  const realAthletesWithCoach = realAthletes.map(athlete => ({
    id: `real-${athlete.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: athlete.name,
    profilePic: athlete.athleteProfilePic || '/ppl/madhesh.jpg', // Default pic
    coachName: 'Gautham Vasudev Menon',
    workoutCount: athlete.workoutCount,
    lastWorkout: athlete.lastWorkout
  }));
  
  return [...realAthletesWithCoach, ...mockAthletes];
}

/**
 * Get mock workouts for demo athletes (not real ones)
 */
export function getMockWorkoutsForAthlete(athleteName: string) {
  // Only return mock data for demo athletes
  const mockAthlete = MOCK_ATHLETES.find(a => a.name === athleteName);
  if (!mockAthlete) {
    return []; // Real athlete - no mock data
  }
  
  // Generate mock workout data
  const workouts = [];
  const activities = ['Push-ups', 'Squats', 'Sit-ups', 'Pull-ups'];
  
  for (let i = 0; i < mockAthlete.workoutCount; i++) {
    const activity = activities[i % activities.length];
    const timestamp = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000); // Days ago
    
    workouts.push({
      id: `mock-${athleteName}-${i}`,
      athleteName: mockAthlete.name,
      athleteProfilePic: mockAthlete.profilePic,
      activityName: activity,
      totalReps: Math.floor(Math.random() * 20) + 10,
      correctReps: Math.floor(Math.random() * 15) + 8,
      incorrectReps: Math.floor(Math.random() * 5) + 2,
      duration: Math.floor(Math.random() * 120) + 60,
      accuracy: Math.floor(Math.random() * 30) + 70,
      formScore: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
      repDetails: [],
      timestamp: timestamp.toISOString(),
      screenshots: [],
      videoUrl: undefined,
      pdfUrl: undefined
    });
  }
  
  return workouts;
}

/**
 * Check if an athlete is a mock/demo athlete
 */
export function isMockAthlete(athleteName: string): boolean {
  return MOCK_ATHLETES.some(a => a.name === athleteName);
}

/**
 * Check if a coach is a mock/demo coach
 */
export function isMockCoach(coachName: string): boolean {
  return MOCK_COACHES.some(c => c.name === coachName);
}
