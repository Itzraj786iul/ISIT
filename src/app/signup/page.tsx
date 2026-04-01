'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { persistAuthFromLogin } from '@/lib/client-auth';

type Role = 'Student' | 'Parent' | 'Teacher';

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('Student');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subject: '',
    experience: '',
    academicLevel: '',
    institutionCode: '',
    childName: '',
    relationship: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload (Preview only for MVP)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL to preview the image
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      console.log("File selected (Preview only):", file.name);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      // Sending data. Note: Image URL is NOT sent to backend in this MVP
      const response: Response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role,
            grade: formData.academicLevel,
            extra: formData,
            rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (typeof data.token === 'string' && data.token && data.user) {
        persistAuthFromLogin(data.token, data.user as Record<string, unknown>);
      }

      const userObj = data.user || { role };
      const roleKey = (userObj.role ?? 'Student').toString().toLowerCase();
      if (roleKey === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (roleKey === 'parent') {
        router.push('/parent/dashboard');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Unified Input Style
  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-all text-gray-700 placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

       {/* ================= SIMPLE HEADER ================= */}
       <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center">
           <Link href="/" className="text-sky-500 font-bold text-xl flex items-center gap-2 hover:text-sky-600">
             ISIT <span className="text-xs text-gray-400 font-normal ml-2">← Back to Home</span>
           </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* LEFT SIDE */}
        <div className="hidden lg:block w-1/2 bg-gradient-to-br from-sky-500 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold">I</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">Join ISIT</h2>
              <p className="text-sky-100 text-sm max-w-sm">Start your learning journey with AI-powered tutoring, structured curriculum, and progress tracking.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 lg:px-20 bg-white">
          <div className="w-full max-w-md">

            {/* HEADER SECTION */}
            <div className="text-center mb-6">
              
              {/* BREADCRUMB */}
              <span className="text-xs font-bold text-sky-500 uppercase tracking-widest block mb-1">
                Group - {role.toLowerCase()}
              </span>
              
              {/* TITLE */}
              <h1 className="text-3xl font-bold text-gray-900">
                Join Us
              </h1>
              
              {/* SUBTITLE */}
              <p className="text-sm text-gray-500 mt-1">
                Start your learning journey today
              </p>

              {/* UPLOAD PROFILE PICTURE (Working Preview) */}
              <div className="mt-6 flex justify-center relative group cursor-pointer">
                <input 
                  type="file" 
                  className="absolute inset-0 w-20 h-20 opacity-0 cursor-pointer z-10"
                  accept="image/*"
                  onChange={handleFileChange} 
                />
                <div className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${profileImage ? 'border-solid border-sky-500' : 'border-gray-300 group-hover:border-sky-500 bg-gray-50'}`}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500 group-hover:text-sky-500 font-medium">Upload</span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-3">

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* ROLE SELECTOR */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Student', 'Parent', 'Teacher'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item as Role)}
                      className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all
                        ${
                          role === item
                            ? 'border-sky-600 bg-sky-600 text-white shadow-md'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUTS WITH TEXT INSIDE BOX */}
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                required
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass}
              />

              {/* ROLE SPECIFIC FIELDS */}
              
              {role === 'Teacher' && (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject Expertise"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" disabled>Years of Experience</option>
                    <option>1-2 years</option>
                    <option>3-5 years</option>
                    <option>5+ years</option>
                  </select>
                </div>
              )}

              {role === 'Student' && (
                <div className="space-y-3 pt-2">
                  <select
                    name="academicLevel"
                    value={formData.academicLevel}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" disabled>Academic Level</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                  </select>
                  <input
                    type="text"
                    name="institutionCode"
                    placeholder="Institution Code (Optional)"
                    value={formData.institutionCode}
                    onChange={handleChange}
                    className={inputClass}
                  />
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
                    <option value="" disabled>Relationship</option>
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
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-600">Remember me on this device</span>
              </label>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 font-bold mt-2 shadow-lg shadow-sky-500/25"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* FOOTER LINK */}
              <p className="text-center text-xs text-gray-500 mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-sky-600 font-semibold hover:text-sky-800">
                  Sign in
                </Link>
              </p>

            </form>
          </div>
      </div>
    </div>
    </div>
  );
}