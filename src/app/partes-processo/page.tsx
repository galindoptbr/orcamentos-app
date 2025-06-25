"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

interface ParteProcesso {
  id: string;
  nome: string;
  descricao?: string;
}

export default function PartesProcessoPage() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [partes, setPartes] = useState<ParteProcesso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartes() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "partes_processo"));
      setPartes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParteProcesso)));
      setLoading(false);
    }
    fetchPartes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome) return;
    await addDoc(collection(db, "partes_processo"), { nome, descricao });
    setNome("");
    setDescricao("");
    // Atualiza lista
    const querySnapshot = await getDocs(collection(db, "partes_processo"));
    setPartes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParteProcesso)));
  }

  async function handleRemoverParte(parteId: string) {
    await deleteDoc(doc(db, "partes_processo", parteId));
    const querySnapshot = await getDocs(collection(db, "partes_processo"));
    setPartes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParteProcesso)));
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Partes do Processo</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Nome da parte"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          placeholder="Descrição (opcional)"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Cadastradas</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {partes.map(parte => (
            <li key={parte.id} className="border rounded px-3 py-2 flex justify-between items-center">
              <div>
                <span className="font-medium">{parte.nome}</span>
                {parte.descricao && <div className="text-sm text-gray-600">{parte.descricao}</div>}
              </div>
              <button type="button" className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-sm ml-4" onClick={() => handleRemoverParte(parte.id)}>
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 