"use client";

import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 8, fontWeight: "bold" },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
  section: { marginBottom: 12 },
  label: { fontWeight: "bold", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
});

export interface ReportPdfData {
  title: string;
  subtitle?: string;
  sections: { label: string; value: string }[];
  rows?: { label: string; value: string }[];
}

interface PdfPreviewDialogProps {
  data: ReportPdfData;
  triggerLabel?: string;
}

function ReportDocument({ data }: { data: ReportPdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>
        {data.subtitle ? (
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        ) : null}
        {data.sections.map((section) => (
          <View key={section.label} style={styles.section}>
            <Text style={styles.label}>{section.label}</Text>
            <Text>{section.value}</Text>
          </View>
        ))}
        {data.rows?.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text>{row.label}</Text>
            <Text>{row.value}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function PdfPreviewDialog({
  data,
  triggerLabel = "Preview PDF",
}: PdfPreviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Report Preview</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] w-full overflow-hidden rounded-md border">
          <PDFViewer width="100%" height="100%" showToolbar>
            <ReportDocument data={data} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
