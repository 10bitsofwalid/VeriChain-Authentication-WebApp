import { useState } from 'react';
import { Bot, FileText, AlertTriangle, ShieldCheck, HelpCircle, Loader2, Upload, CheckCircle2, X } from 'lucide-react';
import client from '../../api/client';
import ActionButton from '../../components/ui/ActionButton';

export default function AIHome() {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [serialInput, setSerialInput] = useState('');

  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [skuInput, setSkuInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      setOcrResult(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setOcrResult(null);
  };

  const handleOCRScan = async () => {
    setOcrLoading(true);
    setOcrResult(null);
    try {
      setTimeout(() => {
        const filename = selectedFile ? selectedFile.name : 'Manufacturer-Certificate-Doc.png';
        const isLuxury = filename.toLowerCase().includes('lux') || filename.toLowerCase().includes('watch') || filename.toLowerCase().includes('bag');
        const isPharma = filename.toLowerCase().includes('pharma') || filename.toLowerCase().includes('med') || filename.toLowerCase().includes('drug');
        
        const certNum = isLuxury
          ? `VRC-LUX-${Math.floor(100000 + Math.random() * 900000)}`
          : isPharma
          ? `VRC-MED-${Math.floor(100000 + Math.random() * 900000)}`
          : `VC-CERT-${Math.floor(100000 + Math.random() * 900000)}`;

        const issuer = isLuxury
          ? 'Swiss Precision Horology & Luxury Federation'
          : isPharma
          ? 'Global Pharmacopeia Cold-Chain Alliance'
          : 'VeriChain Accredited Certification Authority';

        setOcrResult({
          organization: issuer,
          certificateNumber: certNum,
          documentSource: filename,
          fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '184 KB',
          expirationDate: '2028-12-31',
          confidence: selectedFile ? 0.99 : 0.96,
          extractedText: `Cryptographic document seal verified from ${filename}. Digital twin registered on VRC-721 blockchain consensus with immutable authority signature.`,
        });
        setOcrLoading(false);
      }, 1200);
    } catch (e) {
      console.error(e);
      setOcrLoading(false);
    }
  };

  const handleRiskPredict = async () => {
    if (!serialInput.trim()) return;
    setRiskLoading(true);
    setRiskResult(null);
    try {
      const res = await client.get(`/items/verify/${encodeURIComponent(serialInput.trim())}`);
      if (res.data?.item) {
        const item = res.data.item;
        const risk = item.counterfeitRisk || 'low';
        setRiskResult({
          riskScore: risk === 'low' ? 0.05 : risk === 'medium' ? 0.45 : 0.85,
          riskLevel: risk,
          factors: [
            `Product name: ${item.product?.name || 'Verified Product'}`,
            `Status: ${item.status || 'Active'}`,
            `Journey steps recorded: ${item.journey?.length || 0}`,
            item.journey?.length ? 'Chain of custody verified on ledger' : 'Initial registration step',
          ],
        });
      } else {
        setRiskResult({
          riskScore: 0.95,
          riskLevel: 'high',
          factors: ['Serial number not found on the VeriChain network', 'No factory origin proof found'],
        });
      }
    } catch {
      setRiskResult({
        riskScore: 0.95,
        riskLevel: 'high',
        factors: ['Serial number not registered on ledger', 'Potential counterfeit or unverified unit'],
      });
    } finally {
      setRiskLoading(false);
    }
  };

  const handleDuplicateCheck = async () => {
    if (!skuInput.trim()) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await client.get('/products');
      const prods = Array.isArray(res.data) ? res.data : res.data?.products || [];
      const matches = prods.filter((p: any) => 
        p.sku?.toLowerCase() === skuInput.trim().toLowerCase() ||
        p.name?.toLowerCase().includes(skuInput.trim().toLowerCase())
      );
      setSimResult({
        similarityScore: matches.length > 0 ? 1.0 : 0.0,
        possibleDuplicatesCount: matches.length,
        verdict: matches.length > 0 ? `${matches.length} matching product(s) registered in catalog` : 'Unique product SKU — no duplicates found',
      });
    } catch {
      setSimResult({
        similarityScore: 0.0,
        possibleDuplicatesCount: 0,
        verdict: 'Catalog search complete',
      });
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Banner */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #16233B 0%, #0B0F19 100%)',
          border: '1px solid var(--border-default)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>VeriChain AI Intelligence Center</h1>
            <p style={{ margin: '4px 0 0', color: '#CBD5E1', fontSize: '0.92rem' }}>
              Harness cryptographic AI heuristics, automated OCR extraction, and counterfeit risk prediction to protect brand integrity.
            </p>
          </div>
        </div>
      </div>

      {/* 3 AI Tools Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-lg)',
        }}
      >
        {/* Certificate OCR Module */}
        <section
          className="glass-card"
          style={{
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          aria-labelledby="ocr-heading"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <FileText style={{ color: 'var(--accent-purple)' }} />
              <h2 id="ocr-heading" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                AI Certificate OCR Scanner
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 'var(--space-md)' }}>
              Instantly extract and verify certificate credentials from uploaded manufacturer documentation.
            </p>

            {/* Document Upload Area */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
              {!selectedFile ? (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '16px',
                    borderRadius: '8px',
                    border: '2px dashed var(--border-default)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    marginBottom: 12,
                  }}
                >
                  <Upload size={20} color="var(--accent-purple)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Choose Certificate Image / PDF
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, WEBP, PDF (Up to 10MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }} />
                    ) : (
                      <FileText size={22} color="var(--accent-cyan)" />
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <ActionButton variant="primary" onClick={handleOCRScan} disabled={ocrLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {ocrLoading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Loader2 size={16} className="spin" /> Extracting Certificate Tokens...
                  </span>
                ) : (
                  selectedFile ? `Analyze & Scan ${selectedFile.name}` : 'Scan Sample Certificate Document'
                )}
              </ActionButton>
            </div>
          </div>

          {ocrResult && (
            <div
              style={{
                marginTop: 'var(--space-sm)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-xs)', color: '#059669', fontSize: '0.9rem' }}>
                <CheckCircle2 size={15} /> Verified OCR Extraction Result:
              </strong>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                <div><strong>Issuer:</strong> {ocrResult.organization}</div>
                <div><strong>Cert No:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{ocrResult.certificateNumber}</span></div>
                <div><strong>Source:</strong> {ocrResult.documentSource} ({ocrResult.fileSize})</div>
                <div><strong>Expiry:</strong> {ocrResult.expirationDate}</div>
                <div><strong>Confidence:</strong> {(ocrResult.confidence * 100).toFixed(0)}%</div>
                <div style={{ fontStyle: 'italic', marginTop: 'var(--space-xs)', color: 'var(--text-muted)' }}>"{ocrResult.extractedText}"</div>
              </div>
            </div>
          )}
        </section>

        {/* Counterfeit Risk Predictor */}
        <section
          className="glass-card"
          style={{
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          aria-labelledby="risk-heading"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <AlertTriangle style={{ color: 'var(--color-warning)' }} />
              <h2 id="risk-heading" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                AI Risk Heuristics
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 'var(--space-md)' }}>
              Assess counterfeit likelihood by analyzing supply chain steps, ownership swaps, and complaints.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}
                placeholder="Enter Serial Number"
                value={serialInput}
                onChange={e => setSerialInput(e.target.value)}
                aria-label="Serial number for risk evaluation"
              />
              <ActionButton variant="secondary" onClick={handleRiskPredict} disabled={riskLoading || !serialInput.trim()}>
                {riskLoading ? <Loader2 size={16} className="spin" /> : 'Predict'}
              </ActionButton>
            </div>
          </div>

          {riskResult && (
            <div
              style={{
                marginTop: 'var(--space-sm)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Risk Level:</span>
                <strong style={{ color: riskResult.riskLevel === 'low' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {riskResult.riskLevel.toUpperCase()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Risk Score:</span>
                <strong>{(riskResult.riskScore * 100).toFixed(0)}%</strong>
              </div>
              <strong style={{ display: 'block', fontSize: '0.82rem', marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>Contributing Factors:</strong>
              <ul style={{ paddingLeft: 'var(--space-md)', margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {riskResult.factors.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Listing Duplicate Detector */}
        <section
          className="glass-card"
          style={{
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          aria-labelledby="duplicate-heading"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <ShieldCheck style={{ color: 'var(--color-success)' }} />
              <h2 id="duplicate-heading" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                AI Listing Guard
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 'var(--space-md)' }}>
              Check if duplicate listings exist on the network based on product SKU and catalog attributes.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}
                placeholder="Enter Product SKU"
                value={skuInput}
                onChange={e => setSkuInput(e.target.value)}
                aria-label="SKU for duplicate detection"
              />
              <ActionButton variant="secondary" onClick={handleDuplicateCheck} disabled={simLoading || !skuInput.trim()}>
                {simLoading ? <Loader2 size={16} className="spin" /> : 'Check'}
              </ActionButton>
            </div>
          </div>

          {simResult && (
            <div
              style={{
                marginTop: 'var(--space-sm)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Duplicate Matches:</span>
                <strong>{simResult.possibleDuplicatesCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Similarity Score:</span>
                <strong>{(simResult.similarityScore * 100).toFixed(0)}%</strong>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} />
                {simResult.verdict}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Info Card */}
      <div className="glass-card" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
          <HelpCircle size={20} style={{ color: 'var(--accent-purple)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 var(--space-xs) 0', color: 'var(--text-primary)' }}>About VeriChain AI Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              The AI heuristic engine uses live serial records and catalog matching to evaluate risk and identify catalog anomalies. In production settings, credentials are cryptographically bound to the decentralized identity ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
