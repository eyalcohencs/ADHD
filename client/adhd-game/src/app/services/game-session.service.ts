import { Injectable, signal } from '@angular/core';

export interface GameSession {
  id: string;
  gameType: 'kohs' | 'stroop' | 'go-no-go' | 'trail-making'; // Add more game types as needed
  difficulty: '4-blocks' | '16-blocks' | 'easy' | 'medium' | 'hard';
  timestamp: number;
  completed: boolean;
  timeSeconds: number;
  rotations?: number;
  drags?: number;
  errors?: number;
  // Future: Add more metrics as needed
}

export interface UserProfile {
  userId: string; // Temporary ID until login is implemented
  sessions: GameSession[];
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameSessionService {
  private readonly STORAGE_KEY = 'adhd_game_user_profile';
  private currentSession: GameSession | null = null;

  // Signal for reactive updates
  userProfile = signal<UserProfile>(this.loadProfile());

  constructor() {
    // Initialize or load user profile
    this.initializeProfile();
  }

  private initializeProfile(): void {
    const profile = this.loadProfile();
    if (!profile.userId) {
      // Generate temporary user ID
      profile.userId = this.generateTempUserId();
      profile.createdAt = Date.now();
      this.saveProfile(profile);
    }
    this.userProfile.set(profile);
  }

  private generateTempUserId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private loadProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error);
    }
    // Return empty profile if nothing stored or error
    return {
      userId: '',
      sessions: [],
      createdAt: Date.now()
    };
  }

  private saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
      this.userProfile.set(profile);
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
    }
  }

  // Start a new game session
  startSession(gameType: GameSession['gameType'], difficulty: GameSession['difficulty']): string {
    const sessionId = `${gameType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.currentSession = {
      id: sessionId,
      gameType,
      difficulty,
      timestamp: Date.now(),
      completed: false,
      timeSeconds: 0
    };
    return sessionId;
  }

  // Complete the current session with metrics
  completeSession(metrics: {
    timeSeconds: number;
    rotations?: number;
    drags?: number;
    errors?: number;
  }): void {
    if (!this.currentSession) {
      console.warn('No active session to complete');
      return;
    }

    this.currentSession.completed = true;
    this.currentSession.timeSeconds = metrics.timeSeconds;
    this.currentSession.rotations = metrics.rotations;
    this.currentSession.drags = metrics.drags;
    this.currentSession.errors = metrics.errors;

    // Add to profile
    const profile = this.userProfile();
    profile.sessions.push(this.currentSession);
    this.saveProfile(profile);

    this.currentSession = null;
  }

  // Get all sessions
  getAllSessions(): GameSession[] {
    return this.userProfile().sessions;
  }

  // Get sessions for a specific game type
  getSessionsByGame(gameType: GameSession['gameType']): GameSession[] {
    return this.userProfile().sessions.filter(s => s.gameType === gameType);
  }

  // Get analytics
  getAnalytics() {
    const sessions = this.getAllSessions();
    const completedSessions = sessions.filter(s => s.completed);

    if (completedSessions.length === 0) {
      return {
        totalGames: 0,
        averageTime: 0,
        averageRotations: 0,
        averageDrags: 0,
        fastestTime: 0,
        recentSessions: []
      };
    }

    const totalTime = completedSessions.reduce((sum, s) => sum + s.timeSeconds, 0);
    const totalRotations = completedSessions.reduce((sum, s) => sum + (s.rotations || 0), 0);
    const totalDrags = completedSessions.reduce((sum, s) => sum + (s.drags || 0), 0);
    const fastestTime = Math.min(...completedSessions.map(s => s.timeSeconds));

    return {
      totalGames: completedSessions.length,
      averageTime: totalTime / completedSessions.length,
      averageRotations: totalRotations / completedSessions.length,
      averageDrags: totalDrags / completedSessions.length,
      fastestTime,
      recentSessions: completedSessions.slice(-5).reverse() // Last 5 sessions
    };
  }

  // Clear all data (useful for testing or reset)
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeProfile();
  }

  // Get current user ID (for future server integration)
  getCurrentUserId(): string {
    return this.userProfile().userId;
  }

  // TODO: Future server integration methods
  // async syncWithServer(): Promise<void> {}
  // async loginUser(credentials): Promise<void> {}
}
