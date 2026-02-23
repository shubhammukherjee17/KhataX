'use client';

import { useAuth } from '@/hooks/useAuth';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your business profile and preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Business Profile</h2>
          <p className="text-sm text-slate-500 mb-6">Update your company details and GST information.</p>

          <form className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Business Name</label>
                <input 
                  defaultValue="My Business"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">GSTIN / Tax ID</label>
                <input 
                  defaultValue="29ABCDE1234F1Z5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Registered Address</label>
                <textarea 
                  rows={3}
                  defaultValue="123 Business Park, Tech City"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                type="button" 
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                <Save className="h-4 w-4" /> Save Profile
              </button>
            </div>
          </form>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-800">User Account</h2>
          <p className="text-sm text-slate-500 mb-6">Your personal account details.</p>

          <div className="max-w-2xl space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-900">Name</p>
                <p className="text-sm text-slate-500">{profile?.name || 'User'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-900">Email Address</p>
                <p className="text-sm text-slate-500">{profile?.email || 'email@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
