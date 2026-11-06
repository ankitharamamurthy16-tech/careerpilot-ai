// Auth service. Currently stores the student on this device only.
// Swap these functions for a real backend later — the screens only call this API.
export type Student = {
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
};

const KEY = "cp_student";
const USERS = "cp_users";

type Stored = Student & { password: string };

function readUsers(): Stored[] {
  try {
    return JSON.parse(localStorage.getItem(USERS) || "[]");
  } catch {
    return [];
  }
}

export function getStudent(): Student | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export async function register(data: Student & { password: string }): Promise<Student> {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase()))
    throw new Error("An account with this email already exists.");
  users.push(data);
  localStorage.setItem(USERS, JSON.stringify(users));
  const { password: _p, ...student } = data;
  localStorage.setItem(KEY, JSON.stringify(student));
  return student;
}

export async function login(email: string, password: string): Promise<Student> {
  const u = readUsers().find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u || u.password !== password) throw new Error("Incorrect email or password.");
  const { password: _p, ...student } = u;
  localStorage.setItem(KEY, JSON.stringify(student));
  return student;
}

export function loginDemo(): Student {
  const s: Student = {
    name: "Aarav Sharma",
    email: "aarav@student.edu",
    college: "RV College of Engineering",
    branch: "Computer Science",
    year: "3rd Year",
  };
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function logout() {
  localStorage.removeItem(KEY);
}
