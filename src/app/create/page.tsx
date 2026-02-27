'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useComicStore } from '@/store/comic-store';

const TONES = ['romantic', 'funny', 'dramatic', 'kids'] as const;
const STYLES = ['western', 'manga', 'cinematic', 'watercolor'] as const;

export default function CreatePage() {
  const router = useRouter();
  const { credits, createProject, useCredits } = useComicStore();
  
  const [story, setStory] = useState('');
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState<typeof TONES[number]>('funny');
  const [style, setStyle] = useState<typeof STYLES[number]>('western');
  const [language, setLanguage] = useState('English');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!story.trim()) return;
    
    // Check credits (2 for story structuring)
    if (credits < 2) {
      alert('Not enough credits! You need at least 2 credits to create a comic.');
      return;
    }

    setIsCreating(true);

    // Create project
    const projectId = createProject({
      title: title || 'Untitled Comic',
      story,
      tone,
      style,
      language,
    });

    // Use credits for story structuring
    useCredits(2);

    // Navigate to editor
    router.push(`/comic/${projectId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🍌</span>
            <span className="text-xl font-bold">Nano Banana</span>
          </Link>
          <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full font-semibold">
            🪙 {credits} Credits
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Create Your Comic</h1>
        <p className="text-gray-400 mb-8">Tell us your story and we&apos;ll turn it into a comic book.</p>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Comic Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Comic"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition"
            />
          </div>

          {/* Story */}
          <div>
            <label className="block text-sm font-semibold mb-2">Your Story *</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Write your story here... Be as descriptive as you want! Include character descriptions, settings, dialogue, and plot points."
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              Tip: Include character names and descriptions for better results.
            </p>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tone</label>
            <div className="grid grid-cols-4 gap-3">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-3 px-4 rounded-lg font-medium capitalize transition ${
                    tone === t
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {t === 'romantic' && '💕 '}
                  {t === 'funny' && '😂 '}
                  {t === 'dramatic' && '🎭 '}
                  {t === 'kids' && '🧸 '}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-semibold mb-2">Art Style</label>
            <div className="grid grid-cols-4 gap-3">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-3 px-4 rounded-lg font-medium capitalize transition ${
                    style === s
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {s === 'western' && '🦸 '}
                  {s === 'manga' && '🎌 '}
                  {s === 'cinematic' && '🎬 '}
                  {s === 'watercolor' && '🎨 '}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          {/* Cost Preview */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Credit Cost Preview</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Story structuring</span>
                <span>2 credits</span>
              </div>
              <div className="flex justify-between">
                <span>Panel generation (~10 panels)</span>
                <span>~30 credits</span>
              </div>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between font-semibold text-white">
                <span>Estimated total</span>
                <span>~32 credits</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={!story.trim() || isCreating}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <span className="animate-spin">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <span>🍌</span>
                Create Comic (2 credits)
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
