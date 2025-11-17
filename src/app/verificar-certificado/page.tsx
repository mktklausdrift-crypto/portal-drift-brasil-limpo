"use client";

import { useState } from "react";
import Link from "next/link";

interface CertificadoVerificado {
  valido: boolean;
  aluno: string;
  curso: string;
  cargaHoraria: string;
  dataEmissao: string;
  codigoVerificacao: string;
}

export default function VerificarCertificadoPage() {
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<CertificadoVerificado | null>(null);
  const [erro, setErro] = useState("");

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      setErro("Por favor, insira um código de verificação");
      return;
    }

    setVerificando(true);
    setResultado(null);
    setErro("");

    try {
      const res = await fetch(`/api/certificados/verificar/${codigo.trim().toUpperCase()}`, {
        cache: 'no-store'
      });

      if (res.status === 404) {
        setErro("Certificado não encontrado. Verifique o código digitado.");
        return;
      }

      if (!res.ok) {
        throw new Error("Erro ao verificar certificado");
      }

      const data = await res.json();
      setResultado(data);
    } catch (error: any) {
      setErro(error.message || "Erro ao verificar certificado");
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-primary transition inline-flex items-center gap-2"
          >
            ← Voltar para Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verificar Certificado
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Insira o código de verificação para confirmar a autenticidade de um certificado emitido pela Klaus Drift Brasil
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <form onSubmit={handleVerificar} className="space-y-6">
            <div>
              <label
                htmlFor="codigo"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Código de Verificação
              </label>
              <input
                type="text"
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ex: A1B2C3D4E5F6G7H8"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-lg font-mono uppercase"
                maxLength={32}
              />
              <p className="mt-2 text-sm text-gray-500">
                O código de verificação está impresso no certificado
              </p>
            </div>

            <button
              type="submit"
              disabled={verificando || !codigo.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {verificando ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Verificar Certificado
                </>
              )}
            </button>
          </form>
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">❌</div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Certificado Inválido
                </h3>
                <p className="text-red-700">{erro}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultado */}
        {resultado && resultado.valido && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-900 mb-2">
                Certificado Válido!
              </h2>
              <p className="text-green-700">
                Este certificado foi emitido pela Klaus Drift Brasil e é autêntico.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aluno</p>
                  <p className="text-lg font-bold text-gray-900">
                    {resultado.aluno}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Data de Emissão</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(resultado.dataEmissao).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Curso</p>
                  <p className="text-lg font-bold text-gray-900">
                    {resultado.curso}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Carga Horária</p>
                  <p className="text-lg font-bold text-gray-900">
                    {resultado.cargaHoraria}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Código de Verificação</p>
                  <p className="text-lg font-mono font-bold text-primary">
                    {resultado.codigoVerificacao}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Informação:</strong> Este certificado foi emitido digitalmente pela Klaus Drift Brasil e possui validade em todo território nacional.
              </p>
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Como verificar um certificado?
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Localize o código de verificação impresso no certificado</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Digite o código no campo acima (letras e números)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Clique em "Verificar Certificado" para confirmar a autenticidade</span>
            </li>
          </ol>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Dúvidas?</strong> Entre em contato conosco pelo e-mail{" "}
              <a href="mailto:contato@klaus-driftbrasil.com.br" className="text-primary hover:underline">
                contato@klaus-driftbrasil.com.br
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
