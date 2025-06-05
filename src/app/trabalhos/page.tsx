"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

interface ParteProcesso {
  id: string;
  nome: string;
}

interface Trabalho {
  id: string;
  parte_processo_id: string;
  descricao: string;
  unidade: string;
  quantidade_padrao: number;
}

export default function TrabalhosPage() {
  const [partes, setPartes] = useState<ParteProcesso[]>([]);
  const [parteId, setParteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState("");
  const [quantidadePadrao, setQuantidadePadrao] = useState(1);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function fetchPartes() {
      const querySnapshot = await getDocs(collection(db, "partes_processo"));
      setPartes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ParteProcesso));
    }
    fetchPartes();
  }, []);

  useEffect(() => {
    async function fetchTrabalhos() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "trabalhos"));
      setTrabalhos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Trabalho));
      setLoading(false);
    }
    fetchTrabalhos();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parteId || !descricao || !unidade) return;
    setSalvando(true);
    await addDoc(collection(db, "trabalhos"), {
      parte_processo_id: parteId,
      descricao,
      unidade,
      quantidade_padrao: quantidadePadrao,
    });
    setDescricao("");
    setUnidade("");
    setQuantidadePadrao(1);
    // Atualiza lista
    const querySnapshot = await getDocs(collection(db, "trabalhos"));
    setTrabalhos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Trabalho));
    setSalvando(false);
  }

  async function handleRemoverTrabalho(trabalhoId: string) {
    await deleteDoc(doc(db, "trabalhos", trabalhoId));
    const querySnapshot = await getDocs(collection(db, "trabalhos"));
    setTrabalhos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Trabalho));
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Trabalhos</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <select
          value={parteId}
          onChange={e => setParteId(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Selecione a parte do processo</option>
          {partes.map(parte => (
            <option key={parte.id} value={parte.id}>{parte.nome}</option>
          ))}
        </select>
        <textarea
          placeholder="Descrição do trabalho"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <div className="flex gap-2 mb-2">
          {['unid', 'm2', '"'].map((op) => (
            <button
              type="button"
              key={op}
              className={`px-3 py-1 rounded border font-medium transition-colors ${unidade === op ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-50 cursor-pointer'}`}
              onClick={() => setUnidade(op)}
            >
              {op}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Quantidade padrão"
          value={quantidadePadrao}
          onChange={e => setQuantidadePadrao(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
          min={1}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Trabalhos cadastrados</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {trabalhos.map(trabalho => (
            <li key={trabalho.id} className="border rounded px-3 py-2 flex justify-between items-center">
              <div>
                <span className="font-medium">{trabalho.descricao || 'Trabalho sem nome'}</span>
                <div className="text-xs text-gray-500">
                  Parte: {partes.find(p => p.id === trabalho.parte_processo_id)?.nome || "-"} | Unidade: {trabalho.unidade} | Qtd. padrão: {trabalho.quantidade_padrao}
                </div>
              </div>
              <button type="button" className="text-red-600 hover:underline cursor-pointer ml-4" onClick={() => handleRemoverTrabalho(trabalho.id)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 