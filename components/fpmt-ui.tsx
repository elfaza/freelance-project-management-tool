"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

type Role = "freelancer" | "client";
type ThemeChoice = "light" | "dark" | "system";
type TaskStatus = "todo" | "in_progress" | "review" | "done";
type TaskType = "feature" | "change_request";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  theme?: ThemeChoice;
};

type Member = {
  id?: string;
  role: Role;
  user?: Pick<User, "id" | "name" | "email" | "role">;
};

type ActivityLog = {
  id: string;
  action: string;
  createdAt: string;
  user?: { name: string } | null;
  metadata?: Record<string, unknown> | null;
};

type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  type: TaskType;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { id: string; name: string; role: Role };
  _count?: { comments?: number; submissions?: number; attachments?: number };
  submissions?: Submission[];
  comments?: CommentItem[];
  attachments?: Attachment[];
  activityLogs?: ActivityLog[];
};

type Project = {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  updatedAt?: string;
  members?: Member[];
  tasks?: Task[];
  _count?: { tasks?: number };
  activityLogs?: ActivityLog[];
};

type Submission = {
  id: string;
  taskId?: string;
  version: number;
  notes?: string | null;
  createdAt?: string;
  submittedBy?: { id: string; name: string };
  attachments?: Attachment[];
  review?: Review | null;
};

type Review = {
  id: string;
  decision: "approved" | "revision_requested";
  feedback?: string | null;
  createdAt?: string;
};

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  user?: { name: string; role: Role };
};

type Attachment = {
  id: string;
  fileName: string;
  fileUrl?: string;
  fileSize: number;
  fileType: string;
  createdAt?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
  referenceType?: string | null;
  referenceId?: string | null;
};

type ApiEnvelope<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error?: { code: string; details?: unknown } };

const statuses: TaskStatus[] = ["todo", "in_progress", "review", "done"];

const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  review: "Review",
  done: "Done",
};

const statusClasses: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  review: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
};

const typeClasses: Record<TaskType, string> = {
  feature: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
  change_request: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers:
      init?.body instanceof FormData
        ? init.headers
        : { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed.");
  }
  return payload.data;
}

function formatDate(value?: string | null) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function formatBytes(value?: number) {
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function useSession(required = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: User }>("/api/v1/auth/me")
      .then(({ user }) => {
        setUser(user);
        applyTheme(user.theme ?? "system");
      })
      .catch(() => {
        if (required) router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [required, router]);

  return { user, setUser, loading };
}

function applyTheme(theme: ThemeChoice) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fpmt-theme", theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
}

function isDarkTheme(theme: ThemeChoice) {
  if (typeof window === "undefined") return theme === "dark";
  return theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function nextToggleTheme(theme: ThemeChoice): Exclude<ThemeChoice, "system"> {
  return isDarkTheme(theme) ? "light" : "dark";
}

function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
}) {
  return (
    <button
      className={classNames(
        "inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        variant === "danger" && "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950",
        variant === "success" && "bg-emerald-600 text-white hover:bg-emerald-700",
        variant === "warning" &&
          "border border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
      {...props}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
      {...props}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
      {...props}
    />
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <span className="mt-1 block">{children}</span>
      {error ? <span className="mt-1 block text-sm text-red-600 dark:text-red-300">{error}</span> : null}
    </label>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={classNames(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      {children}
    </section>
  );
}

function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={classNames("inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card className="text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" key={item} />
      ))}
    </div>
  );
}

function Alert({ message, tone = "error" }: { message?: string; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <div
      className={classNames(
        "rounded-md border px-3 py-2 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
      )}
    >
      {message}
    </div>
  );
}

function ThemeToggle({ user, onChange }: { user?: User | null; onChange?: (theme: ThemeChoice) => void }) {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    if (typeof window === "undefined") return user?.theme ?? "system";
    return (localStorage.getItem("fpmt-theme") as ThemeChoice | null) ?? user?.theme ?? "system";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  async function choose(nextTheme: ThemeChoice) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    onChange?.(nextTheme);
    try {
      if (user) await api<{ user: Pick<User, "id" | "theme"> }>("/api/v1/users/me/preferences", {
        method: "PATCH",
        body: JSON.stringify({ theme: nextTheme }),
      });
    } catch {
      // Local theme still applies if preference persistence is temporarily unavailable.
    }
  }

  return (
    <button
      aria-label={`Switch to ${nextToggleTheme(theme)} theme.`}
      className="relative inline-flex h-11 w-[74px] items-center rounded-full border border-slate-300 bg-slate-100 p-1 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
      onClick={() => choose(nextToggleTheme(theme))}
      title={`Switch to ${nextToggleTheme(theme)} theme`}
      type="button"
    >
      <span
        aria-hidden="true"
        className={classNames(
          "grid h-9 w-9 place-items-center rounded-full bg-white text-base shadow-sm transition-transform dark:bg-slate-950",
          isDarkTheme(theme) && "translate-x-7",
        )}
      >
        {isDarkTheme(theme) ? "D" : "L"}
      </span>
    </button>
  );
}

function AppShell({ children, user, title, context }: { children: ReactNode; user: User; title: string; context?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/notifications", label: "Notifications" },
  ];

  async function logout() {
    await api<Record<string, never>>("/api/v1/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <Link className="flex items-center gap-3" href="/dashboard">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">FP</div>
            <div>
              <p className="text-sm font-semibold">FPMT</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Project workspace</p>
            </div>
          </Link>
          <nav className="mt-8 space-y-1 text-sm font-medium">
            {nav.map((item) => (
              <Link
                className={classNames(
                  "flex min-h-11 items-center rounded-md px-3",
                  pathname.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{context ?? `${user.name} - ${user.role}`}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal">{title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle user={user} />
                <Link className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" href="/notifications">
                  Notifications
                </Link>
                <Button onClick={logout} type="button" variant="secondary">
                  Logout
                </Button>
              </div>
            </div>
            <nav className="mx-auto mt-3 flex max-w-7xl gap-1 overflow-x-auto text-sm font-semibold lg:hidden">
              {nav.map((item) => (
                <Link
                  className={classNames(
                    "inline-flex min-h-10 items-center rounded-md px-3",
                    pathname.startsWith(item.href)
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                      : "text-slate-600 dark:text-slate-300",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

function AuthLayout({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">FP</div>
          <div>
            <p className="font-semibold">FPMT</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Freelancer project management</p>
          </div>
        </div>
        <Card>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </main>
  );
}

export function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await api<{ user: User }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      applyTheme(user.theme ?? "system");
      const next = search.get("next");
      router.replace(next || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Log in" body="Access projects, reviews, comments, and notifications.">
      <form className="space-y-4" onSubmit={submit}>
        <Alert message={error} />
        <Field label="Email">
          <Input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </Field>
        <Field label="Password">
          <Input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        </Field>
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{" "}
        <Link className="font-semibold text-blue-600 dark:text-blue-300" href={`/register${search.get("next") ? `?next=${encodeURIComponent(search.get("next") ?? "")}` : ""}`}>
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "freelancer" as Role });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api<{ user: User }>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.replace(`/login${search.get("next") ? `?next=${encodeURIComponent(search.get("next") ?? "")}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create account" body="Choose the role you will use for project collaboration.">
      <form className="space-y-4" onSubmit={submit}>
        <Alert message={error} />
        <Field label="Name">
          <Input onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
        </Field>
        <Field label="Email">
          <Input autoComplete="email" onChange={(event) => setForm({ ...form, email: event.target.value })} required type="email" value={form.email} />
        </Field>
        <Field label="Password">
          <Input autoComplete="new-password" minLength={8} onChange={(event) => setForm({ ...form, password: event.target.value })} required type="password" value={form.password} />
        </Field>
        <Field label="Role">
          <div className="grid grid-cols-2 rounded-md bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800">
            {(["freelancer", "client"] as Role[]).map((role) => (
              <button
                className={classNames(
                  "min-h-11 rounded capitalize",
                  form.role === role ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400",
                )}
                key={role}
                onClick={() => setForm({ ...form, role })}
                type="button"
              >
                {role}
              </button>
            ))}
          </div>
        </Field>
        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Creating..." : "Register"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
        Already registered?{" "}
        <Link className="font-semibold text-blue-600 dark:text-blue-300" href="/login">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    setLoading(true);
    api<{ projects: Project[] }>("/api/v1/projects")
      .then(({ projects }) => {
        setProjects(projects);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Projects could not load."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    queueMicrotask(refresh);
  }, [refresh]);
  return { projects, loading, error, refresh };
}

function ProjectForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", start_date: "", end_date: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api<{ project: Project }>("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({ ...form, end_date: form.end_date || null }),
      });
      setForm({ name: "", description: "", start_date: "", end_date: "" });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Project could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} type="button">
        Create project
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">New project</h2>
        <Button onClick={() => setOpen(false)} type="button" variant="ghost">
          Close
        </Button>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <div className="md:col-span-2">
          <Alert message={error} />
        </div>
        <Field label="Name">
          <Input onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
        </Field>
        <Field label="Start date">
          <Input onChange={(event) => setForm({ ...form, start_date: event.target.value })} required type="date" value={form.start_date} />
        </Field>
        <Field label="End date">
          <Input onChange={(event) => setForm({ ...form, end_date: event.target.value })} type="date" value={form.end_date} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <Textarea onChange={(event) => setForm({ ...form, description: event.target.value })} value={form.description} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Button disabled={saving} type="submit">
            {saving ? "Saving..." : "Save project"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const taskCount = project._count?.tasks ?? project.tasks?.length ?? 0;
  const done = project.tasks?.filter((task) => task.status === "done").length ?? 0;
  const progress = taskCount ? Math.round((done / taskCount) * 100) : 0;

  return (
    <Link className="block" href={`/projects/${project.id}`}>
      <Card className="h-full hover:border-blue-300 dark:hover:border-blue-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{project.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {project.description || "No description yet."}
            </p>
          </div>
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{taskCount} tasks</Badge>
        </div>
        <div className="mt-5 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : "Open"}</span>
          <span>Updated {formatDate(project.updatedAt)}</span>
        </div>
      </Card>
    </Link>
  );
}

export function DashboardPage() {
  const { user, loading: sessionLoading } = useSession();
  const { projects, loading, error, refresh } = useProjects();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api<{ notifications: NotificationItem[] }>("/api/v1/notifications")
      .then(({ notifications }) => setNotifications(notifications))
      .catch(() => setNotifications([]));
  }, []);

  if (sessionLoading || !user) return <main className="p-6"><SkeletonRows /></main>;

  const tasks = projects.flatMap((project) => project.tasks ?? []);
  const unread = notifications.filter((item) => !item.readAt && !item.isRead).length;

  return (
    <AppShell user={user} title="Dashboard">
      <div className="space-y-6">
        {user.role === "freelancer" ? <ProjectForm onCreated={refresh} /> : null}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Projects" value={projects.length} detail={user.role === "freelancer" ? "Created or joined" : "Joined projects"} />
          <Stat label="Tasks" value={tasks.length} detail={`${tasks.filter((task) => task.status === "review").length} in review`} />
          <Stat label="Done" value={tasks.filter((task) => task.status === "done").length} detail="Completed tasks" />
          <Stat label="Unread" value={unread} detail="Notifications" />
        </section>
        <Alert message={error} />
        {loading ? <SkeletonRows /> : projects.length ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Recent projects</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">A quick read on active work.</p>
                </div>
                <Link className="text-sm font-semibold text-blue-600 dark:text-blue-300" href="/projects">View all</Link>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {projects.slice(0, 4).map((project) => <ProjectCard key={project.id} project={project} />)}
              </div>
            </section>
            <aside className="space-y-6">
              <RecentTasks tasks={tasks.slice(0, 6)} />
              <NotificationList notifications={notifications.slice(0, 4)} compact />
            </aside>
          </div>
        ) : (
          <EmptyState
            title={user.role === "freelancer" ? "Create your first project" : "No projects yet"}
            body={user.role === "freelancer" ? "Create a project, generate an invite, then start tracking tasks and submissions." : "Projects will appear after you accept a freelancer invitation."}
            action={user.role === "freelancer" ? <ProjectForm onCreated={refresh} /> : <Link className="font-semibold text-blue-600 dark:text-blue-300" href="/invite">Accept invitation</Link>}
          />
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-right text-sm text-slate-500 dark:text-slate-400">{detail}</p>
      </div>
    </Card>
  );
}

function RecentTasks({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">Recent tasks</h2>
      <div className="mt-4 space-y-3">
        {tasks.length ? tasks.map((task) => (
          <Link className="block rounded-md border border-slate-200 p-3 hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-800" href={`/tasks/${task.id}`} key={task.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">{task.title}</p>
              <Badge className={statusClasses[task.status]}>{statusLabels[task.status]}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Due {formatDate(task.dueDate)}</p>
          </Link>
        )) : <p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet.</p>}
      </div>
    </Card>
  );
}

export function ProjectsPage() {
  const { user, loading: sessionLoading } = useSession();
  const { projects, loading, error, refresh } = useProjects();

  if (sessionLoading || !user) return <main className="p-6"><SkeletonRows /></main>;

  return (
    <AppShell user={user} title="Projects">
      <div className="space-y-6">
        {user.role === "freelancer" ? <ProjectForm onCreated={refresh} /> : null}
        <Alert message={error} />
        {loading ? <SkeletonRows /> : projects.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            body={user.role === "freelancer" ? "Create a project to invite a client and begin task tracking." : "Ask your freelancer for an invite link, then accept it here."}
            action={user.role === "client" ? <Link className="font-semibold text-blue-600 dark:text-blue-300" href="/invite">Accept invitation</Link> : undefined}
          />
        )}
      </div>
    </AppShell>
  );
}

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { user, loading: sessionLoading } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState("");

  const refresh = useCallback(() => {
    setLoading(true);
    api<{ project: Project }>(`/api/v1/projects/${projectId}`)
      .then(({ project }) => {
        setProject(project);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Project could not load."))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    queueMicrotask(refresh);
  }, [refresh]);

  async function generateInvite() {
    setError("");
    try {
      const data = await api<{ invite_link: string }>(`/api/v1/projects/${projectId}/invite`, { method: "POST" });
      setInvite(data.invite_link);
      await navigator.clipboard?.writeText(data.invite_link).catch(() => undefined);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invitation could not be generated.");
    }
  }

  if (sessionLoading || !user) return <main className="p-6"><SkeletonRows /></main>;

  return (
    <AppShell user={user} title={project?.name ?? "Project"} context={project ? `${formatDate(project.startDate)} - ${project.endDate ? formatDate(project.endDate) : "Open"}` : undefined}>
      <Alert message={error} />
      {loading ? <SkeletonRows /> : project ? (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{project.description || "No project description yet."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.members?.map((member) => (
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" key={member.user?.id ?? member.id}>
                      {member.user?.name ?? "Member"} - {member.role}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                {user.role === "freelancer" ? <Button onClick={generateInvite} type="button" variant="secondary">Generate invite</Button> : null}
                <TaskForm projectId={project.id} role={user.role} onCreated={refresh} />
              </div>
            </div>
            {invite ? (
              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
                Invitation copied: <span className="break-all font-semibold">{invite}</span>
              </div>
            ) : null}
          </Card>
          <TaskBoard tasks={project.tasks ?? []} user={user} onChanged={refresh} />
          <ActivityTimeline logs={project.activityLogs ?? []} />
        </div>
      ) : (
        <EmptyState title="Project unavailable" body="This project could not be loaded or you do not have access." />
      )}
    </AppShell>
  );
}

function TaskForm({ projectId, role, onCreated }: { projectId: string; role: Role; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_date: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api<{ task: Task }>("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({ project_id: projectId, ...form, due_date: form.due_date || null }),
      });
      setForm({ title: "", description: "", due_date: "" });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Task could not be created.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return <Button onClick={() => setOpen(true)} type="button">{role === "freelancer" ? "Create feature task" : "Create change request"}</Button>;

  return (
    <Card className="w-full lg:w-[28rem]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">New task</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Type will be {role === "freelancer" ? "feature" : "change request"}.</p>
        </div>
        <Button onClick={() => setOpen(false)} type="button" variant="ghost">Close</Button>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Alert message={error} />
        <Field label="Title"><Input onChange={(event) => setForm({ ...form, title: event.target.value })} required value={form.title} /></Field>
        <Field label="Due date"><Input onChange={(event) => setForm({ ...form, due_date: event.target.value })} type="date" value={form.due_date} /></Field>
        <Field label="Description"><Textarea onChange={(event) => setForm({ ...form, description: event.target.value })} value={form.description} /></Field>
        <Button disabled={saving} type="submit">{saving ? "Saving..." : "Save task"}</Button>
      </form>
    </Card>
  );
}

function TaskBoard({ tasks, user, onChanged }: { tasks: Task[]; user: User; onChanged: () => void }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={status}>
            <div className="mb-4 flex items-center justify-between">
              <Badge className={statusClasses[status]}>{statusLabels[status]}</Badge>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{columnTasks.length}</span>
            </div>
            <div className="space-y-3">
              {columnTasks.length ? columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} user={user} onChanged={onChanged} />
              )) : <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No tasks.</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function TaskCard({ task, user, onChanged }: { task: Task; user: User; onChanged: () => void }) {
  async function updateStatus(status: TaskStatus) {
    await api<{ task: Task }>(`/api/v1/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    onChanged();
  }

  async function removeTask() {
    if (!confirm(`Delete ${task.title}?`)) return;
    await api<Record<string, never>>(`/api/v1/tasks/${task.id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <article className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <Link className="block" href={`/tasks/${task.id}`}>
        <h3 className="text-sm font-semibold leading-6">{task.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className={typeClasses[task.type]}>{task.type === "feature" ? "Feature" : "Change request"}</Badge>
          <Badge className={statusClasses[task.status]}>{statusLabels[task.status]}</Badge>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Due {formatDate(task.dueDate)}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Created by {task.createdBy?.name ?? "Unknown"}</p>
      </Link>
      {user.role === "freelancer" ? (
        <div className="mt-3 flex flex-col gap-2">
          <Select aria-label="Update status" onChange={(event) => updateStatus(event.target.value as TaskStatus)} value={task.status}>
            {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </Select>
          <Button onClick={removeTask} type="button" variant="danger">Delete</Button>
        </div>
      ) : null}
    </article>
  );
}

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const { user, loading: sessionLoading } = useSession();
  const [task, setTask] = useState<Task | null>(null);
  const [membership, setMembership] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    setLoading(true);
    api<{ task: Task; membership: Member }>(`/api/v1/tasks/${taskId}`)
      .then(({ task, membership }) => {
        setTask(task);
        setMembership(membership);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Task could not load."))
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    queueMicrotask(refresh);
  }, [refresh]);

  if (sessionLoading || !user) return <main className="p-6"><SkeletonRows /></main>;
  const role = membership?.role ?? user.role;

  return (
    <AppShell user={user} title={task?.title ?? "Task detail"} context={task ? `${statusLabels[task.status]} - ${task.type === "feature" ? "Feature" : "Change request"}` : undefined}>
      <Alert message={error} />
      {loading ? <SkeletonRows /> : task ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusClasses[task.status]}>{statusLabels[task.status]}</Badge>
                <Badge className={typeClasses[task.type]}>{task.type === "feature" ? "Feature" : "Change request"}</Badge>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{task.description || "No description."}</p>
            </Card>
            {role === "freelancer" ? <SubmissionForm taskId={task.id} onChanged={refresh} /> : null}
            <SubmissionHistory submissions={task.submissions ?? []} />
            {role === "client" && task.status === "review" ? <ReviewPanel submissions={task.submissions ?? []} onChanged={refresh} /> : null}
            <CommentThread taskId={task.id} comments={task.comments ?? []} onChanged={refresh} />
            <ActivityTimeline logs={task.activityLogs ?? []} />
          </div>
          <aside className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold">Metadata</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">Due</dt><dd>{formatDate(task.dueDate)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">Creator</dt><dd>{task.createdBy?.name ?? "Unknown"}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500 dark:text-slate-400">Submissions</dt><dd>{task.submissions?.length ?? 0}</dd></div>
              </dl>
            </Card>
            {role === "freelancer" ? <TaskStatusPanel task={task} onChanged={refresh} /> : null}
            <AttachmentPanel task={task} onChanged={refresh} />
          </aside>
        </div>
      ) : (
        <EmptyState title="Task unavailable" body="This task could not be loaded or you do not have access." />
      )}
    </AppShell>
  );
}

function TaskStatusPanel({ task, onChanged }: { task: Task; onChanged: () => void }) {
  async function updateStatus(status: TaskStatus) {
    await api<{ task: Task }>(`/api/v1/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    onChanged();
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Workflow</h2>
      <div className="mt-4">
        <Field label="Status">
          <Select onChange={(event) => updateStatus(event.target.value as TaskStatus)} value={task.status}>
            {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </Select>
        </Field>
      </div>
    </Card>
  );
}

function SubmissionForm({ taskId, onChanged }: { taskId: string; onChanged: () => void }) {
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { submission } = await api<{ submission: Submission; task: Task }>(`/api/v1/tasks/${taskId}/submissions`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      });
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await api<{ attachment: Attachment }>(`/api/v1/submissions/${submission.id}/attachments`, { method: "POST", body: formData });
      }
      setNotes("");
      setFile(null);
      setMessage("Submission sent for review.");
      onChanged();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Submit work</h2>
      <form className="mt-4 space-y-4" onSubmit={submit}>
        <Alert message={message} tone={message.includes("sent") ? "success" : "error"} />
        <Field label="Notes"><Textarea onChange={(event) => setNotes(event.target.value)} value={notes} /></Field>
        <Field label="Submission attachment">
          <Input onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} type="file" />
        </Field>
        {file ? <p className="text-sm text-slate-500 dark:text-slate-400">Selected: {file.name}</p> : null}
        <Button disabled={saving} type="submit">{saving ? "Submitting..." : "Submit for review"}</Button>
      </form>
    </Card>
  );
}

function SubmissionHistory({ submissions }: { submissions: Submission[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">Submission history</h2>
      <div className="mt-4 space-y-3">
        {submissions.length ? submissions.map((submission) => (
          <article className="rounded-md border border-slate-200 p-4 dark:border-slate-800" key={submission.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Revision {submission.version}</h3>
              {submission.review ? <Badge className={submission.review.decision === "approved" ? statusClasses.done : statusClasses.in_progress}>{submission.review.decision === "approved" ? "Approved" : "Revision requested"}</Badge> : <Badge className={statusClasses.review}>Pending review</Badge>}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{submission.notes || "No notes."}</p>
            <AttachmentList attachments={submission.attachments ?? []} />
            {submission.review?.feedback ? <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">{submission.review.feedback}</p> : null}
          </article>
        )) : <p className="text-sm text-slate-500 dark:text-slate-400">No submissions yet.</p>}
      </div>
    </Card>
  );
}

function ReviewPanel({ submissions, onChanged }: { submissions: Submission[]; onChanged: () => void }) {
  const latest = [...submissions].reverse().find((submission) => !submission.review);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function review(decision: Review["decision"]) {
    if (!latest) return;
    setSaving(true);
    setError("");
    try {
      await api<{ review: Review; task: Task }>(`/api/v1/submissions/${latest.id}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, feedback }),
      });
      setFeedback("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!latest) return null;
  return (
    <Card>
      <h2 className="text-lg font-semibold">Review pending submission</h2>
      <div className="mt-4 space-y-4">
        <Alert message={error} />
        <Field label="Revision feedback">
          <Textarea onChange={(event) => setFeedback(event.target.value)} placeholder="Required for revision requests" value={feedback} />
        </Field>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button disabled={saving} onClick={() => review("approved")} type="button" variant="success">Approve</Button>
          <Button disabled={saving} onClick={() => review("revision_requested")} type="button" variant="warning">Request revision</Button>
        </div>
      </div>
    </Card>
  );
}

function CommentThread({ taskId, comments, onChanged }: { taskId: string; comments: CommentItem[]; onChanged: () => void }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api<{ comment: CommentItem }>(`/api/v1/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setContent("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comment failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Comments</h2>
      <div className="mt-4 space-y-3">
        {comments.length ? comments.map((comment) => (
          <article className="rounded-md border border-slate-200 p-4 dark:border-slate-800" key={comment.id}>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-semibold">{comment.user?.name ?? "Member"}</span>
              <span className="text-slate-500 dark:text-slate-400">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.content}</p>
          </article>
        )) : <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet.</p>}
      </div>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <Alert message={error} />
        <Field label="Add comment"><Textarea onChange={(event) => setContent(event.target.value)} required value={content} /></Field>
        <Button disabled={saving} type="submit">{saving ? "Sending..." : "Send comment"}</Button>
      </form>
    </Card>
  );
}

function AttachmentPanel({ task, onChanged }: { task: Task; onChanged: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api<{ attachment: Attachment }>(`/api/v1/tasks/${task.id}/attachments`, { method: "POST", body: formData });
      setFile(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Attachments</h2>
      <AttachmentList attachments={task.attachments ?? []} />
      <form className="mt-4 space-y-3" onSubmit={upload}>
        <Alert message={error} />
        <Field label="Upload task file">
          <Input onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} type="file" />
        </Field>
        <Button disabled={saving || !file} type="submit" variant="secondary">{saving ? "Uploading..." : "Upload"}</Button>
      </form>
    </Card>
  );
}

function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (!attachments.length) return <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No attachments.</p>;
  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => (
        <a className="block rounded-md border border-slate-200 p-3 text-sm hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-800" href={attachment.fileUrl || "#"} key={attachment.id}>
          <span className="font-semibold">{attachment.fileName}</span>
          <span className="mt-1 block text-slate-500 dark:text-slate-400">{attachment.fileType} - {formatBytes(attachment.fileSize)}</span>
        </a>
      ))}
    </div>
  );
}

function ActivityTimeline({ logs }: { logs: ActivityLog[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">Activity</h2>
      <div className="mt-4 space-y-4">
        {logs.length ? logs.map((log, index) => (
          <div className="flex gap-3" key={log.id}>
            <div className="flex flex-col items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              {index < logs.length - 1 ? <span className="mt-1 h-full min-h-8 w-px bg-slate-200 dark:bg-slate-800" /> : null}
            </div>
            <div>
              <p className="text-sm font-medium leading-6">{log.action.replaceAll("_", " ").toLowerCase()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{log.user?.name ?? "System"} - {formatDate(log.createdAt)}</p>
            </div>
          </div>
        )) : <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>}
      </div>
    </Card>
  );
}

function NotificationList({
  notifications,
  compact = false,
  onRead,
}: {
  notifications: NotificationItem[];
  compact?: boolean;
  onRead?: (notificationId: string) => void;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">Notifications</h2>
      <div className="mt-4 space-y-3">
        {notifications.length ? notifications.map((notification) => {
          const unread = !notification.readAt && !notification.isRead;
          const href = notification.referenceType === "project" && notification.referenceId
            ? `/projects/${notification.referenceId}`
            : notification.referenceType === "task" && notification.referenceId
              ? `/tasks/${notification.referenceId}`
              : undefined;
          const content = (
            <article className={classNames("rounded-md border p-4", unread ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950" : "border-slate-200 dark:border-slate-800")}>
              <div className="flex items-start gap-3">
                <span className={classNames("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", unread ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700")} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">{notification.title}</h3>
                  <p className={classNames("mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300", compact && "line-clamp-2")}>{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatDate(notification.createdAt)}</p>
                </div>
                {onRead && unread ? (
                  <Button className="min-h-9 px-3" onClick={() => onRead(notification.id)} type="button" variant="secondary">
                    Read
                  </Button>
                ) : null}
              </div>
              {onRead && href ? (
                <Link className="mt-3 inline-flex text-sm font-semibold text-blue-600 dark:text-blue-300" href={href}>
                  Open
                </Link>
              ) : null}
            </article>
          );
          return href && !onRead ? <Link className="block" href={href} key={notification.id}>{content}</Link> : <div key={notification.id}>{content}</div>;
        }) : <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>}
      </div>
    </Card>
  );
}

export function NotificationsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    setLoading(true);
    api<{ notifications: NotificationItem[] }>("/api/v1/notifications")
      .then(({ notifications }) => setNotifications(notifications))
      .catch((err) => setError(err instanceof Error ? err.message : "Notifications could not load."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    queueMicrotask(refresh);
  }, [refresh]);

  async function markRead(notificationId: string) {
    await api<{ notification: NotificationItem }>(`/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
    refresh();
  }

  if (sessionLoading || !user) return <main className="p-6"><SkeletonRows /></main>;

  return (
    <AppShell user={user} title="Notifications">
      <div className="space-y-4">
        <Alert message={error} />
        {loading ? <SkeletonRows /> : <NotificationList notifications={notifications} onRead={markRead} />}
      </div>
    </AppShell>
  );
}

export function InvitePage({ token }: { token?: string }) {
  const { user, loading: sessionLoading } = useSession(false);
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const resolvedToken = token ?? (typeof params?.token === "string" ? params.token : search.get("token") ?? "");
  const [manualToken, setManualToken] = useState(resolvedToken);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function accept(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(`/invite/${manualToken}`)}`);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const { project } = await api<{ project: Project }>("/api/v1/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token: manualToken }),
      });
      router.replace(`/projects/${project.id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Invitation could not be accepted.");
    } finally {
      setLoading(false);
    }
  }

  if (sessionLoading) return <main className="p-6"><SkeletonRows /></main>;

  return (
    <AuthLayout title="Accept invitation" body="Join a project as a client after signing in with a client account.">
      <form className="space-y-4" onSubmit={accept}>
        <Alert message={message} />
        {!user ? (
          <Alert message="You need to log in or register before accepting an invitation." tone="success" />
        ) : user.role !== "client" ? (
          <Alert message="Only client accounts can accept project invitations." />
        ) : null}
        <Field label="Invitation token">
          <Input onChange={(event) => setManualToken(event.target.value)} required value={manualToken} />
        </Field>
        <Button className="w-full" disabled={loading || user?.role === "freelancer"} type="submit">
          {!user ? "Login to accept" : loading ? "Accepting..." : "Accept invitation"}
        </Button>
      </form>
      {!user ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" href={`/login?next=${encodeURIComponent(`/invite/${manualToken}`)}`}>Login</Link>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700" href={`/register?next=${encodeURIComponent(`/invite/${manualToken}`)}`}>Register</Link>
        </div>
      ) : null}
    </AuthLayout>
  );
}
