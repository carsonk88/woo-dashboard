"use client";

import { useState, useRef } from "react";
import { Search, Plus, FileText, Upload, FlaskConical, X } from "lucide-react";
import { products } from "@/lib/mock-data";

interface COAData {
  productId: number;
  batchNumber: string;
  testDate: string;
  labName: string;
  purity: string;
  molecularWeight: string;
  sequenceConfirmed: string;
  endotoxin: string;
  sterility: string;
  heavyMetals: string;
  residualSolvents: string;
  waterContent: string;
  notes: string;
}

const mockCOAs: Record<number, COAData> = {
  1: {
    productId: 1,
    batchNumber: "BPC157-5MG-2026-03-001",
    testDate: "2026-03-15",
    labName: "Intertek Pharmaceutical Services",
    purity: "98.7%",
    molecularWeight: "1419.53 Da",
    sequenceConfirmed: "Pass",
    endotoxin: "< 1.0 EU/mg",
    sterility: "Pass",
    heavyMetals: "Pass",
    residualSolvents: "Pass",
    waterContent: "4.2%",
    notes: "Full HPLC and mass spec panel completed. Lyophilized powder — store at -20°C.",
  },
  2: {
    productId: 2,
    batchNumber: "TB500-2MG-2026-03-001",
    testDate: "2026-03-18",
    labName: "Eurofins BioPharma",
    purity: "99.1%",
    molecularWeight: "2247.51 Da",
    sequenceConfirmed: "Pass",
    endotoxin: "< 0.5 EU/mg",
    sterility: "Pass",
    heavyMetals: "Pass",
    residualSolvents: "Pass",
    waterContent: "3.8%",
    notes: "Sequence verified via ESI-MS. Certificate valid for 24 months from date of manufacture.",
  },
  3: {
    productId: 3,
    batchNumber: "SEMA-5MG-2026-03-001",
    testDate: "2026-03-20",
    labName: "Alcami Analytical Labs",
    purity: "97.9%",
    molecularWeight: "4113.58 Da",
    sequenceConfirmed: "Pass",
    endotoxin: "< 2.0 EU/mg",
    sterility: "Pass",
    heavyMetals: "Pass",
    residualSolvents: "Pass",
    waterContent: "5.1%",
    notes: "GLP-1 receptor agonist analog. Full panel third-party verified.",
  },
  4: {
    productId: 4,
    batchNumber: "TIRZ-15MG-2026-02-001",
    testDate: "2026-02-28",
    labName: "Pacific Biotech Labs",
    purity: "98.2%",
    molecularWeight: "4813.49 Da",
    sequenceConfirmed: "Pass",
    endotoxin: "< 1.0 EU/mg",
    sterility: "Pass",
    heavyMetals: "Pass",
    residualSolvents: "Pass",
    waterContent: "4.6%",
    notes: "Dual GIP/GLP-1 agonist. Lyophilized. Retest date 2028-02-28.",
  },
  5: {
    productId: 5,
    batchNumber: "CJC-DAC-2MG-2026-03-001",
    testDate: "2026-03-10",
    labName: "Intertek Pharmaceutical Services",
    purity: "98.5%",
    molecularWeight: "3367.97 Da",
    sequenceConfirmed: "Pass",
    endotoxin: "< 1.0 EU/mg",
    sterility: "Pass",
    heavyMetals: "Pass",
    residualSolvents: "Pass",
    waterContent: "3.9%",
    notes: "DAC-modified CJC-1295. Extended half-life confirmed via pharmacokinetic data.",
  },
};

export default function COAPage() {
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProduct, setUploadProduct] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const coa = selectedProductId ? mockCOAs[selectedProductId] : null;

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <div
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
        style={{
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Certificate of Analysis
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Peptide purity, sequence verification & third-party lab results
          </p>
        </div>
        <button
          onClick={() => { setShowUploadModal(true); setUploadDone(false); setUploadFile(null); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1d4ed8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-green)"; }}
        >
          <Plus size={12} />
          Upload COA
        </button>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left panel: Product list */}
        <div
          className="w-[300px] flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          <div className="p-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-green)"; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.map((product) => {
              const hasCOA = !!mockCOAs[product.id];
              const isSelected = selectedProductId === product.id;
              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className="w-full text-left px-4 py-3 transition-colors"
                  style={{
                    backgroundColor: isSelected ? "var(--badge-shipped-bg)" : "transparent",
                    borderBottom: "1px solid var(--row-border)",
                    borderLeft: isSelected ? "2px solid var(--accent-green)" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--hover-min)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className="text-xs font-medium truncate flex-1 mr-2"
                      style={{ color: isSelected ? "var(--accent-green-bright)" : "var(--text-primary)" }}
                    >
                      {product.name}
                    </p>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: hasCOA ? "var(--badge-shipped-bg)" : "rgba(220,38,38,0.12)",
                        color: hasCOA ? "var(--badge-shipped-color)" : "#f87171",
                      }}
                    >
                      {hasCOA ? "COA" : "Missing"}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono" style={{ color: "var(--text-subtle)" }}>
                    {product.sku}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel: COA detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedProduct ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-base font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowUploadModal(true); setUploadProduct(String(selectedProductId)); setUploadDone(false); setUploadFile(null); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Upload size={12} />
                    Upload PDF
                  </button>
                  {coa && (
                    <button
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                    >
                      <FileText size={12} />
                      View PDF
                    </button>
                  )}
                </div>
              </div>

              {coa ? (
                <div className="space-y-4">
                  {/* Lab Info */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                      Lab Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: "Batch Number", value: coa.batchNumber },
                        { label: "Test Date", value: coa.testDate },
                        { label: "Laboratory", value: coa.labName },
                      ].map((field) => (
                        <div key={field.label}>
                          <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-subtle)" }}>
                            {field.label}
                          </p>
                          <p className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peptide Analysis */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-2">
                        <FlaskConical size={13} />
                        Peptide Analysis (HPLC / Mass Spec)
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Purity (HPLC)", value: coa.purity, color: parseFloat(coa.purity) >= 98 ? "var(--accent-green-bright)" : "#facc15" },
                        { label: "Molecular Weight", value: coa.molecularWeight, color: "var(--text-primary)" },
                        { label: "Sequence Verification (MS)", value: coa.sequenceConfirmed, color: coa.sequenceConfirmed === "Pass" ? "var(--accent-green-bright)" : "#f87171" },
                        { label: "Water Content (KF)", value: coa.waterContent, color: "var(--text-primary)" },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                        >
                          <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-subtle)" }}>
                            {field.label}
                          </p>
                          <p className="text-sm font-mono font-semibold" style={{ color: field.color }}>
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Tests */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                      Safety & Contaminant Testing
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Endotoxin", value: coa.endotoxin, pass: coa.endotoxin.includes("<") },
                        { label: "Sterility", value: coa.sterility, pass: coa.sterility === "Pass" },
                        { label: "Heavy Metals", value: coa.heavyMetals, pass: coa.heavyMetals === "Pass" },
                        { label: "Residual Solvents", value: coa.residualSolvents, pass: coa.residualSolvents === "Pass" },
                      ].map((test) => (
                        <div
                          key={test.label}
                          className="p-3 rounded-lg text-center"
                          style={{
                            backgroundColor: test.pass ? "var(--badge-completed-bg)" : "var(--badge-cancelled-bg)",
                            border: `1px solid ${test.pass ? "var(--badge-completed-border)" : "var(--badge-cancelled-border)"}`,
                          }}
                        >
                          <p className="text-sm font-semibold mb-1" style={{ color: test.pass ? "var(--badge-completed-color)" : "var(--badge-cancelled-color)" }}>
                            {test.pass ? "✓" : "✗"}
                          </p>
                          <p className="text-[10px] font-medium" style={{ color: test.pass ? "var(--badge-completed-color)" : "var(--badge-cancelled-color)" }}>
                            {test.value}
                          </p>
                          <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {test.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {coa.notes && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                        Notes
                      </h3>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {coa.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-xl p-12 text-center"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px dashed var(--border)" }}
                >
                  <FileText size={32} className="mx-auto mb-3" style={{ color: "var(--text-subtle)" }} />
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                    No COA for this product
                  </p>
                  <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                    Upload a third-party certificate of analysis to attach to this product
                  </p>
                  <button
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}
                  >
                    <Upload size={12} />
                    Upload COA
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText size={40} style={{ color: "var(--text-subtle)" }} />
              <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                Select a product to view its COA
              </p>
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowUploadModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Upload COA</h2>
              <button onClick={() => setShowUploadModal(false)} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            {uploadDone ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)" }}>
                  <FlaskConical size={20} style={{ color: "var(--accent-green-bright)" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>COA Uploaded</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{uploadFile?.name} attached successfully</p>
                <button onClick={() => setShowUploadModal(false)} className="mt-4 px-4 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--accent-green)", color: "#fff" }}>Done</button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Product</label>
                    <select
                      value={uploadProduct}
                      onChange={(e) => setUploadProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>COA PDF</label>
                    <div
                      className="rounded-lg p-6 text-center cursor-pointer"
                      style={{ backgroundColor: "var(--bg-card)", border: `2px dashed ${uploadFile ? "var(--accent-green)" : "var(--border)"}` }}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload size={20} className="mx-auto mb-2" style={{ color: uploadFile ? "var(--accent-green-bright)" : "var(--text-muted)" }} />
                      <p className="text-xs" style={{ color: uploadFile ? "var(--accent-green-bright)" : "var(--text-muted)" }}>
                        {uploadFile ? uploadFile.name : "Click to select PDF"}
                      </p>
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={() => setShowUploadModal(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Cancel</button>
                  <button
                    onClick={() => { if (uploadFile) setUploadDone(true); }}
                    disabled={!uploadFile}
                    className="flex-1 py-2 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: uploadFile ? "var(--accent-green)" : "var(--bg-card)", color: uploadFile ? "#fff" : "var(--text-subtle)", border: uploadFile ? "none" : "1px solid var(--border)" }}
                  >
                    Upload COA
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
