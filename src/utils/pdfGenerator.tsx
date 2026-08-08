// src/utils/pdfGenerator.tsx
import React from 'react';

// ============================================
// 📄 DATA INTERFACES
// ============================================

export interface StampPaperPDFData {
  stampNumber: string;
  agreementDate: string;
  propertyTitle: string;
  propertyAddress: string;
  priceFormatted: string;
  sellerName: string;
  buyerName: string;
  tokenAmount: number;
}

export interface PropertyPDFData {
  title: string;
  priceFormatted: string;
  address: string;
  city: string;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  ownerName: string;
  agencyName?: string;
  description: string;
  image?: string;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  date: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  platformFee: number;
  commission: number;
  paymentMethod: string;
  status: string;
}

// ============================================
// 📄 STYLES BUILDER
// ============================================

const createPdfStyles = (StyleSheet: any) => StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
    paddingBottom: 16,
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b'
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold'
  },
  value: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'bold'
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b'
  },
  escrowBadge: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center'
  },
  signatureBox: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signature: {
    width: '45%'
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 4,
    marginTop: 24,
    marginBottom: 4
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center'
  }
});

// ============================================
// 📥 DOWNLOAD HELPERS
// ============================================

export const downloadPDF = async (
  docElem: React.ReactElement,
  fileName: string
): Promise<boolean> => {
  try {
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(docElem as any).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('PDF download failed:', error);
    // Fallback text download if blob fails
    const fallbackText = `DOCUMENT: ${fileName}\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([fallbackText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return false;
  }
};

// ============================================
// 📥 MAIN EXPORT FUNCTIONS
// ============================================

export const downloadStampPaperPDF = async (data: StampPaperPDFData) => {
  const { Document, Page, Text, View, StyleSheet, Image } = await import('@react-pdf/renderer');
  const styles = createPdfStyles(StyleSheet);

  const stampNumber = data.stampNumber || `PK-ESTAMP-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const date = data.agreementDate || new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>GOVERNMENT OF PAKISTAN</Text>
          <Text style={styles.subtitle}>E-Stamp Escrow Agreement (Bayana) - DealFast</Text>
          <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
            Stamp Certificate #: {stampNumber} | Date: {date}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. PROPERTY DETAILS</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{data.propertyTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{data.propertyAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Price</Text>
            <Text style={styles.price}>{data.priceFormatted}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. PARTIES TO AGREEMENT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Seller / Agent</Text>
            <Text style={styles.value}>{data.sellerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Buyer</Text>
            <Text style={styles.value}>{data.buyerName}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.sectionTitle, { color: '#d97706' }]}>3. ESCROW TOKEN PAYMENT</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Token Amount (10%)</Text>
            <Text style={[styles.price, { fontSize: 16 }]}>PKR {data.tokenAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.escrowBadge}>
            <Text style={{ fontSize: 10, color: '#92400e' }}>
              Official Stamp Escrow Agreement: Held safely in DealFast Protected Account
            </Text>
          </View>
        </View>

        <View style={styles.signatureBox}>
          <View style={styles.signature}>
            <Text style={styles.signatureLine}>_________________________</Text>
            <Text style={styles.signatureLabel}>Seller / Agent Signature</Text>
          </View>
          <View style={styles.signature}>
            <Text style={styles.signatureLine}>_________________________</Text>
            <Text style={styles.signatureLabel}>Buyer Signature</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>DealFast Escrow Protected Transaction • {date}</Text>
          <Text>Verified Stamp Paper • Unique ID: {stampNumber}</Text>
        </View>
      </Page>
    </Document>
  );

  return downloadPDF(doc, `Stamp-Paper-${stampNumber}.pdf`);
};

export const downloadPropertyBrochurePDF = async (data: PropertyPDFData) => {
  const { Document, Page, Text, View, StyleSheet, Image } = await import('@react-pdf/renderer');
  const styles = createPdfStyles(StyleSheet);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Property Details</Text>
          <Text style={styles.subtitle}>DealFast - {data.city}</Text>
        </View>

        {data.image && (
          <Image
            src={data.image}
            style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{data.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Price</Text>
            <Text style={styles.price}>{data.priceFormatted}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{data.address}, {data.city}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Beds / Baths</Text>
            <Text style={styles.value}>{data.beds} Beds • {data.baths} Baths</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Area (sqft)</Text>
            <Text style={styles.value}>{data.sqft} sq.ft.</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{data.type}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={{ fontSize: 10, color: '#334155', lineHeight: 1.6 }}>
            {data.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent / Seller</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{data.ownerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agency</Text>
            <Text style={styles.value}>{data.agencyName || 'Independent'}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>DealFast - Pakistan's Premier Escrow Property Platform</Text>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );

  return downloadPDF(doc, `Property-${data.title.replace(/\s+/g, '_')}.pdf`);
};

export const downloadInvoicePDF = async (data: InvoicePDFData) => {
  const { Document, Page, Text, View, StyleSheet, Image } = await import('@react-pdf/renderer');
  const styles = createPdfStyles(StyleSheet);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#1e293b' }]}>TAX INVOICE</Text>
          <Text style={styles.subtitle}>DealFast Escrow Transaction</Text>
        </View>

        <View style={[styles.section, { backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }]}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice #</Text>
            <Text style={[styles.value, { color: '#f59e0b' }]}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.value, { color: data.status === 'paid' ? '#10b981' : '#ef4444' }]}>
              {data.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{data.buyerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{data.buyerEmail}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: '#f8fafc' }]}>
          <Text style={styles.sectionTitle}>Amount Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property Title</Text>
            <Text style={styles.value}>{data.propertyTitle}</Text>
          </View>
          <View style={[styles.row, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' }]}>
            <Text style={styles.label}>Escrow Token Amount</Text>
            <Text style={styles.value}>PKR {data.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Fee (2%)</Text>
            <Text style={styles.value}>PKR {data.platformFee.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agent Commission (5%)</Text>
            <Text style={styles.value}>PKR {data.commission.toLocaleString()}</Text>
          </View>
          <View style={[styles.row, { paddingTop: 8, borderTopWidth: 2, borderTopColor: '#f59e0b' }]}>
            <Text style={[styles.label, { fontSize: 12 }]}>Total</Text>
            <Text style={[styles.price, { fontSize: 16 }]}>
              PKR {(data.amount + data.platformFee + data.commission).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={{ fontSize: 10, color: '#334155' }}>{data.paymentMethod}</Text>
        </View>

        <View style={styles.footer}>
          <Text>FBR compliant invoice for property escrow transaction</Text>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );

  return downloadPDF(doc, `Invoice-${data.invoiceNumber}.pdf`);
};

