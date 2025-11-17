import React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica"
  },
  border: {
    border: "4px solid #2563eb",
    padding: 40,
    height: "100%"
  },
  innerBorder: {
    border: "1px solid #93c5fd",
    padding: 30,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  header: {
    textAlign: "center",
    marginBottom: 30
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 2
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 5
  },
  body: {
    textAlign: "center",
    marginVertical: 30
  },
  certifyText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20
  },
  studentName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 15,
    borderBottom: "2px solid #2563eb",
    paddingBottom: 10
  },
  courseInfo: {
    marginVertical: 20
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10
  },
  courseDetails: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 30,
    borderTop: "1px solid #e5e7eb"
  },
  footerSection: {
    flex: 1,
    textAlign: "center"
  },
  date: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 5
  },
  signature: {
    borderTop: "1px solid #111827",
    paddingTop: 5,
    marginTop: 30,
    fontSize: 10,
    color: "#6b7280"
  },
  qrSection: {
    textAlign: "center"
  },
  qrCode: {
    width: 80,
    height: 80,
    margin: "0 auto"
  },
  verificationCode: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 5
  },
  logo: {
    width: 100,
    height: 40,
    marginBottom: 10
  },
  seal: {
    width: 60,
    height: 60,
    margin: "0 auto 10"
  }
})

interface CertificadoPDFProps {
  studentName: string
  courseName: string
  courseWorkload: string
  completionDate: string
  certificateId: string
  qrCodeDataURL: string
}

export const CertificadoPDF = ({
  studentName,
  courseName,
  courseWorkload,
  completionDate,
  certificateId,
  qrCodeDataURL
}: CertificadoPDFProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.innerBorder}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Certificado de Conclusão</Text>
            <Text style={styles.subtitle}>Portal Drift Brasil</Text>
            <Text style={styles.subtitle}>Capacitação e Desenvolvimento Profissional</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.certifyText}>
              Certificamos que
            </Text>

            <Text style={styles.studentName}>{studentName}</Text>

            <Text style={styles.certifyText}>
              concluiu com êxito o curso
            </Text>

            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{courseName}</Text>
              <Text style={styles.courseDetails}>
                Carga horária: {courseWorkload}
              </Text>
              <Text style={styles.courseDetails}>
                Data de conclusão: {completionDate}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerSection}>
              <View style={styles.signature}>
                <Text>_______________________________</Text>
                <Text style={{ marginTop: 5 }}>Coordenação Acadêmica</Text>
                <Text>Portal Drift Brasil</Text>
              </View>
            </View>

            <View style={styles.qrSection}>
              <Text style={styles.date}>
                Verifique a autenticidade
              </Text>
              {qrCodeDataURL && (
                <Image
                  src={qrCodeDataURL}
                  style={styles.qrCode}
                />
              )}
              <Text style={styles.verificationCode}>
                Código: {certificateId}
              </Text>
            </View>

            <View style={styles.footerSection}>
              <Text style={styles.date}>
                Emitido em {completionDate}
              </Text>
              <Text style={[styles.verificationCode, { marginTop: 10 }]}>
                Este certificado é válido em todo território nacional
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)
