
"use client";
import { useEffect, useState, Suspense } from "react";
import { getProviders, signIn, getCsrfToken } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ClientSafeProvider } from "next-auth/react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  useEffect(() => {
    setIsClient(true);
    getProviders().then(setProviders);
    getCsrfToken().then(token => setCsrfToken(token || ""));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha inválidos");
        setLoading(false);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError("Erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-blue-50 to-primary/5">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2 text-gray-900">Entrar no Portal</h1>
          <p className="text-gray-600">Acesse seus cursos online EAD</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {isClient && providers && providers.credentials && (
          <form className="space-y-6 mb-6" onSubmit={handleSubmit}>
            <input name="csrfToken" type="hidden" value={csrfToken} />
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Sua senha"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-red-600 text-white rounded-xl hover:from-primary-hover hover:to-red-700 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        {!isClient && (
          <div className="space-y-6 mb-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        )}

        {isClient && providers && Object.values(providers).filter((p) => p.id !== "credentials").map((provider) => (
          <div key={provider.name} className="mb-4">
            <button
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary-dark transition"
              onClick={() => signIn(provider.id, { callbackUrl })}
              disabled={loading}
            >
              Entrar com {provider.name}
            </button>
          </div>
        ))}

        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-gray-600 mb-4">
            Ainda não tem uma conta?
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors duration-300"
          >
            <span>📝</span>
            <span>Criar Conta</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const SignInPage = () => (
  <Suspense>
    <SignInContent />
  </Suspense>
);

export default SignInPage;
