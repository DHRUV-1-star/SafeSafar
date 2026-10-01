import { supabase, isSupabaseConfigured } from './supabaseClient';
import { TrustedContact, Landmark, IncidentReport } from '../types';
import { MOCK_LANDMARKS, MOCK_INCIDENTS } from '../data/mockData';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'commuter' | 'guardian' | 'civic';
  avatar?: string;
  hub?: string;
}

const LOCAL_STORAGE_USERS_KEY = 'safesafar_db_users';
const LOCAL_STORAGE_SESSION_KEY = 'safesafar_db_session';
const getGuardiansKey = (userId: string) => `safesafar_db_guardians_${userId}`;

// Pre-seeded demo user accounts for instantaneous offline testing
const DEMO_USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: 'user-commuter-01',
    email: 'diya.patel@svnit.ac.in',
    name: 'Diya Patel',
    phone: '+91 98790 12345',
    role: 'commuter',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hub: 'SVNIT Campus, Dumas Road',
    passwordHash: 'password123',
  },
  {
    id: 'user-guardian-01',
    email: 'rajesh.patel@gmail.com',
    name: 'Rajesh Patel (Father)',
    phone: '+91 87808 88428',
    role: 'guardian',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hub: 'Ghod Dod Road, Surat',
    passwordHash: 'password123',
  },
  {
    id: 'user-civic-01',
    email: 'inspector.kavita@suratpolice.gov.in',
    name: 'Insp. Kavita Jadeja',
    phone: '+91 94281 99887',
    role: 'civic',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    hub: 'Umra Pink Police Station',
    passwordHash: 'password123',
  },
];

// Seed initial users if not present
function initializeLocalUsers() {
  const existing = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (!existing) {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(DEMO_USERS));
  }
}

initializeLocalUsers();

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Register a new user in the database
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  phone?: string,
  role: 'commuter' | 'guardian' | 'civic' = 'commuter'
): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Supabase Cloud Database Mode
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone?.trim() || '',
            role,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const newUser: AuthUser = {
          id: data.user.id,
          email: cleanEmail,
          name: name.trim(),
          phone: phone?.trim() || '',
          role,
          hub: 'SVNIT Surat Hub',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=7c3aed,4f46e5`,
        };
        return { user: newUser, error: null };
      }
    } catch (err: any) {
      console.warn('[Supabase Auth] Sign up error, falling back to local database:', err);
    }
  }

  // 2. Local Database Mode Fallback
  initializeLocalUsers();
  const rawUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  const users: (AuthUser & { passwordHash: string })[] = rawUsers ? JSON.parse(rawUsers) : [];

  if (users.some((u) => u.email === cleanEmail)) {
    return { user: null, error: 'An account with this email address already exists.' };
  }

  const newUserId = `user-${Date.now()}`;
  const newUser: AuthUser = {
    id: newUserId,
    email: cleanEmail,
    name: name.trim(),
    phone: phone?.trim() || '',
    role,
    hub: 'SVNIT Surat Hub',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=7c3aed,4f46e5`,
  };

  users.push({ ...newUser, passwordHash: password });
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newUser));

  return { user: newUser, error: null };
}

/**
 * Sign in an existing user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Supabase Cloud Database Mode
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Fetch user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const authUser: AuthUser = {
          id: data.user.id,
          email: cleanEmail,
          name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
          phone: profile?.phone || data.user.user_metadata?.phone || '',
          role: profile?.role || data.user.user_metadata?.role || 'commuter',
          hub: profile?.hub || 'SVNIT Surat Hub',
          avatar:
            profile?.avatar_url ||
            data.user.user_metadata?.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              profile?.full_name || 'User'
            )}&backgroundColor=7c3aed,4f46e5`,
        };

        return { user: authUser, error: null };
      }
    } catch (err: any) {
      console.warn('[Supabase Auth] Login error, checking local database:', err);
    }
  }

  // 2. Local Database Mode Fallback
  initializeLocalUsers();
  const rawUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  const users: (AuthUser & { passwordHash: string })[] = rawUsers ? JSON.parse(rawUsers) : [];

  const found = users.find((u) => u.email === cleanEmail && u.passwordHash === password);
  if (!found) {
    return { user: null, error: 'Invalid email or password.' };
  }

  const { passwordHash, ...cleanUser } = found;
  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(cleanUser));
  return { user: cleanUser, error: null };
}

/**
 * Sign in with Google using Supabase OAuth
 */
export async function loginWithGoogle(): Promise<{ error: string | null }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      console.warn('[Supabase Auth] Google login error:', err);
      return { error: err.message || 'Failed to initialize Google login' };
    }
  }
  return { error: 'Cloud database not configured. Google Sign-In requires Supabase.' };
}

// ============================================================================
// EMAIL OTP AUTHENTICATION (Supabase-only — requires VITE_SUPABASE_* keys)
// ============================================================================

/**
 * Send a real 6-digit OTP to the given email address via Supabase Auth.
 * Uses supabase.auth.signInWithOtp — Supabase delivers the email automatically.
 * Returns { error: null } on success, { error: message } on failure.
 */
export async function sendEmailOTP(
  email: string
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      error:
        'Cloud database not configured. Email OTP requires Supabase credentials in .env.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        // Allow new users to be created via OTP (first-time sign-up)
        shouldCreateUser: true,
      },
    });

    if (error) {
      // Return Supabase's message directly — they are already user-readable
      return { error: error.message };
    }

    return { error: null };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'Failed to send verification email.';
    console.warn('[Supabase Auth] sendEmailOTP error:', err);
    return { error: msg };
  }
}

/**
 * Verify the 6-digit OTP that Supabase emailed to the user.
 * Uses supabase.auth.verifyOtp — Supabase validates the token and creates a session.
 *
 * Verification chain (adjustment #3 in implementation plan):
 *   1. supabase.auth.verifyOtp  → confirms OTP, returns session + auth.users record
 *   2. data.session             → confirms a real Supabase auth session exists
 *   3. data.user.id             → the canonical auth.users identity
 *   4. public.profiles query    → loads the SafeSafar profile (created by DB trigger)
 *   5. AuthUser mapping         → converts Supabase data into the existing AuthUser shape
 *
 * Does NOT fall back to DEMO_USERS or MOCK_USERS after a successful Supabase call.
 * Falls back to null/error only when Supabase itself rejects the OTP.
 */
export async function verifyEmailOTP(
  email: string,
  token: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      user: null,
      error: 'Cloud database not configured. Email OTP requires Supabase credentials in .env.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  try {
    // Step 1: Verify the OTP — Supabase validates and creates the auth session
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // Step 2: Confirm a real session was established (safety check)
    if (!data.session) {
      return {
        user: null,
        error: 'Authentication succeeded but no session was created. Please try again.',
      };
    }

    // Step 3: Confirm we have the auth.users identity
    if (!data.user) {
      return {
        user: null,
        error: 'Session created but user identity is missing. Please try again.',
      };
    }

    // Step 4: Load the public.profiles record
    // The on_auth_user_created DB trigger creates this row on first sign-up.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // Profile may not exist yet if the DB trigger hasn't fired (rare timing).
      // Log the warning but continue — we fall back to user_metadata from Google/OTP.
      console.warn('[Supabase DB] Profile fetch after OTP verify:', profileError.message);
    }

    // Step 5: Map to the existing AuthUser shape used throughout the app
    const authUser: AuthUser = {
      id: data.user.id,
      email: cleanEmail,
      name:
        profile?.full_name ??
        data.user.user_metadata?.full_name ??
        cleanEmail.split('@')[0] ??
        'SafeSafar User',
      phone: profile?.phone ?? data.user.user_metadata?.phone ?? '',
      role: (profile?.role as AuthUser['role']) ?? 'commuter',
      hub: profile?.hub ?? 'SVNIT Surat Hub',
      avatar:
        profile?.avatar_url ??
        data.user.user_metadata?.avatar_url ??
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          profile?.full_name ?? cleanEmail.split('@')[0] ?? 'User'
        )}&backgroundColor=7c3aed,4f46e5`,
    };

    return { user: authUser, error: null };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'OTP verification failed. Please try again.';
    console.warn('[Supabase Auth] verifyEmailOTP error:', err);
    return { user: null, error: msg };
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase Auth] Sign out error:', err);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
}

/**
 * Get current session user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  // 1. Supabase Cloud Check
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        return {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: profile?.full_name || data.session.user.user_metadata?.full_name || 'User',
          phone: profile?.phone || data.session.user.user_metadata?.phone || '',
          role: profile?.role || data.session.user.user_metadata?.role || 'commuter',
          hub: profile?.hub || 'SVNIT Surat Hub',
          avatar:
            profile?.avatar_url ||
            data.session.user.user_metadata?.avatar_url ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              profile?.full_name || 'User'
            )}&backgroundColor=7c3aed,4f46e5`,
        };
      }
    } catch (err) {
      console.warn('[Supabase Auth] Session fetch error:', err);
    }
  }

  // 2. Local Database Session Check
  const rawSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
  if (rawSession) {
    try {
      return JSON.parse(rawSession);
    } catch {
      return null;
    }
  }

  // Default to pre-seeded Diya Patel if first time
  const defaultUser = DEMO_USERS[0];
  const { passwordHash, ...cleanDefault } = defaultUser;
  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(cleanDefault));
  return cleanDefault;
}

// ============================================================================
// GUARDIAN DATABASE CRUD FUNCTIONS (Linked to User ID)
// ============================================================================

/**
 * Fetch all guardians for a specific user from the database
 */
export async function fetchUserGuardians(userId: string): Promise<TrustedContact[]> {
  if (!userId) return [];

  // 1. Supabase Cloud Database Query
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          relation: item.relation,
          phone: item.phone,
          email: item.email || undefined,
          isEmergencyAlert: item.is_emergency_alert,
          isPrimary: item.is_primary,
          avatar:
            item.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=7c3aed,4f46e5`,
          batteryStatus: item.battery_status ?? 92,
          lastActive: item.last_active || 'Active now',
        }));
      }
    } catch (err) {
      console.warn('[Supabase DB] Failed to fetch guardians, checking local DB:', err);
    }
  }

  // 2. Local Database Query (Partitioned per User ID)
  const key = getGuardiansKey(userId);
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local guardians for user', e);
    }
  }

  return [];
}

/**
 * Add a new guardian for the current user into the database
 */
export async function saveGuardianToDatabase(
  userId: string,
  guardianData: Omit<TrustedContact, 'id'>
): Promise<TrustedContact> {
  const avatar =
    guardianData.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guardianData.name)}&backgroundColor=7c3aed,4f46e5,db2777`;

  // 1. Supabase Cloud Database Insert
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('guardians')
        .insert({
          user_id: userId,
          name: guardianData.name,
          relation: guardianData.relation,
          phone: guardianData.phone,
          email: guardianData.email || null,
          is_emergency_alert: guardianData.isEmergencyAlert,
          is_primary: guardianData.isPrimary || false,
          avatar,
          battery_status: guardianData.batteryStatus ?? 90,
          last_active: 'Active now',
        })
        .select()
        .single();

      if (!error && data) {
        const saved: TrustedContact = {
          id: data.id,
          name: data.name,
          relation: data.relation,
          phone: data.phone,
          email: data.email || undefined,
          isEmergencyAlert: data.is_emergency_alert,
          isPrimary: data.is_primary,
          avatar: data.avatar,
          batteryStatus: data.battery_status,
          lastActive: data.last_active,
        };

        // Also sync local cache for offline speed
        const key = getGuardiansKey(userId);
        const current = await fetchUserGuardians(userId);
        localStorage.setItem(key, JSON.stringify([saved, ...current]));

        return saved;
      }
    } catch (err) {
      console.warn('[Supabase DB] Failed to insert guardian into Supabase:', err);
    }
  }

  // 2. Local Database Insert
  const key = getGuardiansKey(userId);
  const current = await fetchUserGuardians(userId);

  const newContact: TrustedContact = {
    ...guardianData,
    id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    avatar,
    batteryStatus: guardianData.batteryStatus ?? Math.floor(Math.random() * 20) + 80,
    lastActive: 'Active now',
  };

  const updated = [newContact, ...current];
  localStorage.setItem(key, JSON.stringify(updated));
  return newContact;
}

/**
 * Update an existing guardian in the database
 */
export async function updateGuardianInDatabase(
  userId: string,
  guardianId: string,
  updates: Partial<TrustedContact>
): Promise<TrustedContact[]> {
  // 1. Supabase Cloud Database Update
  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.relation !== undefined) payload.relation = updates.relation;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.isEmergencyAlert !== undefined) payload.is_emergency_alert = updates.isEmergencyAlert;
      if (updates.isPrimary !== undefined) payload.is_primary = updates.isPrimary;
      if (updates.avatar !== undefined) payload.avatar = updates.avatar;

      await supabase
        .from('guardians')
        .update(payload)
        .eq('id', guardianId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[Supabase DB] Failed to update guardian in Supabase:', err);
    }
  }

  // 2. Local Database Update
  const key = getGuardiansKey(userId);
  const current = await fetchUserGuardians(userId);
  const updated = current.map((c) => (c.id === guardianId ? { ...c, ...updates } : c));
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

/**
 * Delete a guardian from the database
 */
export async function deleteGuardianFromDatabase(
  userId: string,
  guardianId: string
): Promise<TrustedContact[]> {
  // 1. Supabase Cloud Database Delete
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('guardians')
        .delete()
        .eq('id', guardianId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[Supabase DB] Failed to delete guardian in Supabase:', err);
    }
  }

  // 2. Local Database Delete
  const key = getGuardiansKey(userId);
  const current = await fetchUserGuardians(userId);
  const updated = current.filter((c) => c.id !== guardianId);
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

/**
 * Update user profile details in the database
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<AuthUser>
): Promise<AuthUser> {
  const current = (await getCurrentUser()) || DEMO_USERS[0];
  const updated: AuthUser = { ...current, ...updates };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: updated.name,
          phone: updated.phone,
          hub: updated.hub,
          avatar_url: updated.avatar,
        })
        .eq('id', userId);
    } catch (err) {
      console.warn('[Supabase DB] Failed to update profile:', err);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));
  return updated;
}

// ============================================================================
// PUBLIC DATA (Landmarks & Incidents)
// ============================================================================

const LOCAL_STORAGE_LANDMARKS_KEY = 'safesafar_db_landmarks';
const LOCAL_STORAGE_INCIDENTS_KEY = 'safesafar_db_incidents';

export async function fetchLandmarks(): Promise<Landmark[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('landmarks').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type as any,
          lat: item.lat,
          lng: item.lng,
          address: item.address,
          phone: item.phone,
          openHours: item.open_hours,
          verified: item.verified,
          distanceMeters: item.distance_meters,
        }));
      }
    } catch (err) {
      console.warn('[Supabase DB] Failed to fetch landmarks, checking local DB:', err);
    }
  }

  // Local fallback
  const raw = localStorage.getItem(LOCAL_STORAGE_LANDMARKS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error('Error parsing local landmarks', e);
    }
  }

  // Seed default if empty
  localStorage.setItem(LOCAL_STORAGE_LANDMARKS_KEY, JSON.stringify(MOCK_LANDMARKS));
  return MOCK_LANDMARKS;
}

export async function fetchIncidents(): Promise<IncidentReport[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          type: item.type as any,
          severity: item.severity as any,
          lat: item.lat,
          lng: item.lng,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp_str,
          confirmations: item.confirmations,
          requiredConfirmations: item.required_confirmations,
          verified: item.verified,
          decayHoursLeft: item.decay_hours_left,
        }));
      }
    } catch (err) {
      console.warn('[Supabase DB] Failed to fetch incidents, checking local DB:', err);
    }
  }

  // Local fallback
  const raw = localStorage.getItem(LOCAL_STORAGE_INCIDENTS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error('Error parsing local incidents', e);
    }
  }

  // Seed default if empty
  localStorage.setItem(LOCAL_STORAGE_INCIDENTS_KEY, JSON.stringify(MOCK_INCIDENTS));
  return MOCK_INCIDENTS;
}

export async function saveIncidentToDatabase(incidentData: Omit<IncidentReport, 'id'>): Promise<IncidentReport> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          type: incidentData.type,
          severity: incidentData.severity,
          lat: incidentData.lat,
          lng: incidentData.lng,
          title: incidentData.title,
          description: incidentData.description,
          timestamp_str: incidentData.timestamp,
          confirmations: incidentData.confirmations,
          required_confirmations: incidentData.requiredConfirmations,
          verified: incidentData.verified,
          decay_hours_left: incidentData.decayHoursLeft,
        })
        .select()
        .single();

      if (!error && data) {
        const saved: IncidentReport = {
          id: data.id,
          type: data.type as any,
          severity: data.severity as any,
          lat: data.lat,
          lng: data.lng,
          title: data.title,
          description: data.description,
          timestamp: data.timestamp_str,
          confirmations: data.confirmations,
          requiredConfirmations: data.required_confirmations,
          verified: data.verified,
          decayHoursLeft: data.decay_hours_left,
        };

        const current = await fetchIncidents();
        localStorage.setItem(LOCAL_STORAGE_INCIDENTS_KEY, JSON.stringify([saved, ...current]));
        return saved;
      }
    } catch (err) {
      console.warn('[Supabase DB] Failed to insert incident:', err);
    }
  }

  // Local fallback
  const current = await fetchIncidents();
  const newIncident: IncidentReport = {
    ...incidentData,
    id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  };

  const updated = [newIncident, ...current];
  localStorage.setItem(LOCAL_STORAGE_INCIDENTS_KEY, JSON.stringify(updated));
  return newIncident;
}
