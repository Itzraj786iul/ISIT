'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { persistAuthFromLogin } from '@/lib/client-auth';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import { Sparkles } from 'lucide-react';

/** Roles allowed on the public signup form (API also rejects any other role except student/parent). */
type SignupRole = 'Student' | 'Parent';
type SchoolMode = 'individual' | 'join';

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const tr = useT();

  const [role, setRole] = useState<SignupRole>('Student');
  const [schoolMode, setSchoolMode] = useState<SchoolMode>('individual');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    invite_code: '',
    academicLevel: '',
    childName: '',
    relationship: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (schoolMode === 'join' && !formData.invite_code.trim()) {
      return setError('Enter your school invite code');
    }

    setLoading(true);

    try {
      const response: Response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role.toLowerCase(),
          grade: formData.academicLevel,
          extra: formData,
          rememberMe,
          ...(schoolMode === 'join' && formData.invite_code.trim()
            ? { invite_code: formData.invite_code.trim() }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (typeof data.token === 'string' && data.token && data.user) {
        persistAuthFromLogin(data.token, data.user as Record<string, unknown>);
      }

      await refresh({ force: true });

      const userObj = data.user || { role };
      const roleKey = (userObj.role ?? role).toString().toLowerCase();
      if (roleKey === 'parent') {
        router.push('/parent/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-cyan-400/25 bg-slate-950/70 px-4 py-3 text-sm text-cyan-50 placeholder:text-cyan-200/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all';

  const toggleBtn = (active: boolean) =>
    `py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
      active
        ? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
        : 'border-cyan-400/20 bg-slate-950/50 text-cyan-100/70 hover:border-cyan-400/35'
    }`;

  return (
    <div className="isit-cosmic-bg min-h-screen flex flex-col text-cyan-50">
      <header className="relative z-[1] border-b border-cyan-400/15 bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-200 font-semibold transition-colors no-underline hover:text-cyan-100"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ISIC</span>
          </Link>
          <Link href="/" className="text-sm text-cyan-200/80 hover:text-cyan-100 no-underline">
            {tr('funnelBackHome')}
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative z-[1]">
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-center p-10 xl:p-16 border-r border-cyan-400/10 bg-gradient-to-br from-cyan-950/45 via-slate-950/30 to-transparent">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/90 mb-3">{tr('signupAsideEyebrow')}</p>
            <h2 className="text-3xl xl:text-4xl font-bold text-cyan-50 mb-4 leading-tight">{tr('signupAsideTitle')}</h2>
            <p className="text-sm leading-relaxed text-cyan-100/80 xl:text-base">{tr('signupAsideBody')}</p>
            <p className="mt-6 text-sm text-cyan-100/65">
              <Link href="/how-it-works" className="font-medium text-cyan-300 underline-offset-2 hover:underline">
                {tr('footerHowItWorksLink')}
              </Link>
              <span className="text-cyan-100/55">{tr('signupAsidePreview')}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
          <div className="w-full max-w-md isit-glass rounded-3xl p-8 sm:p-10">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-cyan-300/90 uppercase tracking-widest block mb-1">
                {role.toLowerCase()}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-cyan-50">Join us</h1>
              <p className="text-sm text-cyan-100/70 mt-1">Start your learning journey today</p>

              <div className="mt-6 flex justify-center relative group cursor-pointer">
                <input
                  type="file"
                  className="absolute inset-0 w-20 h-20 opacity-0 cursor-pointer z-10"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div
                  className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${
                    profileImage
                      ? 'border-solid border-cyan-400/60'
                      : 'border-cyan-400/30 group-hover:border-cyan-400/50 bg-slate-950/50'
                  }`}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-center text-[10px] text-cyan-200/70 group-hover:text-cyan-100 font-medium leading-tight px-1">
                      {tr('signupPhotoHint')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              {error && (
                <div role="alert" className="p-3 text-sm text-red-200 bg-red-950/50 rounded-xl border border-red-400/30">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-cyan-200/80 mb-2 uppercase tracking-wide">I am a…</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Student', 'Parent'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={toggleBtn(role === item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-cyan-100/60 mt-2 leading-relaxed">
                  Teachers are onboarded by their institution. If you teach at a school using ISIC, ask your administrator
                  for an account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-200/80 mb-2 uppercase tracking-wide">Account type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSchoolMode('individual');
                      setFormData((f) => ({ ...f, invite_code: '' }));
                    }}
                    className={toggleBtn(schoolMode === 'individual')}
                  >
                    Learn individually
                  </button>
                  <button type="button" onClick={() => setSchoolMode('join')} className={toggleBtn(schoolMode === 'join')}>
                    Join a school
                  </button>
                </div>
                {schoolMode === 'join' && (
                  <input
                    type="text"
                    name="invite_code"
                    autoComplete="off"
                    placeholder="School invite code"
                    value={formData.invite_code}
                    onChange={handleChange}
                    className={`${inputClass} mt-3`}
                  />
                )}
              </div>

              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-200/85">
                  {tr('labelFullName')}
                </label>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  placeholder="Priya Sharma"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-200/85">
                  {tr('labelEmail')}
                </label>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-200/85">
                  {tr('labelPassword')}
                </label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="signup-confirm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cyan-200/85">
                  {tr('labelConfirmPassword')}
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {role === 'Student' && (
                <div className="space-y-3 pt-2">
                  <select
                    name="academicLevel"
                    value={formData.academicLevel}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Academic Level
                    </option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                  </select>
                </div>
              )}

              {role === 'Parent' && (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    name="childName"
                    placeholder="Child's Name"
                    value={formData.childName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Relationship
                    </option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer select-none mt-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-cyan-400/40 bg-slate-950/80 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="text-sm text-cyan-100/80">Remember me on this device</span>
              </label>

              <p className="text-center text-xs leading-relaxed text-cyan-100/65">
                {tr('authSignupAgreementPrefix')}{' '}
                <Link href="/terms" className="font-semibold text-cyan-300 underline-offset-2 hover:text-cyan-200 hover:underline">
                  {tr('termsLink')}
                </Link>{' '}
                {tr('authAgreementAnd')}{' '}
                <Link href="/privacy" className="font-semibold text-cyan-300 underline-offset-2 hover:text-cyan-200 hover:underline">
                  {tr('privacyLink')}
                </Link>
                .
              </p>

              <button type="submit" disabled={loading} className="isit-btn-primary w-full min-h-11 mt-1 disabled:opacity-50">
                {loading ? 'Creating account…' : 'Create account'}
              </button>

              <p className="text-center text-xs text-cyan-100/65 mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-cyan-300 font-semibold hover:text-cyan-200 underline-offset-2 hover:underline">
                  {tr('logIn')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
