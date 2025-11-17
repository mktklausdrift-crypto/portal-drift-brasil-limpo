"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface Certificado {
  id: string;
  codigoVerificacao: string;
  dataEmissao: string;
  curso: {
    id: string;
    titulo: string;
    cargaHoraria: string;
    imagem?: string;
  };
}

export default function MeusCertificadosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadCertificados();
    }
  }, [status]);

  const loadCertificados = async () => {
    try {
      const res = await fetch('/api/certificados', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error("Erro ao carregar certificados");
      }

      const data = await res.json();
      setCertificados(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar certificados");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando certificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/cursos"
              className="text-white/80 hover:text-white transition"
            >
              ← Voltar
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-6xl">🏆</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Meus Certificados
              </h1>
              <p className="text-blue-100">
                {session?.user?.name || "Aluno"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {certificados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📜</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Nenhum certificado ainda
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Conclua um curso para ganhar seu certificado e adicionar à sua coleção!
            </p>
            <Link
              href="/cursos"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Ver Cursos Disponíveis
            </Link>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">
                      Total de Certificados
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {certificados.length}
                    </p>
                  </div>
                  <div className="text-5xl">📜</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">
                      Cursos Concluídos
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {certificados.length}
                    </p>
                  </div>
                  <div className="text-5xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">
                      Último Certificado
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(certificados[0].dataEmissao).toLocaleDateString('pt-BR', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-5xl">📅</div>
                </div>
              </div>
            </div>

            {/* Lista de Certificados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificados.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
                >
                  {/* Imagem do Curso */}
                  {cert.curso.imagem ? (
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                      <Image
                        src={cert.curso.imagem}
                        alt={cert.curso.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <div className="text-8xl">🎓</div>
                    </div>
                  )}

                  {/* Informações */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        ✓ Concluído
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(cert.dataEmissao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {cert.curso.titulo}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4">
                      ⏱️ {cert.curso.cargaHoraria}
                    </p>

                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <p className="text-xs text-gray-600 mb-1">
                        Código de Verificação
                      </p>
                      <p className="font-mono text-xs text-primary font-semibold">
                        {cert.codigoVerificacao}
                      </p>
                    </div>

                    {/* Ações */}
                    <Link
                      href={`/certificados/${cert.curso.id}`}
                      className="w-full block text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold"
                    >
                      Ver Certificado →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
