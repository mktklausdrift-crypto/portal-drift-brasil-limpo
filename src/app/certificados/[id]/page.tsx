"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface Certificado {
  id: string;
  codigoVerificacao: string;
  dataEmissao: string;
  usuario: {
    name: string;
  };
  curso: {
    titulo: string;
    cargaHoraria: string;
    descricao: string;
  };
}

export default function CertificadoPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const cursoId = params.id as string;

  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerandoCertificado, setGerandoCertificado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadCertificado();
    }
  }, [status, cursoId]);

  const loadCertificado = async () => {
    try {
      const res = await fetch(`/api/certificados/${cursoId}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (res.status === 404) {
        // Certificado não existe, tentar gerar
        await gerarCertificado();
        return;
      }

      if (!res.ok) {
        throw new Error("Erro ao carregar certificado");
      }

      const data = await res.json();
      setCertificado(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar certificado");
    } finally {
      setLoading(false);
    }
  };

  const gerarCertificado = async () => {
    setGerandoCertificado(true);
    try {
      const res = await fetch(`/api/certificados/${cursoId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao gerar certificado");
      }

      // Recarregar certificado
      await loadCertificado();
    } catch (err: any) {
      setError(err.message || "Erro ao gerar certificado");
      setLoading(false);
    } finally {
      setGerandoCertificado(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarPDF = () => {
    window.print(); // O usuário pode usar "Salvar como PDF" na caixa de impressão
  };

  if (status === "loading" || loading || gerandoCertificado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {gerandoCertificado ? "Gerando certificado..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/cursos"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Voltar para Cursos
          </Link>
        </div>
      </div>
    );
  }

  if (!certificado) {
    return null;
  }

  const dataEmissao = new Date(certificado.dataEmissao);

  return (
    <>
      {/* Botões de Ação - Esconder na impressão */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/meus-certificados"
              className="text-gray-600 hover:text-primary transition"
            >
              ← Meus Certificados
            </Link>
            <div className="flex gap-3">
              <button
                onClick={handleImprimir}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={handleBaixarPDF}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                📄 Baixar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Certificado */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 print:py-0 print:bg-white flex items-center justify-center">
        <div className="w-full max-w-[297mm] mx-auto px-4 print:px-0">
          {/* Certificado Container - A4 Landscape */}
          <div className="bg-white rounded-none shadow-2xl overflow-hidden print:shadow-none aspect-[297/210]">
            {/* Border decorativa dupla */}
            <div className="border-[12px] border-double border-primary/30 h-full p-6 md:p-8 relative">
              {/* Cantos decorativos */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-primary/40"></div>
              <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-primary/40"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-primary/40"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-primary/40"></div>

              {/* Header com Logo */}
              <div className="text-center mb-6">
                {/* Logo da Empresa */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="relative w-24 h-24">
                    <Image
                      src="/logo-drift-brasil.png"
                      alt="Klaus Drift Brasil"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl font-bold text-primary leading-tight">
                      KLAUS DRIFT BRASIL
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">
                      Excelência Automotiva
                    </p>
                  </div>
                </div>
                
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mb-4"></div>
                
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-1">
                  CERTIFICADO
                </h1>
                <p className="text-base text-gray-600">
                  de Conclusão de Curso
                </p>
              </div>

              {/* Corpo do Certificado */}
              <div className="my-8 text-center space-y-4">
                <p className="text-base text-gray-700">
                  Certificamos que
                </p>
                
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4 px-4 py-2 border-b-2 border-primary/30 inline-block">
                  {certificado.usuario.name || session?.user?.name || "Aluno"}
                </h2>

                <p className="text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  concluiu com êxito o curso
                </p>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  "{certificado.curso.titulo}"
                </h3>

                <p className="text-gray-700">
                  com carga horária de{" "}
                  <span className="font-bold text-primary text-lg">
                    {certificado.curso.cargaHoraria}
                  </span>
                </p>

                <div className="pt-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Data de Conclusão
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    {dataEmissao.toLocaleDateString('pt-BR', { 
                      day: '2-digit',
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <div className="grid grid-cols-2 gap-8 mb-4">
                  {/* Assinatura */}
                  <div className="text-center">
                    <div className="mb-8"></div>
                    <div className="border-t-2 border-gray-800 w-56 mx-auto mb-2"></div>
                    <p className="font-bold text-gray-900 text-sm">
                      Klaus Drift Brasil
                    </p>
                    <p className="text-xs text-gray-600">
                      Direção Acadêmica
                    </p>
                  </div>

                  {/* Código de Verificação */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">
                      Código de Verificação
                    </p>
                    <div className="bg-gray-100 rounded px-3 py-2 inline-block mb-2">
                      <p className="font-mono text-sm font-bold text-primary">
                        {certificado.codigoVerificacao}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      portal.klaus-driftbrasil.com.br/verificar-certificado
                    </p>
                  </div>
                </div>

                {/* Rodapé com informações da empresa */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Klaus Drift Brasil - Centro de Treinamento Automotivo | CNPJ: XX.XXX.XXX/XXXX-XX
                  </p>
                  <p className="text-xs text-gray-500">
                    www.klaus-driftbrasil.com.br | contato@klaus-driftbrasil.com.br
                  </p>
                </div>
              </div>

              {/* Logo Marca d'água centralizada */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <div className="relative w-96 h-96">
                  <Image
                    src="/logo-drift-brasil.png"
                    alt="Marca d'água"
                    fill
                    className="object-contain transform rotate-[-15deg]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de impressão */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          
          html, body {
            width: 297mm;
            height: 210mm;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          
          .print\\:bg-white {
            background: white !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }

          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          /* Garantir que o certificado ocupe a página toda */
          .aspect-\\[297\\/210\\] {
            aspect-ratio: auto !important;
            height: 210mm !important;
            width: 297mm !important;
          }

          /* Cores ficam vivas na impressão */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }

        /* Proporção A4 Landscape */
        .aspect-\\[297\\/210\\] {
          aspect-ratio: 297/210;
        }
      `}</style>
    </>
  );
}
