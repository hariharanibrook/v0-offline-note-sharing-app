import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByEmail, User } from './db';

const SALT_ROUNDS = 10;
const SESSION_KEY = 'auth_session';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setSession(session: AuthSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getSession(): AuthSession | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthSession> {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();

  const user: User = {
    id: userId,
    email,
    passwordHash,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await createUser(user);

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  setSession(session);
  return session;
}

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  setSession(session);
  return session;
}

export function logoutUser(): void {
  clearSession();
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
