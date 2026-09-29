"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Eye, FilePdf, Files, MagnifyingGlass, ShieldCheck, WarningCircle, XCircle } from "@phosphor-icons/react";
import { ConsoleShell } from "@/components/console-shell";
import { Banner, EmptyState, Metric, Sheet, SkeletonRows, StatusPill, useToast } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { dateTime, fileSize, humanise } from "@/lib/format";
import { useAdminSession } from "@/lib/use-session";

type Document = {
  id: string;
  type: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  provider: string;
  verified_at: string | null;
  rejection_reason: string | null;
  verified_by_name: string | null;
  uploaded_at: string;
  business_id: string;
  business_name: string;
  business_status: string;
};

export default function DocumentsPage() {
  const { user, logout, can } = useAdminSession();
  const toast = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selected, setSelected] = useState<Document | null>(null);
  const [search, setSearch] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api.get<{ data: Document[] }>("/api/v1/admin/documents")
      .then((result) => setDocuments(result.data))
      .catch((cause) => setError(errorMessage(cause, "Documents could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const visible = useMemo(
    () => documents.filter((item) => `${item.original_name} ${item.business_name} ${item.type}`.toLowerCase().includes(search.toLowerCase())),
    [documents, search],
  );

  function open(document: Document) {
    setSelected(document);
    setRejecting(false);
    setRejectionReason("");
  }

  async function preview() {
    if (!selected) return;
    setSaving(true);
    try {
      const result = await api.get<{ data: { url: string } }>(`/api/v1/documents/${selected.id}/link`);
      window.open(result.data.url, "_blank", "noopener,noreferrer");
    } catch (cause) {
      toast.error(errorMessage(cause, "The document could not be opened."));
    } finally {
      setSaving(false);
    }
  }

  async function review(verified: boolean) {
    if (!selected) return;
    if (!verified && !rejectionReason.trim()) {
      setRejecting(true);
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/v1/documents/${selected.id}/review`, {
        verified,
        rejectionReason: verified ? undefined : rejectionReason.trim(),
      });
      toast.success(verified ? "Document verified." : "Document returned with a review note.");
      setSelected(null);
      load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  const awaiting = documents.filter((item) => !item.verified_at && !item.rejection_reason).length;
  const rejected = documents.filter((item) => !!item.rejection_reason).length;

  return (
    <ConsoleShell user={user} active="documents" onLogout={logout} can={can}>
      <div className="page-head">
        <div><h1>Compliance documents</h1><p>Open, verify, and return registration evidence with a complete audit trail.</p></div>
      </div>
      {error && <Banner tone="error" action={<button className="btn btn-secondary" onClick={load}>Retry</button>}>{error}</Banner>}
      <div className="metric-row cols-4">
        <Metric icon={Files} label="Documents" value={documents.length}/>
        <Metric icon={ShieldCheck} label="Verified" value={documents.filter((item) => !!item.verified_at).length} accent="blue"/>
        <Metric icon={FilePdf} label="Awaiting review" value={awaiting} accent="gold"/>
        <Metric icon={XCircle} label="Returned" value={rejected} accent="danger"/>
      </div>
      <section className="card">
        <div className="toolbar"><label className="search-field"><MagnifyingGlass/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search file, type, or business"/></label></div>
        {loading ? <SkeletonRows/> : visible.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Document</th><th>Business</th><th>Uploaded</th><th>Storage</th><th>Status</th></tr></thead><tbody>{visible.map((item) => <tr className="is-clickable" key={item.id} onClick={() => open(item)}><td><span className="cell-strong">{item.original_name}<span className="cell-sub">{humanise(item.type)} · {fileSize(item.size_bytes)}</span></span></td><td>{item.business_name}<span className="cell-sub">Account {humanise(item.business_status)}</span></td><td>{dateTime(item.uploaded_at)}</td><td>{humanise(item.provider)}</td><td>{item.verified_at ? <StatusPill tone="ok">Verified</StatusPill> : item.rejection_reason ? <StatusPill tone="danger">Returned</StatusPill> : <StatusPill tone="warn">Review required</StatusPill>}</td></tr>)}</tbody></table></div> : <EmptyState icon={FilePdf} title="No documents found" message="Uploaded registration evidence will appear here."/>}
      </section>
      {selected && <Sheet eyebrow="Compliance review" title={selected.original_name} subtitle={`${selected.business_name} · ${humanise(selected.type)}`} onClose={() => setSelected(null)} footer={<><button className="btn btn-secondary" disabled={saving} onClick={preview}><Eye/>Open document</button>{!selected.verified_at && <>{rejecting ? <button className="btn btn-danger" disabled={saving || !rejectionReason.trim()} onClick={() => review(false)}>Return document</button> : <button className="btn btn-danger-soft" disabled={saving} onClick={() => setRejecting(true)}><WarningCircle/>Request correction</button>}<button className="btn btn-primary" disabled={saving} onClick={() => review(true)}><CheckCircle/>Verify document</button></>}</>}>
        <div className="detail-grid"><div><small>File type</small><b>{selected.mime_type}</b></div><div><small>Size</small><b>{fileSize(selected.size_bytes)}</b></div><div><small>Uploaded</small><b>{dateTime(selected.uploaded_at)}</b></div><div><small>Storage provider</small><b>{humanise(selected.provider)}</b></div></div>
        {selected.verified_at && <Banner tone="ok" title="Verified">Reviewed {dateTime(selected.verified_at)}{selected.verified_by_name ? ` by ${selected.verified_by_name}` : ""}.</Banner>}
        {selected.rejection_reason && <Banner tone="warn" title="Correction requested">{selected.rejection_reason}</Banner>}
        {rejecting && <label className="field"><span>Reason for correction</span><textarea className="textarea" rows={5} maxLength={500} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Explain what is missing, expired, or unreadable." autoFocus/></label>}
      </Sheet>}
    </ConsoleShell>
  );
}
