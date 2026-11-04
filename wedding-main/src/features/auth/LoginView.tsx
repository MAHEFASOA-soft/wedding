
import React, { FormEvent, useState } from 'react';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { clearPaginationCaches } from '../../components/paginationCache';

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin: string | null;
  };
}

export default function LoginView() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    const result = await api.post<AuthResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (!result?.user) {
      setError('Email ou mot de passe incorrect, ou compte désactivé.');
      return;
    }

    clearPaginationCaches();
    const authData = { authenticated: true, ...result.user };
    if (rememberMe) {
      localStorage.setItem('admin_auth', JSON.stringify(authData));
      sessionStorage.removeItem('admin_auth');
    } else {
      sessionStorage.setItem('admin_auth', JSON.stringify(authData));
      localStorage.removeItem('admin_auth');
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="grid lg:grid-cols-2">

          {/* ========================= */}
          {/* LEFT : BRANDING */}
          {/* ========================= */}

          <div className="hidden lg:flex relative bg-slate-950 text-white p-10 flex-col justify-between overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Heart
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                  />
                </div>

                <div>
                  <h1 className="font-bold text-lg">
                    Efficiency Wedding
                  </h1>

                  <p className="text-xs text-slate-400">
                    Madagascar
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-md">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-amber-300 mb-5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Espace administrateur
              </span>

              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                Gérez vos événements
                <span className="block text-amber-400">
                  en toute simplicité.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-6 text-slate-400">
                Centralisez vos événements, clients, prestations,
                équipes, factures et finances depuis une seule
                plateforme de gestion.
              </p>
            </div>

            <div className="relative z-10">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Efficiency Wedding Madagascar
              </p>
            </div>
          </div>

          {/* ========================= */}
          {/* RIGHT : LOGIN */}
          {/* ========================= */}

          <div className="p-6 sm:p-10 lg:p-12 flex items-center">
            <div className="w-full max-w-md mx-auto">

              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Heart
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                  />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Efficiency Wedding
                  </p>

                  <p className="text-xs text-slate-500">
                    Madagascar
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2">
                  Administration
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Bienvenue
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Connectez-vous à votre espace administrateur.
                </p >
                <p className="mt-2 text-sm text-amber-600">DEMO: miora@efficiencywedding.mg / 12345678</p>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-slate-700"
                  >
                    Adresse email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@efficiencywedding.mg"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/10 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Mot de passe
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-amber-600 hover:text-amber-700"
                      onClick={() =>
                        alert(
                          'Contactez l’administrateur système pour réinitialiser votre mot de passe.'
                        )
                      }
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-11 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/10 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={
                        showPassword
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />

                  <span className="text-sm text-slate-600">
                    Se souvenir de moi
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security information */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />

                  <p className="text-xs leading-5 text-slate-500">
                    Cet espace est réservé aux administrateurs autorisés.
                    Vos informations de connexion sont protégées.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
