'use client';

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Store,
  User,
  Phone,
  Facebook,
  Upload,
  QrCode,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RegistrationStatus {
  status: 'pending' | 'approved' | 'rejected';
  shopName?: string;
  message?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  facebookUrl: string;
  shopName: string;
  shopLogo: string;
  qrCodeImage: string;
  walletPhone: string;
}

const initialForm: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  facebookUrl: '',
  shopName: '',
  shopLogo: '',
  qrCodeImage: '',
  walletPhone: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBanner({ reg }: { reg: RegistrationStatus }) {
  if (reg.status === 'pending') {
    return (
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
        <Clock className="mx-auto mb-3 h-12 w-12 text-yellow-400" />
        <h2 className="text-xl font-bold text-yellow-300">
          รอการอนุมัติ
        </h2>
        <p className="mt-2 text-sm text-yellow-200/70">
          คำขอสมัครตัวแทนขายร้าน{' '}
          <span className="font-semibold text-yellow-200">
            {reg.shopName}
          </span>{' '}
          กำลังรอแอดมินตรวจสอบ
        </p>
      </div>
    );
  }

  if (reg.status === 'approved') {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
        <h2 className="text-xl font-bold text-emerald-300">
          อนุมัติแล้ว
        </h2>
        <p className="mt-2 text-sm text-emerald-200/70">
          คุณได้รับการอนุมัติเป็นตัวแทนขายเรียบร้อยแล้ว
        </p>
      </div>
    );
  }

  // rejected
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <XCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
      <h2 className="text-xl font-bold text-red-300">ไม่อนุมัติ</h2>
      <p className="mt-2 text-sm text-red-200/70">
        {reg.message ?? 'คำขอของคุณถูกปฏิเสธ กรุณาติดต่อแอดมิน'}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image upload field
// ---------------------------------------------------------------------------

function ImageUploadField({
  label,
  icon: Icon,
  value,
  uploading,
  onPick,
}: {
  label: string;
  icon: typeof Upload;
  value: string;
  uploading: boolean;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Icon className="h-4 w-4 text-cyan-400" />
        {label}
      </label>

      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-40 w-40 rounded-xl border border-white/10 object-cover"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-xs text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
          >
            เปลี่ยนรูป
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 transition hover:border-cyan-500/40 hover:bg-white/10 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <Upload className="h-8 w-8" />
              <span className="text-xs">คลิกเพื่ออัปโหลด</span>
            </div>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ResellerRegisterPage() {
  // State ----------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<RegistrationStatus | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  // Check existing registration ------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/reseller/register');
        if (res.ok) {
          const data = await res.json();
          if (data?.status) {
            setExisting(data as RegistrationStatus);
          }
        }
      } catch {
        // No existing registration – show form
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handlers --------------------------------------------------------------
  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function uploadImage(
    file: File,
    type?: 'qr',
  ): Promise<string | null> {
    try {
      const base64 = await fileToBase64(file);
      const body: Record<string, string> = { image: base64 };
      if (type) body.type = type;
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url ?? data.imageUrl ?? null;
    } catch {
      setError('อัปโหลดรูปภาพไม่สำเร็จ');
      return null;
    }
  }

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const url = await uploadImage(file);
    if (url) setForm((prev) => ({ ...prev, shopLogo: url }));
    setUploadingLogo(false);
  }

  async function handleQrUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    const url = await uploadImage(file, 'qr');
    if (url) setForm((prev) => ({ ...prev, qrCodeImage: url }));
    setUploadingQr(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Client-side required validation
    const requiredFields: { key: keyof FormData; label: string }[] = [
      { key: 'firstName', label: 'ชื่อจริง' },
      { key: 'lastName', label: 'นามสกุลจริง' },
      { key: 'phone', label: 'เบอร์ติดต่อ' },
      { key: 'facebookUrl', label: 'ลิ้งเฟสบุ๊ค' },
      { key: 'shopName', label: 'ชื่อร้าน' },
      { key: 'walletPhone', label: 'เบอร์ TrueMoney Wallet' },
    ];

    const missing = requiredFields.filter((f) => !form[f.key].trim());
    if (missing.length > 0) {
      setError(`กรุณากรอก: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reseller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'เกิดข้อผิดพลาด');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  }

  // Render ----------------------------------------------------------------

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับ</span>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">
            สมัครตัวแทนขาย / ฝากขาย
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Already registered */}
        {existing && !submitted && (
          <StatusBanner reg={existing} />
        )}

        {/* Success message after submit */}
        {submitted && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-400" />
            <h2 className="text-2xl font-bold text-emerald-300">
              ส่งคำขอเรียบร้อย!
            </h2>
            <p className="mt-3 text-zinc-300">
              รอแอดมินอนุมัติ — เราจะแจ้งผลให้ทราบโดยเร็วที่สุด
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับหน้าหลัก
            </Link>
          </div>
        )}

        {/* Registration form */}
        {!existing && !submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error banner */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* ── Section: Personal Info ── */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-zinc-200">
                <User className="h-5 w-5 text-cyan-400" />
                ข้อมูลส่วนตัว
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* ชื่อจริง */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">
                    ชื่อจริง <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={set('firstName')}
                      placeholder="ชื่อจริง"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>

                {/* นามสกุล */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">
                    นามสกุลจริง <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={set('lastName')}
                      placeholder="นามสกุล"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* เบอร์ติดต่อ */}
              <div className="mt-4 space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">
                  เบอร์ติดต่อ <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="0xx-xxx-xxxx"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              {/* ลิ้งเฟสบุ๊ค */}
              <div className="mt-4 space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">
                  ลิ้งเฟสบุ๊ค <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Facebook className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="url"
                    value={form.facebookUrl}
                    onChange={set('facebookUrl')}
                    placeholder="https://facebook.com/..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>
            </section>

            {/* ── Section: Shop Info ── */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-zinc-200">
                <Store className="h-5 w-5 text-cyan-400" />
                ข้อมูลร้านค้า
              </h2>

              {/* ชื่อร้าน */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">
                  ชื่อร้าน <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={set('shopName')}
                    placeholder="ชื่อร้านของคุณ"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              {/* โลโก้ร้าน */}
              <div className="mt-5">
                <ImageUploadField
                  label="โลโก้ร้าน (ไม่บังคับ)"
                  icon={Upload}
                  value={form.shopLogo}
                  uploading={uploadingLogo}
                  onPick={handleLogoUpload}
                />
              </div>
            </section>

            {/* ── Section: Payment Info ── */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-zinc-200">
                <Wallet className="h-5 w-5 text-cyan-400" />
                ข้อมูลการรับเงิน
              </h2>

              {/* เบอร์ TrueMoney Wallet */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">
                  เบอร์ TrueMoney Wallet{' '}
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="tel"
                    value={form.walletPhone}
                    onChange={set('walletPhone')}
                    placeholder="0xx-xxx-xxxx"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              {/* QR Code รับเงิน */}
              <div className="mt-5">
                <ImageUploadField
                  label="QR Code รับเงิน (ไม่บังคับ)"
                  icon={QrCode}
                  value={form.qrCodeImage}
                  uploading={uploadingQr}
                  onPick={handleQrUpload}
                />
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || uploadingLogo || uploadingQr}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังส่งคำขอ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  สมัครตัวแทนขาย
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
