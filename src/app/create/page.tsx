'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useComicStore } from '@/store/comic-store';

const TONES = ['romantic', 'funny', 'dramatic', 'kids'] as const;
const STYLES = ['western', 'manga', 'cinematic', 'watercolor'] as const;

interface CharacterUpload {
  id: string;
  name: string;
  images: string[]; // Base64 images
}

export default function CreatePage() {
  const router = useRouter();
  const { credits, createProject, useCredits } = useComicStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [story, setStory] = useState('');
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState<typeof TONES[number]>('funny');
  const [style, setStyle] = useState<typeof STYLES[number]>('western');
  const [language, setLanguage] = useState('English');
  const [isCreating, setIsCreating] = useState(false);
  
  // Character uploads
  const [characters, setCharacters] = useState<CharacterUpload[]>([]);
  const [currentCharacterName, setCurrentCharacterName] = useState('');
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

  const addCharacter = () => {
    if (!currentCharacterName.trim()) return;
    
    const newCharacter: CharacterUpload = {
      id: crypto.randomUUID(),
      name: currentCharacterName.trim(),
      images: [],
    };
    
    setCharacters([...characters, newCharacter]);
    setCurrentCharacterName('');
    setActiveCharacterId(newCharacter.id);
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
    if (activeCharacterId === id) {
      setActiveCharacterId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeCharacterId || !e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newImages: string[] = [];
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }
    }
    
    setCharacters(characters.map(c => 
      c.id === activeCharacterId 
        ? { ...c, images: [...c.images, ...newImages].slice(0, 15) } // Max 15 images
        : c
    ));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (characterId: string, imageIndex: number) => {
    setCharacters(characters.map(c =>
      c.id === characterId
        ? { ...c, images: c.images.filter((_, i) => i !== imageIndex) }
        : c
    ));
  };

  const handleCreate = async () => {
    if (!story.trim()) return;
    
    // Check credits (2 for story structuring)
    if (credits < 2) {
      alert('Not enough credits! You need at least 2 credits to create a comic.');
      return;
    }

    setIsCreating(true);

    // Create project with character data
    const projectId = createProject({
      title: title || 'Untitled Comic',
      story,
      tone,
      style,
      language,
    });

    // Store character images in localStorage for this project
    if (characters.length > 0) {
      localStorage.setItem(`nano-banana-characters-${projectId}`, JSON.stringify(characters));
    }

    // Use credits for story structuring
    useCredits(2);

    // Navigate to editor
    router.push(`/comic/${projectId}`);
  };

  const activeCharacter = characters.find(c => c.id === activeCharacterId);

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
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Create Your Comic</h1>
        <p className="text-gray-400 mb-8">Upload character photos and tell us your story.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Story */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">Comic Title</label>
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
                placeholder="Write your story here... Include character names that match the ones you upload!"
                rows={8}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition resize-none"
              />
            </div>

            {/* Tone & Style */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${
                        tone === t
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${
                        style === s
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
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
          </div>

          {/* Right Column - Characters */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                📸 Characters (Upload Reference Photos)
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Add characters and upload 3-15 photos of each for consistent faces across panels.
              </p>

              {/* Add Character */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={currentCharacterName}
                  onChange={(e) => setCurrentCharacterName(e.target.value)}
                  placeholder="Character name (e.g., Sarah)"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500 transition"
                  onKeyDown={(e) => e.key === 'Enter' && addCharacter()}
                />
                <button
                  onClick={addCharacter}
                  disabled={!currentCharacterName.trim()}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold px-4 py-2 rounded-lg transition"
                >
                  Add
                </button>
              </div>

              {/* Character List */}
              {characters.length > 0 && (
                <div className="space-y-3 mb-4">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition ${
                        activeCharacterId === char.id ? 'ring-2 ring-yellow-500' : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setActiveCharacterId(char.id)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{char.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{char.images.length} photos</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeCharacter(char.id); }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      {/* Image thumbnails */}
                      {char.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {char.images.slice(0, 5).map((img, i) => (
                            <div key={i} className="relative w-12 h-12">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt={`${char.name} ref ${i + 1}`}
                                className="w-full h-full object-cover rounded"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); removeImage(char.id, i); }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          {char.images.length > 5 && (
                            <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-sm">
                              +{char.images.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              {activeCharacter && (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="character-upload"
                  />
                  <label
                    htmlFor="character-upload"
                    className="cursor-pointer"
                  >
                    <div className="text-4xl mb-2">📷</div>
                    <p className="font-semibold">Upload photos for {activeCharacter.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click to select or drag & drop • {activeCharacter.images.length}/15 photos
                    </p>
                  </label>
                </div>
              )}

              {characters.length === 0 && (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">👤</div>
                  <p>Add a character above to upload reference photos</p>
                </div>
              )}
            </div>

            {/* Cost Preview */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Credit Cost</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Story structuring</span>
                  <span>2 credits</span>
                </div>
                <div className="flex justify-between">
                  <span>Panel generation (~6 panels)</span>
                  <span>~18 credits</span>
                </div>
                {characters.length > 0 && (
                  <div className="flex justify-between text-yellow-400">
                    <span>✨ Using {characters.length} character ref(s)</span>
                    <span>+consistency</span>
                  </div>
                )}
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between font-semibold text-white">
                  <span>Estimated total</span>
                  <span>~20 credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={!story.trim() || isCreating}
          className="w-full mt-8 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <span className="animate-spin">⏳</span>
              Creating...
            </>
          ) : (
            <>
              <span>🍌</span>
              Create Comic {characters.length > 0 ? 'with Character Refs' : ''} (2 credits)
            </>
          )}
        </button>
      </main>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}
