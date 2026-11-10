export interface Project {
  id: string;
  name: string;
  path: string;
}

const STORAGE_KEY = "boardry.projects";

function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;
  const project = value as Partial<Project>;
  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.path === "string"
  );
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isProject) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function newProject(path: string): Project {
  const trimmed = path.replace(/\/+$/, "");
  const name = trimmed.split("/").pop() || trimmed;
  return { id: makeId(), name, path: trimmed };
}
