import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { User, Mail, Info } from 'lucide-react';

const Settings = () => {
  // Pull the current user's data from your global state
  const { user } = useAppStore();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Account Profile</h2>
        
        <div className="space-y-6">
          {/* Read-Only Profile Display */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Full Name</p>
              <p className="text-lg font-bold text-gray-900">{user?.name || 'Loading...'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Email Address</p>
              <p className="text-lg font-bold text-gray-900">{user?.email || 'Loading...'}</p>
            </div>
          </div>

          {/* Future Update Prompt */}
          <div className="mt-8 flex items-start gap-3 bg-blue-50 text-blue-800 p-5 rounded-xl border border-blue-200">
            <Info className="w-6 h-6 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="font-bold mb-1">Editing Disabled</h3>
              <p className="text-sm leading-relaxed text-blue-700">
                Profile editing functionality is in a future update. Your current details are locked to ensure campus marketplace security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;