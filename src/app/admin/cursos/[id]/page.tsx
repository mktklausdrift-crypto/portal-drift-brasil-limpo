// Função para exportação estática dos parâmetros dinâmicos
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://" + process.env.VERCEL_URL || "http://localhost:3000"}/api/admin/cursos?limit=500`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.courses || []).map((curso: { id: string }) => ({ id: curso.id }));
  } catch (e) {
    return [];
  }
}

import ClientPage from "./client-page";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ClientPage id={params.id} />;
}
