import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthUser, DemoAccount } from '../types/auth.types';
import { DEMO_ACCOUNTS, DEMO_PROFILES, DEMO_INSTITUTION, DEMO_COLLEGE } from './mockData';

const CURRENT_USER_KEY = 'edunexa_current_user';

export const authService = {
  getDemoAccounts(): DemoAccount[] {
    return DEMO_ACCOUNTS;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as AuthUser;
      } catch (e) {
        console.error('Failed to parse cached session', e);
      }
    }

    if (isSupabaseConfigured) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile) return null;

      let instId = profile.institution_id;
      let userRole = profile.role;

      if (!instId || !userRole) {
        const { data: membership } = await supabase
          .from('institution_memberships')
          .select('institution_id, role')
          .eq('profile_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (membership) {
          instId = instId || membership.institution_id;
          userRole = userRole || membership.role;
        }
      }

      const { data: institution } = instId
        ? await supabase.from('institutions').select('*').eq('id', instId).single()
        : { data: null };

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        role: userRole || 'school_admin',
        profile: { ...profile, institution_id: instId || DEMO_INSTITUTION.id, role: userRole || 'school_admin' },
        institution: institution || DEMO_INSTITUTION,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }

    // Default demo user is School Admin
    const defaultDemo = DEMO_ACCOUNTS[0];
    const user = this.createDemoSession(defaultDemo.id);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async login(email: string, _password?: string): Promise<AuthUser> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: _password || 'DemoPassword123!',
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('No user returned');

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (pError || !profile) throw new Error('Profile not found in database');

      let instId = profile.institution_id;
      let userRole = profile.role;

      if (!instId || !userRole) {
        const { data: membership } = await supabase
          .from('institution_memberships')
          .select('institution_id, role')
          .eq('profile_id', data.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (membership) {
          instId = instId || membership.institution_id;
          userRole = userRole || membership.role;
        }
      }

      const { data: institution } = instId
        ? await supabase.from('institutions').select('*').eq('id', instId).single()
        : { data: null };

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        role: userRole || 'school_admin',
        profile: { ...profile, institution_id: instId || DEMO_INSTITUTION.id, role: userRole || 'school_admin' },
        institution: institution || DEMO_INSTITUTION,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      return authUser;
    }

    // Match demo account by email
    const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (match) {
      const authUser = this.createDemoSession(match.id);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      return authUser;
    }

    throw new Error('Invalid credentials. Please select one of the provided Demo Accounts or verify your email.');
  },

  async loginAsDemo(demoId: string): Promise<AuthUser> {
    const authUser = this.createDemoSession(demoId);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
    return authUser;
  },

  createDemoSession(demoId: string): AuthUser {
    const account = DEMO_ACCOUNTS.find((a) => a.id === demoId) || DEMO_ACCOUNTS[0];
    const profile = DEMO_PROFILES[account.id] || {
      id: account.id,
      institution_id: DEMO_INSTITUTION.id,
      role: account.role,
      full_name: account.name,
      email: account.email,
      phone: '+91 98000 00000',
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isCollegeRole = ['college_admin', 'college_faculty', 'college_student'].includes(account.role);

    return {
      id: account.id,
      email: account.email,
      role: account.role,
      profile,
      institution: isCollegeRole ? DEMO_COLLEGE : DEMO_INSTITUTION,
    };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
    }
    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}.`,
    };
  },
};
