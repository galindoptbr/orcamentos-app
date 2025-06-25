"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrcamentoPDF } from "@/components/OrcamentoPDF";
import { useRouter } from "next/navigation";

interface Orcamento {
  id: string;
  numero: string;
  cliente: {
    nome: string;
    morada: string;
    nif: string;
  };
  data: string;
  itens: {
    parteId: string;
    parteNome: string;
    trabalhos: {
      trabalhoId: string;
      nome: string;
      descricao: string;
      quantidade: string;
      unidade: string;
      valorUnitario: string;
    }[];
  }[];
  total: number;
}

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;
  const router = useRouter();

  useEffect(() => {
    async function fetchOrcamentos() {
      setLoading(true);
      const snap = await getDocs(collection(db, "orcamentos"));
      setOrcamentos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Orcamento)
        .sort((a, b) => (b.data || '').localeCompare(a.data || '')));
      setLoading(false);
    }
    fetchOrcamentos();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja apagar este orçamento?")) return;
    await deleteDoc(doc(db, "orcamentos", id));
    setOrcamentos(prev => prev.filter(o => o.id !== id));
  }

  // Paginação
  const totalPaginas = Math.ceil(orcamentos.length / porPagina);
  const orcamentosPagina = orcamentos.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">Orçamentos Salvos</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
        {loading ? <p className="text-center text-zinc-500">Carregando...</p> : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700">
                  <th className="p-3 rounded-l-xl">Nº</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Total (€)</th>
                  <th className="p-3 rounded-r-xl text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orcamentosPagina.length === 0 && (
                  <tr><td colSpan={5} className="text-center p-6 text-zinc-400">Nenhum orçamento salvo.</td></tr>
                )}
                {orcamentosPagina.map(orc => (
                  <tr key={orc.id} className="bg-zinc-50 hover:bg-blue-50 transition">
                    <td className="p-3 font-bold text-blue-900 rounded-l-xl">{orc.numero || "N/A"}</td>
                    <td className="p-3 font-medium text-zinc-800">{orc.cliente?.nome}</td>
                    <td className="p-3">{orc.data ? new Date(orc.data).toLocaleDateString() : ""}</td>
                    <td className="p-3">{Number(orc.total).toFixed(2)}</td>
                    <td className="p-3 flex gap-2 justify-center items-center rounded-r-xl">
                      <PDFDownloadLink document={<OrcamentoPDF orcamento={orc} />} fileName={`orcamento-${orc.numero || orc.cliente?.nome || "cliente"}.pdf`}>
                        {() => (
                          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
                            PDF
                          </button>
                        )}
                      </PDFDownloadLink>
                      <button
                        className="bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-600 transition-colors cursor-pointer shadow-sm"
                        onClick={() => router.push(`/orcamentos/novo?id=${orc.id}`)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                        onClick={() => handleDelete(orc.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Controles de Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-zinc-200 text-zinc-700 font-semibold disabled:opacity-50 cursor-pointer"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >Anterior</button>
              <span className="font-medium">Página {pagina} de {totalPaginas}</span>
              <button
                className="px-3 py-1 rounded bg-zinc-200 text-zinc-700 font-semibold disabled:opacity-50 cursor-pointer"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >Próxima</button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
} 