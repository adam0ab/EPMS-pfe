import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/Field";

function loginErrorMessage(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { message?: string } } } | undefined)?.response;
  if (response?.status === 401) return "Invalid email or password.";
  if (response?.data?.message) return response.data.message;
  return "Unable to reach the EPMS server. Ensure the server is running on http://localhost:4000.";
}

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate("/dashboard") }
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-surface-dark">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-surface-card p-8 shadow-card dark:border-surface-dark-border dark:bg-surface-dark-card">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-white">
            E
          </div>
          <h1 className="text-xl font-bold text-secondary dark:text-white">EPMS</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ESPRIT Procedure Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            placeholder="you@esprit.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {login.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger dark:bg-red-500/10">
              {loginErrorMessage(login.error)}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Super Admin: admin@esprit.tn / Admin@12345
        </p>
      </div>
    </div>
  );
}
