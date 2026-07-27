/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenId =
  | 'join-heritage'                  // 1. Join Heritage Register
  | 'artistic-echoes'                // 2. Step 02 of 05 Quiz
  | 'personalized-dashboard'         // 3. User Dashboard (Aryan)
  | 'explore-map'                    // 4. Interactive India Map
  | 'profile-settings'               // 5. Profile & Settings (Aryan)
  | 'artisan-application'            // 6. Artisan Application Form
  | 'artisan-application-status'     // 7. Artisan Application Verification Status
  | 'artisan-dashboard'              // 8. Artisan Dashboard
  | 'supervisor-dashboard'           // 9. System Supervisor Analytics Dashboard
  | 'workshop-detail'                // 11. Workshop Detail / Investment
  | 'workshop-confirmation';         // 12. Booking Confirmation

export interface Artisan {
  id: string;
  name: string;
  region: string;
  category: string;
  avatar: string;
  bio: string;
  rating?: number;
  highlightImage: string;
  tag: 'Master Craftsman' | 'Next Gen' | 'Community initiative' | 'Master Weaver';
}

export interface Workshop {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  date: string;
  time: string;
  price: string;
  category: 'Hands-on' | 'Masterclass' | 'Seminar';
  thumbnail: string;
  venue: string;
  mode?: 'online' | 'offline';
  state?: string;
}

export interface Artifact {
  id: string;
  name: string;
  price: string;
  category: 'Ceramics' | 'Textiles' | 'Decor';
  image: string;
  status: 'In Stock' | 'Archive' | 'Sold';
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  category: string;
  crafts?: string[];
  state?: string;
  region: string;
  craftIcon: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  govtIdUrl: string;
  certUrl: string;
  portfolio: string[];
  regionValidation?: RegionValidation;
}

export interface CraftRegionCheck {
  craft: string;
  matchesRegion: boolean;
  knownStates: string[];
  primaryState?: string | null;
}

export interface RegionValidation {
  valid: boolean;
  state?: string;
  zone?: string;
  crafts?: string[];
  checks?: CraftRegionCheck[];
  allVerified?: boolean;
  suspiciousCount?: number;
  message?: string;
  error?: string;
}
