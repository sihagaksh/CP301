// ============================================================
// lib/db/users.ts
// User-related database queries
// ============================================================

import { db } from './client';
import type { User } from '@/lib/types';

// Shared select columns — includes org-account fields added in migration 038
const USER_SELECT = `
  id, email, full_name, role, status,
  department, branch, batch, enrollment_number, employee_id,
  designation, current_organization, current_position,
  phone_number, bio, linkedin_url, profile_picture_url,
  is_verified, is_admin, is_org_account, linked_org_id,
  created_at, updated_at
`;

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .select(USER_SELECT)
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getUserById] ${error.message}`);
  }

  return data ? mapUser(data) : null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .select(USER_SELECT)
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getUserByEmail] ${error.message}`);
  }

  return data ? mapUser(data) : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .update({
      full_name: updates.fullName,
      department: updates.department,
      branch: updates.branch,
      batch: updates.batch,
      enrollment_number: updates.enrollmentNumber,
      employee_id: updates.employeeId,
      designation: updates.designation,
      current_organization: updates.currentOrganization,
      current_position: updates.currentPosition,
      phone_number: updates.phoneNumber,
      bio: updates.bio,
      linkedin_url: updates.linkedinUrl,
      profile_picture_url: updates.profilePictureUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select(USER_SELECT)
    .single();

  if (error) throw new Error(`[updateUserProfile] ${error.message}`);
  return data ? mapUser(data) : null;
}

// ========================
// ADMIN FUNCTIONS
// ========================

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await db
    .from('users')
    .select(USER_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`[getAllUsers] ${error.message}`);
  return data ? data.map(mapUser) : [];
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(userId: string, role: string, isAdmin: boolean): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .update({
      role,
      is_admin: isAdmin,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select(USER_SELECT)
    .single();

  if (error) throw new Error(`[updateUserRole] ${error.message}`);
  return data ? mapUser(data) : null;
}

/**
 * Update user status (Admin only)
 */
export async function updateUserStatus(userId: string, status: string): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select(USER_SELECT)
    .single();

  if (error) throw new Error(`[updateUserStatus] ${error.message}`);
  return data ? mapUser(data) : null;
}

/**
 * Map database row to User type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    status: row.status,
    department: row.department,
    branch: row.branch,
    batch: row.batch,
    enrollmentNumber: row.enrollment_number,
    employeeId: row.employee_id,
    designation: row.designation,
    currentOrganization: row.current_organization,
    currentPosition: row.current_position,
    phoneNumber: row.phone_number,
    bio: row.bio,
    linkedinUrl: row.linkedin_url,
    profilePictureUrl: row.profile_picture_url,
    isVerified: row.is_verified,
    isAdmin: row.is_admin,
    isOrgAccount: row.is_org_account ?? false,
    linkedOrgId: row.linked_org_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
