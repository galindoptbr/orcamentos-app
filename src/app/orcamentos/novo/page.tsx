"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrcamentoPDF } from "@/components/OrcamentoPDF";

interface ParteProcesso {
  id: string;
  nome: string;
}

interface Trabalho {
  id: string;
  parte_processo_id: string;
  nome: string;
  unidade?: string;
  quantidade_padrao?: number;
  descricao?: string;
}

export default function NovoOrcamentoPage() {
  // Cliente
  const [clienteNome, setClienteNome] = useState("");
  const [clienteMorada, setClienteMorada] = useState("");
  const [clienteNif, setClienteNif] = useState("");

  // Dados Firestore
  const [partes, setPartes] = useState<ParteProcesso[]>([]);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);

  // Seleção
  const [partesSelecionadas, setPartesSelecionadas] = useState<string[]>([]);
  const [itens, setItens] = useState<any[]>([]); // [{parteId, trabalhos: [{trabalhoId, quantidade, unidade, valorUnitario}]}]
  const [orcamentoSalvo, setOrcamentoSalvo] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const partesSnap = await getDocs(collection(db, "partes_processo"));
      setPartes(partesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ParteProcesso));
      const trabalhosSnap = await getDocs(collection(db, "trabalhos"));
      setTrabalhos(trabalhosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Trabalho));
    }
    fetchData();
  }, []);

  // Adiciona ou remove parte selecionada
  function toggleParte(parteId: string) {
    setPartesSelecionadas(prev =>
      prev.includes(parteId)
        ? prev.filter(id => id !== parteId)
        : [...prev, parteId]
    );
    // Remove itens da parte desmarcada
    setItens(prev => prev.filter(item => item.parteId !== parteId));
  }

  // Adiciona trabalho à parte
  function addTrabalho(parteId: string, trabalho: Trabalho) {
    setItens(prev => {
      const parte = prev.find(item => item.parteId === parteId);
      if (parte) {
        if (parte.trabalhos.find((t: any) => t.trabalhoId === trabalho.id)) return prev;
        return prev.map(item =>
          item.parteId === parteId
            ? { ...item, trabalhos: [...item.trabalhos, { trabalhoId: trabalho.id, nome: trabalho.nome, quantidade: trabalho.quantidade_padrao || 1, unidade: trabalho.unidade || "unid", valorUnitario: 0 }] }
            : item
        );
      } else {
        return [...prev, { parteId, trabalhos: [{ trabalhoId: trabalho.id, nome: trabalho.nome, quantidade: trabalho.quantidade_padrao || 1, unidade: trabalho.unidade || "unid", valorUnitario: 0 }] }];
      }
    });
  }

  // Atualiza campos de trabalho
  function updateTrabalho(parteId: string, trabalhoId: string, field: string, value: any) {
    setItens(prev =>
      prev.map(item =>
        item.parteId === parteId
          ? {
              ...item,
              trabalhos: item.trabalhos.map((t: any) =>
                t.trabalhoId === trabalhoId ? { ...t, [field]: value } : t
              ),
            }
          : item
      )
    );
  }

  // Remove trabalho de uma parte
  function removeTrabalho(parteId: string, trabalhoId: string) {
    setItens(prev =>
      prev.map(item =>
        item.parteId === parteId
          ? { ...item, trabalhos: item.trabalhos.filter((t: any) => t.trabalhoId !== trabalhoId) }
          : item
      ).filter(item => item.trabalhos.length > 0)
    );
  }

  // Salvar orçamento
  async function handleSalvar() {
    if (!clienteNome || !itens.length) return alert("Preencha os dados do cliente e adicione pelo menos um trabalho.");
    
    // Garantir que todos os campos tenham valores válidos
    const orcamentoData = {
      cliente: {
        nome: clienteNome || "",
        morada: clienteMorada || "",
        nif: clienteNif || "",
      },
      data: new Date().toISOString(),
      itens: itens.map(item => ({
        parteId: item.parteId,
        parteNome: partes.find(p => p.id === item.parteId)?.nome || item.parteId,
        trabalhos: item.trabalhos.map((t: any) => {
          const original = trabalhos.find((tr: any) => tr.id === t.trabalhoId);
          return {
            trabalhoId: t.trabalhoId,
            nome: t.nome || "",
            descricao: original?.descricao || t.descricao || "",
            quantidade: t.quantidade || "0",
            unidade: t.unidade || "unid",
            valorUnitario: t.valorUnitario || "0",
          };
        })
      })),
      total: itens.reduce((acc, item) => 
        acc + item.trabalhos.reduce((s: number, t: any) => 
          s + ((parseFloat(t.quantidade) || 0) * (parseFloat(t.valorUnitario) || 0)), 0), 0
      ),
    };

    const docRef = await addDoc(collection(db, "orcamentos"), orcamentoData);
    setOrcamentoSalvo(orcamentoData);
    alert("Orçamento salvo!");
    setClienteNome(""); 
    setClienteMorada(""); 
    setClienteNif(""); 
    setPartesSelecionadas([]); 
    setItens([]);
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">Novo Orçamento</h1>
      <div className="mb-8 space-y-2 bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
        <h2 className="text-lg font-semibold">Dados do Cliente</h2>
        <input type="text" placeholder="Nome" value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-zinc-50" required />
        <input type="text" placeholder="Morada" value={clienteMorada} onChange={e => setClienteMorada(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-zinc-50" />
        <input type="text" placeholder="NIF" value={clienteNif} onChange={e => setClienteNif(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-zinc-50" />
      </div>
      <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
        <h2 className="text-lg font-semibold mb-2">Partes do Processo</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {partes.map(parte => (
            <button
              key={parte.id}
              type="button"
              className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${partesSelecionadas.includes(parte.id) ? "bg-blue-600 text-white border-blue-600" : "bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-blue-50"}`}
              onClick={() => toggleParte(parte.id)}
            >
              {parte.nome}
            </button>
          ))}
        </div>
        {partesSelecionadas.map(parteId => (
          <div key={parteId} className="mb-4 border rounded-lg p-3 bg-zinc-50">
            <div className="font-semibold mb-2">{partes.find(p => p.id === parteId)?.nome}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {trabalhos.filter(t => t.parte_processo_id === parteId).map(trabalho => {
                const selecionado = !!itens.find(item => item.parteId === parteId && item.trabalhos.find((t: any) => t.trabalhoId === trabalho.id));
                const label = trabalho.descricao?.trim() ? trabalho.descricao.slice(0, 30) + (trabalho.descricao.length > 30 ? '...' : '') : 'Trabalho sem nome';
                return (
                  <button
                    key={trabalho.id}
                    type="button"
                    className={`px-2 py-1 border rounded-lg text-xs font-medium transition-colors flex flex-col items-start max-w-xs truncate cursor-pointer ${selecionado ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-blue-50'}`}
                    onClick={() => addTrabalho(parteId, trabalho)}
                    disabled={selecionado}
                  >
                    <span className="truncate w-full">{label}</span>
                    {trabalho.descricao && (!trabalho.nome || trabalho.nome.trim() === '') && (
                      <span className="text-[10px] text-zinc-300 w-full truncate">{trabalho.descricao.slice(0, 40)}{trabalho.descricao.length > 40 ? '...' : ''}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <ul className="space-y-1">
              {/* Cabeçalho dos campos de edição */}
              {(itens.find(item => item.parteId === parteId)?.trabalhos || []).length > 0 && (
                <li className="flex gap-2 text-xs text-zinc-500 mb-1">
                  <span className="w-16">Qtd.</span>
                  <span className="w-16">Unid.</span>
                  <span className="w-24">Valor Unitário</span>
                  <span className="w-20" />
                  <span className="flex-1" />
                </li>
              )}
              {(itens.find(item => item.parteId === parteId)?.trabalhos || []).map((t: any) => {
                const trabalho = trabalhos.find(tr => tr.id === t.trabalhoId);
                return (
                  <li key={t.trabalhoId} className="flex flex-col gap-1 text-sm border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                    <span className="font-medium">{trabalho?.descricao?.trim() ? trabalho.descricao : 'Trabalho sem nome'}</span>
                    {trabalho?.descricao && trabalho?.nome?.trim() && (
                      <span className="text-xs text-zinc-500">{trabalho.descricao.slice(0, 60)}{trabalho.descricao.length > 60 ? '...' : ''}</span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <input type="text" value={t.quantidade} onChange={e => updateTrabalho(parteId, t.trabalhoId, "quantidade", e.target.value.replace(/\D/g, ''))} className="w-16 border border-zinc-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <input type="text" value={t.unidade} onChange={e => updateTrabalho(parteId, t.trabalhoId, "unidade", e.target.value)} className="w-16 border border-zinc-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      <input type="text" value={t.valorUnitario} onChange={e => updateTrabalho(parteId, t.trabalhoId, "valorUnitario", e.target.value.replace(/[^\d.]/g, ''))} className="w-24 border border-zinc-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Valor unitário" />
                      <span className="text-xs">Total: {((parseFloat(t.quantidade) || 0) * (parseFloat(t.valorUnitario) || 0)).toFixed(2)}</span>
                      <button type="button" className="text-red-600 ml-2 hover:underline cursor-pointer" onClick={() => removeTrabalho(parteId, t.trabalhoId)}>Remover</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-zinc-200">
        <h2 className="text-lg font-semibold mb-2">Resumo do Orçamento</h2>
        {itens.length === 0 ? (
          <p className="text-zinc-400">Nenhum trabalho adicionado.</p>
        ) : (
          <div className="space-y-6">
            {itens.map(item => (
              <div key={item.parteId}>
                <div className="font-bold text-blue-900 mb-2 text-base">{partes.find(p => p.id === item.parteId)?.nome || item.parteId}</div>
                <table className="w-full text-xs border-separate border-spacing-y-1 mb-2">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border px-2 py-1 text-left">Trabalho</th>
                      <th className="border px-2 py-1 text-left">Descrição</th>
                      <th className="border px-2 py-1">Qtd</th>
                      <th className="border px-2 py-1">Unid.</th>
                      <th className="border px-2 py-1">Valor Unit.</th>
                      <th className="border px-2 py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.trabalhos.map((t: any) => {
                      const trabalho = trabalhos.find(tr => tr.id === t.trabalhoId);
                      return (
                        <tr key={t.trabalhoId} className="bg-zinc-50">
                          <td className="border px-2 py-1 font-medium">
                            {trabalho?.descricao?.trim() ? trabalho.descricao : 'Trabalho sem nome'}
                          </td>
                          <td className="border px-2 py-1 text-zinc-600">
                            {trabalho?.descricao && (!trabalho.nome || trabalho.nome.trim() !== trabalho.descricao.trim()) ? trabalho.descricao.slice(0, 80) + (trabalho.descricao.length > 80 ? '...' : '') : '-'}
                          </td>
                          <td className="border px-2 py-1 text-center">{t.quantidade}</td>
                          <td className="border px-2 py-1 text-center">{t.unidade}</td>
                          <td className="border px-2 py-1 text-center">{Number(t.valorUnitario).toFixed(2)}</td>
                          <td className="border px-2 py-1 text-center">{(t.quantidade * t.valorUnitario).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
        <div className="font-bold text-right mt-4">Total: {itens.reduce((acc, item) => acc + item.trabalhos.reduce((s: number, t: any) => s + (t.quantidade * t.valorUnitario), 0), 0).toFixed(2)} €</div>
      </div>
      {/* Botões PDF e Salvar alinhados fora do resumo */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-6 max-w-3xl mx-auto gap-4">
        <button onClick={handleSalvar} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors cursor-pointer shadow-sm">Salvar Orçamento</button>
        {itens.length > 0 && clienteNome ? (
          <PDFDownloadLink
            document={<OrcamentoPDF orcamento={{
              cliente: { nome: clienteNome, morada: clienteMorada, nif: clienteNif },
              data: new Date().toISOString(),
              itens: itens.map(item => ({
                ...item,
                trabalhos: item.trabalhos.map((t: any) => {
                  const original = trabalhos.find((tr: any) => tr.id === t.trabalhoId);
                  return {
                    ...t,
                    descricao: original?.descricao || t.descricao || "Trabalho sem nome",
                  };
                }),
                parteNome: partes.find((p: any) => p.id === item.parteId)?.nome || item.parteId,
              })),
              total: itens.reduce((acc: number, item: any) => acc + item.trabalhos.reduce((s: number, t: any) => s + ((parseFloat(t.quantidade) || 0) * (parseFloat(t.valorUnitario) || 0)), 0), 0),
            }} />}
            fileName={`orcamento-${clienteNome}.pdf`}
          >
            {({ loading }) => (
              <button className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
                {loading ? "Gerando PDF..." : "Gerar PDF"}
              </button>
            )}
          </PDFDownloadLink>
        ) : <div />}
      </div>
    </div>
  );
} 