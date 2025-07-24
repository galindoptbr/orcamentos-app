import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import React from "react";

interface Trabalho {
  trabalhoId: string;
  nome: string;
  descricao: string;
  quantidade: string;
  unidade: string;
  valorUnitario: string;
  numero?: string;
}

interface ItemOrcamento {
  parteId: string;
  parteNome: string;
  trabalhos: Trabalho[];
}

interface Cliente {
  nome: string;
  morada: string;
  nif: string;
}

interface Orcamento {
  numero: string;
  cliente: Cliente;
  data: string;
  itens: ItemOrcamento[];
  total: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#222",
    backgroundColor: "#fff",
  },
  numeroOrcamento: {
    position: "absolute",
    top: 24,
    left: 24,
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a3353",
    backgroundColor: "#ffd600",
    padding: "4px 8px",
    borderRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    marginTop: 20,
  },
  logo: {
    width: 90,
    height: 40,
    marginBottom: 8,
  },
  empresaBox: {
    fontSize: 10,
    textAlign: "right",
    color: "#222",
    marginBottom: 4,
  },
  clienteBox: {
    border: "1px solid #bdbdbd",
    padding: 8,
    marginBottom: 10,
    fontSize: 10,
    width: 260,
  },
  clienteLabel: {
    fontWeight: "bold",
    fontSize: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a3353",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bdbdbd",
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  tableHeader: {
    backgroundColor: "#1a3353",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },
  tableCell: {
    borderRightWidth: 1,
    borderRightColor: "#bdbdbd",
    padding: 4,
    fontSize: 10,
    minHeight: 18,
    justifyContent: "center",
    wordBreak: "break-all",
  },
  itemCell: {
    width: 40,
    textAlign: "center",
    fontWeight: "bold",
  },
  descCell: {
    width: 350,
    textAlign: "left",
    wordBreak: "break-all",
  },
  qtdCell: {
    width: 50,
    textAlign: "center",
  },
  unidCell: {
    width: 50,
    textAlign: "center",
  },
  totalCell: {
    width: 50,
    textAlign: "right",
    fontWeight: "bold",
    borderRightWidth: 0,
  },
  sectionTitle: {
    backgroundColor: "#ffd600",
    color: "#1a3353",
    fontWeight: "bold",
    fontSize: 11,
    padding: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionNumber: {
    width: 40,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 11,
    color: "#1a3353",
    paddingRight: 4,
  },
  trabalhoDesc: {
    fontSize: 9,
    color: "#444",
    marginBottom: 2,
    marginLeft: 2,
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#bdbdbd",
  },
  totalLabel: {
    flexGrow: 1,
    textAlign: "right",
    fontWeight: "bold",
    color: "#1a3353",
    padding: 4,
    fontSize: 11,
  },
  totalValue: {
    width: 80,
    textAlign: "right",
    fontWeight: "bold",
    color: "#1a3353",
    padding: 4,
    fontSize: 11,
  },
});

function calcularTotalParte(trabalhos: Trabalho[]): number {
  return trabalhos.reduce((acc, t) => {
    const quantidade = parseFloat(t.quantidade) || 0;
    const valorUnitario = parseFloat(t.valorUnitario) || 0;
    return acc + (quantidade * valorUnitario);
  }, 0);
}

export function OrcamentoPDF({ orcamento }: { orcamento: Orcamento }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Número do Orçamento */}
        <Text style={styles.numeroOrcamento}>
          Orçamento Nº {orcamento.numero}
        </Text>
        {/* Header */}
        <View style={styles.header}>
          {/* Logotipo e empresa */}
          <View style={{ flex: 1 }}>
            <Image
              src="/RE9.png"
              style={{ width: 120, height: 54, marginBottom: 2 }}
            />
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontWeight: "bold", fontSize: 11 }}>Paulo Jorge Peixoto Pinto</Text>
              <Text>Rua Do Monte Nº16 4760-196 Gavião, V.N.Famalicão</Text>
              <Text>NIF: 231376960</Text>
              <Text>Tel: 916918979</Text>
              <Text>re9interiores@outlook.pt</Text>
            </View>
          </View>
          {/* Cliente à direita */}
          <View style={{ minWidth: 220, alignItems: "flex-end" }}>
            <View style={{ border: "1px solid #bdbdbd", padding: 8, fontSize: 10, width: 200 }}>
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>{orcamento.cliente?.nome}</Text>
              <Text>{orcamento.cliente?.morada}</Text>
              <Text>NIF: {orcamento.cliente?.nif}</Text>
              <Text>Data: {orcamento.data ? new Date(orcamento.data).toLocaleDateString() : ""}</Text>
            </View>
          </View>
        </View>
        {/* Tabela de partes e totais */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.itemCell]}>ITEM</Text>
            <Text style={[styles.tableCell, styles.descCell]}>DESIGNAÇÃO DOS TRABALHOS</Text>
            <Text style={[styles.tableCell, styles.qtdCell]}>QUANT.</Text>
            <Text style={[styles.tableCell, styles.unidCell]}>UNID.</Text>
            <Text style={[styles.tableCell, styles.totalCell]}>TOTAL</Text>
          </View>
          {orcamento.itens.map((item, idx) => {
            const totalParte = calcularTotalParte(item.trabalhos);
            return (
              <React.Fragment key={item.parteId}>
                <View style={
                  idx === 0
                    ? [styles.sectionTitle]
                    : [{ ...styles.sectionTitle, marginTop: 8 }]
                }>
                  <Text style={styles.sectionNumber}>{idx + 1}</Text>
                  <Text>{item.parteNome}</Text>
                </View>
                {/* Lista apenas as descrições dos trabalhos, sem valores */}
                {item.trabalhos.map((t: Trabalho, i: number) => (
                  <View style={[styles.tableRow, { marginBottom: 0, paddingBottom: 0 }]} key={t.trabalhoId + i}>
                    <Text style={[styles.tableCell, styles.itemCell]}>{`${idx + 1}.${i + 1}`}</Text>
                    <Text style={[styles.tableCell, styles.descCell]}>{t.descricao?.trim() ? t.descricao : "Trabalho sem nome"}</Text>
                    <Text style={[styles.tableCell, styles.qtdCell]}>{t.quantidade}</Text>
                    <Text style={[styles.tableCell, styles.unidCell]}>{t.unidade}</Text>
                    <Text style={[styles.tableCell, styles.totalCell]}></Text>
                  </View>
                ))}
                {/* Total da parte, sem margem inferior */}
                <View style={[
                  styles.tableRow,
                  { backgroundColor: "#f0f0f0", marginBottom: 0, paddingBottom: 2 }
                ]}> 
                  <Text style={[styles.tableCell, styles.itemCell]}></Text>
                  <Text style={[styles.tableCell, styles.descCell, { fontWeight: "bold" }]}>Total {item.parteNome}</Text>
                  <Text style={[styles.tableCell, styles.qtdCell, { fontWeight: "bold" }]}></Text>
                  <Text style={[styles.tableCell, styles.unidCell, { fontWeight: "bold" }]}></Text>
                  <Text style={[styles.tableCell, styles.totalCell, { fontWeight: "bold" }]}>{totalParte.toFixed(2)}</Text>
                </View>
              </React.Fragment>
            );
          })}
          {/* Total Geral */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Geral</Text>
            <Text style={styles.totalValue}>{Number(orcamento.total).toFixed(2)} €</Text>
          </View>
        </View>
        {/* Rodapé */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: "red", fontSize: 10, marginBottom: 6 }}>Acresce IVA à taxa legal</Text>
          <Text style={{ fontWeight: "bold", fontSize: 10, marginBottom: 2 }}>Condições de pagamento:</Text>
          <Text style={{ fontSize: 10, marginBottom: 8 }}>50% do valor total no início da obra, 30% antes das pinturas e o restante no final da mesma.</Text>
          <Text style={{ fontWeight: "bold", fontSize: 10 }}>Orçamento válido por 30 dias</Text>
        </View>
      </Page>
    </Document>
  );
}
