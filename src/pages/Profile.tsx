import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { updateUserProfileData } from '../lib/firebase';
import { Camera, Save, User as UserIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Profile = () => {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.name || user?.displayName || '');
  const [avatarPrompt, setAvatarPrompt] = useState('A cool pixel art cyberpunk character');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [localPhoto, setLocalPhoto] = useState(profile?.photoURL || user?.photoURL || '');

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: avatarPrompt })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setLocalPhoto(data.imageUrl);
      } else {
        alert(data.error || 'Failed to generate avatar');
      }
    } catch (e: any) {
      alert('Error generating avatar: ' + e.message);
    }
    setIsGenerating(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateUserProfileData(user.uid, {
        displayName,
        photoURL: localPhoto
      });
      alert('Profile updated successfully!');
    } catch (e: any) {
      alert('Error saving profile: ' + e.message);
    }
    setIsUpdating(false);
  };

  if (!user) return <div className="text-white text-center mt-10">Please sign in to view your profile.</div>;

  return (
    <div className="max-w-2xl mx-auto drop-shadow-md">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#050B20] border border-blue-900/50 p-8 rounded-3xl"
      >
        <h2 className="text-3xl font-black text-cyan-50 mb-8 flex items-center gap-3">
          <UserIcon className="text-cyan-400 w-8 h-8" />
          User Profile
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-800 bg-[#0B1536] shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                {localPhoto ? (
                  <img src={localPhoto} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-full h-full p-6 text-blue-500" />
                )}
              </div>
            </div>
            
            <div className="w-full">
              <label className="block text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">AI Avatar Prompt</label>
              <textarea 
                value={avatarPrompt}
                onChange={e => setAvatarPrompt(e.target.value)}
                className="w-full bg-[#0A102E] border border-blue-800 text-blue-50 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500 resize-none h-20 mb-2"
                placeholder="Describe your perfect avatar..."
              />
              <button
                onClick={handleGenerateAvatar}
                disabled={isGenerating || !avatarPrompt}
                className="w-full flex items-center justify-center gap-2 bg-blue-900/50 hover:bg-blue-800 text-cyan-200 py-2 rounded-lg border border-blue-700/50 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Generate AI Avatar'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Display Name</label>
              <input 
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-[#0A102E] border border-blue-800 text-blue-50 rounded-lg p-4 focus:outline-none focus:border-cyan-500 text-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Email Address</label>
              <input 
                type="email"
                value={user.email || ''}
                readOnly
                className="w-full bg-[#0B1536] border border-blue-900/50 text-blue-300/50 rounded-lg p-4 focus:outline-none text-lg cursor-not-allowed"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(34,211,238,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
