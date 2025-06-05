"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrcamentoPDF } from "@/components/OrcamentoPDF";

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrcamentos() {
      setLoading(true);
      const snap = await getDocs(collection(db, "orcamentos"));
      setOrcamentos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchOrcamentos();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja apagar este orçamento?")) return;
    await deleteDoc(doc(db, "orcamentos", id));
    setOrcamentos(prev => prev.filter(o => o.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">Orçamentos Salvos</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
        {loading ? <p className="text-center text-zinc-500">Carregando...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="bg-zinc-100 text-zinc-700">
                  <th className="p-3 rounded-l-xl">Cliente</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Total (€)</th>
                  <th className="p-3 rounded-r-xl text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orcamentos.length === 0 && (
                  <tr><td colSpan={4} className="text-center p-6 text-zinc-400">Nenhum orçamento salvo.</td></tr>
                )}
                {orcamentos.map(orc => (
                  <tr key={orc.id} className="bg-zinc-50 hover:bg-blue-50 transition">
                    <td className="p-3 font-medium text-zinc-800 rounded-l-xl">{orc.cliente?.nome}</td>
                    <td className="p-3">{orc.data ? new Date(orc.data).toLocaleDateString() : ""}</td>
                    <td className="p-3">{Number(orc.total).toFixed(2)}</td>
                    <td className="p-3 flex gap-2 justify-center items-center rounded-r-xl">
                      <PDFDownloadLink document={<OrcamentoPDF orcamento={orc} />} fileName={`orcamento-${orc.cliente?.nome || "cliente"}.pdf`}>
                        {({ loading }) => (
                          <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
                            {loading ? "Gerando..." : "PDF"}
                          </button>
                        )}
                      </PDFDownloadLink>
                      <button
                        className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
                        onClick={() => handleDelete(orc.id)}
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 