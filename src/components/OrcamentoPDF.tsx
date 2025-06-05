import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#222",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
  },
  itemCell: {
    width: 40,
    textAlign: "center",
    fontWeight: "bold",
  },
  descCell: {
    flexGrow: 2.5,
    minWidth: 120,
    textAlign: "left",
  },
  unidadeCell: {
    width: 40,
    textAlign: "center",
  },
  quantCell: {
    width: 40,
    textAlign: "center",
  },
  unitCell: {
    width: 50,
    textAlign: "center",
  },
  totalCell: {
    width: 60,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    backgroundColor: "#ffd600",
    color: "#1a3353",
    fontWeight: "bold",
    fontSize: 11,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#bdbdbd",
    borderTopWidth: 1,
    borderTopColor: "#bdbdbd",
    marginTop: 8,
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
    flexGrow: 5,
    textAlign: "right",
    fontWeight: "bold",
    color: "#1a3353",
    padding: 4,
    fontSize: 11,
  },
  totalValue: {
    width: 60,
    textAlign: "right",
    fontWeight: "bold",
    color: "#1a3353",
    padding: 4,
    fontSize: 11,
  },
});

function enumerate(items: any[], prefix: string) {
  // Gera numeração hierárquica: 1, 1.1, 1.1.1, etc.
  return items.map((item, idx) => ({
    ...item,
    numero: prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`,
  }));
}

export function OrcamentoPDF({ orcamento }: { orcamento: any }) {
  // Agrupar trabalhos por parteNome
  const grupos = orcamento.itens.reduce((acc: any, item: any) => {
    const nome = item.parteNome || item.parteId;
    if (!acc[nome]) acc[nome] = [];
    item.trabalhos.forEach((t: any) => acc[nome].push(t));
    return acc;
  }, {});
  // Enumerar seções e trabalhos
  const partes = Object.entries(grupos).map(([parte, trabalhos], idx) => ({
    nome: parte,
    numero: `${idx + 1}`,
    trabalhos: enumerate(trabalhos as any[], `${idx + 1}`),
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={{ alignItems: "flex-start", marginBottom: 6 }}>
              <Image
                src="/RE9.png"
                style={{ width: 120, height: 54, marginBottom: 2 }}
              />
              <Text
                style={[styles.title, { textAlign: "left", marginBottom: 2 }]}
              >
                {orcamento.cliente?.nome?.toUpperCase()}
              </Text>
              <Text style={{ textAlign: "left" }}>
                Data: {orcamento.data ? new Date(orcamento.data).toLocaleDateString() : ""}
              </Text>
              <Text style={{ textAlign: "left" }}>
                Morada: {orcamento.cliente?.morada}
              </Text>
              <Text style={{ textAlign: "left" }}>
                NIF: {orcamento.cliente?.nif}
              </Text>
            </View>
          </View>
          <View style={styles.empresaBox}>
            <Text>Paulo Jorge Peixoto Pinto</Text>
            <Text>Rua Do Monte Nº16 4760-196 Gavião, V.N.Famalicão</Text>
            <Text>NIF: 231376960</Text>
            <Text>Tel: 916918979</Text>
            <Text>re9interiores@outlook.pt</Text>
          </View>
        </View>
        {/* Cabeçalho da tabela */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.itemCell]}>ITEM</Text>
            <Text style={[styles.tableCell, styles.descCell]}>
              DESIGNAÇÃO DOS TRABALHOS
            </Text>
            <Text style={[styles.tableCell, styles.unidadeCell]}>UNID.</Text>
            <Text style={[styles.tableCell, styles.quantCell]}>QUANT.</Text>
            <Text style={[styles.tableCell, styles.unitCell]}>UNIT.</Text>
            <Text style={[styles.tableCell, styles.totalCell]}>TOTAL</Text>
          </View>
          {/* Seções e trabalhos */}
          {partes.map((parte) => (
            <React.Fragment key={parte.nome}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionNumber}>{parte.numero}</Text>
                <Text>{parte.nome}</Text>
              </View>
              {parte.trabalhos.map((t: any, i: number) => (
                <View style={styles.tableRow} key={t.trabalhoId + i}>
                  <Text style={[styles.tableCell, styles.itemCell]}>
                    {t.numero}
                  </Text>
                  <View
                    style={[
                      styles.tableCell,
                      styles.descCell,
                      { flexDirection: "column" },
                    ]}
                  >
                    <Text>
                      {t.descricao?.trim() ? t.descricao : "Trabalho sem nome"}
                    </Text>
                  </View>
                  <Text style={[styles.tableCell, styles.unidadeCell]}>
                    {t.unidade}
                  </Text>
                  <Text style={[styles.tableCell, styles.quantCell]}>
                    {t.quantidade}
                  </Text>
                  <Text style={[styles.tableCell, styles.unitCell]}>
                    {Number(t.valorUnitario).toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.totalCell]}>
                    {(
                      parseFloat(t.quantidade) * parseFloat(t.valorUnitario)
                    ).toFixed(2)}
                  </Text>
                </View>
              ))}
            </React.Fragment>
          ))}
          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {Number(orcamento.total).toFixed(2)} €
            </Text>
          </View>
        </View>
        {/* Rodapé com condições de pagamento e validade */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: "red", fontSize: 10, marginBottom: 6 }}>
            Acresce IVA à taxa legal
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 10, marginBottom: 2 }}>
            Condições de pagamento:
          </Text>
          <Text style={{ fontSize: 10, marginBottom: 8 }}>
            50% do valor total no início da obra, 30% antes das pinturas e o
            restante no final da mesma.
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 10 }}>
            Orçamento válido por 30 dias
          </Text>
        </View>
      </Page>
    </Document>
  );
}
