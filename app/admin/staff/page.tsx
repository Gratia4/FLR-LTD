"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Key, Plus, ShieldCheck, UserCircle, UsersThree } from "@phosphor-icons/react";
import { ConsoleShell } from "@/components/console-shell";
import { Banner, EmptyState, Metric, Sheet, SkeletonRows, StatusPill, useToast } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { dateTime, humanise, initials } from "@/lib/format";
import { useAdminSession } from "@/lib/use-session";

type StaffRole = "SUPER_ADMIN" | "SALES_MANAGER" | "CONTENT_MANAGER" | "LOGISTICS" | "FINANCE";
type Staff = {
  id: string;
  email: string;
  full_name: string;
  job_title: string;
  phone: string;
  role: StaffRole;
  is_active: boolean;
  last_login_at: string | null;
  must_change_password: boolean;
  created_at: string;
};

const roles: Array<{ value: StaffRole; label: string }> = [
  { value: "SALES_MANAGER", label: "Sales manager" },
  { value: "CONTENT_MANAGER", label: "Content manager" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "FINANCE", label: "Finance" },
  { value: "SUPER_ADMIN", label: "Super administrator" },
];

export default function StaffPage() {
  const { user, logout, can } = useAdminSession();
  const toast = useToast();
  const [rows, setRows] = useState<Staff[]>([]);
  const [invite, setInvite] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api.get<{ data: Staff[] }>("/api/v1/admin/staff")
      .then((result) => setRows(result.data))
      .catch((cause) => setError(errorMessage(cause, "Staff accounts could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await api.post<{ message: string }>("/api/v1/admin/staff", {
        email: form.get("email"),
        fullName: form.get("fullName"),
        jobTitle: form.get("jobTitle"),
        phone: form.get("phone"),
        role: form.get("role"),
      });
      toast.success(result.message);
      setInvite(false);
      load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.patch(`/api/v1/admin/staff/${selected.id}`, {
        fullName: form.get("fullName"),
        jobTitle: form.get("jobTitle"),
        phone: form.get("phone"),
        role: form.get("role"),
        isActive: form.get("isActive") === "on",
      });
      toast.success("Staff access updated.");
      setSelected(null);
      load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    if (!selected || !window.confirm(`Send a new one-time password to ${selected.email}?`)) return;
    setSaving(true);
    try {
      const result = await api.post<{ message: string }>(`/api/v1/admin/staff/${selected.id}/reset-password`, {});
      toast.success(result.message);
      setSelected(null);
      load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ConsoleShell user={user} active="staff" onLogout={logout} can={can}>
      <div className="page-head"><div><h1>Staff & access</h1><p>Create, update, suspend, and recover role-scoped management accounts.</p></div><button className="btn btn-primary" onClick={() => setInvite(true)}><Plus/>Invite staff member</button></div>
      {error && <Banner tone="error" action={<button className="btn btn-secondary" onClick={load}>Retry</button>}>{error}</Banner>}
      <div className="metric-row cols-3"><Metric icon={UsersThree} label="Active staff" value={rows.filter((row) => row.is_active).length}/><Metric icon={ShieldCheck} label="Super administrators" value={rows.filter((row) => row.role === "SUPER_ADMIN" && row.is_active).length} accent="blue"/><Metric icon={UserCircle} label="Pending password change" value={rows.filter((row) => row.must_change_password).length} accent="gold"/></div>
      <section className="card">{loading ? <SkeletonRows/> : rows.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Team member</th><th>Role</th><th>Phone</th><th>Last sign in</th><th>Status</th></tr></thead><tbody>{rows.map((row) => <tr className="is-clickable" key={row.id} onClick={() => setSelected(row)}><td><div className="cell-with-avatar"><span className="avatar-chip">{initials(row.full_name)}</span><span className="cell-strong">{row.full_name}<span className="cell-sub">{row.email} · {row.job_title}</span></span></div></td><td>{humanise(row.role)}</td><td>{row.phone}</td><td>{dateTime(row.last_login_at)}</td><td><StatusPill tone={row.is_active ? "ok" : "danger"}>{row.is_active ? "Active" : "Inactive"}</StatusPill>{row.must_change_password && <span className="cell-sub">Password change required</span>}</td></tr>)}</tbody></table></div> : <EmptyState icon={UsersThree} title="No staff accounts" message="Invite the first operational team member."/>}</section>

      {invite && <Sheet eyebrow="Access control" title="Invite staff member" subtitle="A one-time password will be emailed to this person." onClose={() => setInvite(false)} footer={<button form="staff-invite" className="btn btn-primary" disabled={saving}>{saving ? "Sending invitation…" : "Create account & invite"}</button>}><form id="staff-invite" className="form-grid" onSubmit={create}><label className="field"><span>Full name</span><input className="input" name="fullName" required/></label><label className="field"><span>Email</span><input className="input" name="email" type="email" required/></label><label className="field"><span>Job title</span><input className="input" name="jobTitle" required/></label><label className="field"><span>Phone</span><input className="input" name="phone" type="tel" required/></label><label className="field span-2"><span>Role</span><select className="select" name="role" required defaultValue=""><option value="" disabled>Select permissions</option>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label></form></Sheet>}

      {selected && <Sheet eyebrow="Staff access" title={selected.full_name} subtitle={selected.email} onClose={() => setSelected(null)} footer={<><button className="btn btn-secondary" disabled={saving} onClick={resetPassword}><Key/>Reset password</button><button form="staff-edit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save access"}</button></>}><form id="staff-edit" className="form-grid" onSubmit={update}><label className="field"><span>Full name</span><input className="input" name="fullName" defaultValue={selected.full_name} required/></label><label className="field"><span>Email</span><input className="input" value={selected.email} disabled/></label><label className="field"><span>Job title</span><input className="input" name="jobTitle" defaultValue={selected.job_title} required/></label><label className="field"><span>Phone</span><input className="input" name="phone" type="tel" defaultValue={selected.phone} required/></label><label className="field span-2"><span>Role</span><select className="select" name="role" defaultValue={selected.role}>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label><label className="check span-2"><input name="isActive" type="checkbox" defaultChecked={selected.is_active}/><span>Account is active</span></label></form>{selected.id === user?.id && <Banner tone="info">You cannot deactivate or demote your own super-administrator account.</Banner>}</Sheet>}
    </ConsoleShell>
  );
}
