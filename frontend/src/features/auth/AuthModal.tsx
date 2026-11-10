import { useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, Sprout, X } from "lucide-react";
import { authenticate, type Farmer } from "../../api";
import { copy, type Language } from "../../i18n/copy";

interface AuthModalProps {
  language: Language;
  onClose: () => void;
  onSuccess: (farmer: Farmer) => void;
}

export function AuthModal({ language, onClose, onSuccess }: AuthModalProps) {
  const t = copy[language];
  const [mode, setMode] = useState<"login" | "register">("register");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, String(value)]),
    );
    fields.preferred_language = language;
    try {
      const farmer = await authenticate(mode, fields);
      onSuccess(farmer);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-heading"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-2xl bg-leaf-50 p-3 text-leaf-600">
              <Sprout size={23} />
            </div>
            <h2 id="auth-heading" className="text-2xl font-bold">
              {t.authTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t.authSub}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setMode("register")}
            className={`rounded-lg py-2 text-sm font-semibold ${mode === "register" ? "bg-white text-leaf-700 shadow-sm" : "text-slate-500"}`}
          >
            {t.join}
          </button>
          <button
            onClick={() => setMode("login")}
            className={`rounded-lg py-2 text-sm font-semibold ${mode === "login" ? "bg-white text-leaf-700 shadow-sm" : "text-slate-500"}`}
          >
            {t.signIn}
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                {t.name}
                <input
                  required
                  name="name"
                  minLength={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-50"
                  placeholder="Rahim Uddin"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {t.district}
                <input
                  name="location"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-50"
                  placeholder="Rangpur"
                />
              </label>
            </>
          )}
          <label className="block text-sm font-semibold text-slate-700">
            {t.phone}
            <input
              required
              name="phone_number"
              autoComplete="tel"
              minLength={6}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-50"
              placeholder="01XXXXXXXXX"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            {t.password}
            <input
              required
              name="password"
              type="password"
              minLength={mode === "register" ? 8 : undefined}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-50"
              placeholder="••••••••"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-leaf-600 py-3.5 font-semibold text-white transition hover:bg-leaf-700 disabled:opacity-60"
          >
            {loading && <LoaderCircle size={17} className="animate-spin" />}
            {mode === "register" ? t.register : t.login}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-slate-400">
          Your account details are protected and never shown publicly.
        </p>
      </div>
    </div>
  );
}
