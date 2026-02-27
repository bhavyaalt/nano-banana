'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useComicStore, Panel } from '@/store/comic-store';
import { jsPDF } from 'jspdf';

// Mock panel images for MVP
const MOCK_IMAGES = [
  'https://picsum.photos/seed/comic1/400/600',
  'https://picsum.photos/seed/comic2/400/600',
  'https://picsum.photos/seed/comic3/400/600',
  'https://picsum.photos/seed/comic4/400/600',
  'https://picsum.photos/seed/comic5/400/600',
  'https://picsum.photos/seed/comic6/400/600',
];

const CAMERA_ANGLES = ['close-up', 'medium shot', 'wide shot', 'over-the-shoulder', 'dramatic angle', 'birds eye'];
const EMOTIONS = ['happy', 'sad', 'angry', 'surprised', 'thoughtful', 'scared', 'romantic'];

export default function ComicEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, updateProject, addPanel, updatePanel, deletePanel, credits, useCredits } = useComicStore();
  const project = projects.find(p => p.id === id);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editDialogue, setEditDialogue] = useState('');

  // Generate panels on first load if empty
  useEffect(() => {
    if (project && project.panels.length === 0 && project.status === 'draft') {
      generatePanels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const generatePanels = async () => {
    if (!project || isGenerating) return;
    
    setIsGenerating(true);
    updateProject(project.id, { status: 'generating' });

    // Simulate AI panel generation
    const panelCount = Math.min(6, Math.floor(project.story.length / 100) + 3);
    const storyChunks = splitStory(project.story, panelCount);

    for (let i = 0; i < panelCount; i++) {
      // Check credits
      if (!useCredits(3)) {
        alert('Not enough credits to generate more panels!');
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate generation time

      const newPanel: Panel = {
        id: crypto.randomUUID(),
        imageUrl: MOCK_IMAGES[i % MOCK_IMAGES.length] + `?t=${Date.now()}`,
        prompt: `${project.style} style comic panel, ${project.tone} tone, ${storyChunks[i]}`,
        sceneDescription: storyChunks[i],
        cameraAngle: CAMERA_ANGLES[Math.floor(Math.random() * CAMERA_ANGLES.length)],
        emotion: EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)],
        dialogue: extractDialogue(storyChunks[i]),
        seed: Math.floor(Math.random() * 1000000),
        isGenerating: false,
      };

      addPanel(project.id, newPanel);
    }

    updateProject(project.id, { status: 'editing' });
    setIsGenerating(false);
  };

  const regeneratePanel = async (panelId: string) => {
    if (!project || !useCredits(2)) {
      alert('Not enough credits!');
      return;
    }

    updatePanel(project.id, panelId, { isGenerating: true });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updatePanel(project.id, panelId, {
      imageUrl: MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)] + `?t=${Date.now()}`,
      isGenerating: false,
      seed: Math.floor(Math.random() * 1000000),
    });
  };

  const handleEditPanel = (panel: Panel) => {
    setSelectedPanel(panel.id);
    setEditPrompt(panel.prompt);
    setEditDialogue(panel.dialogue.join('\n'));
  };

  const saveEditedPanel = async () => {
    if (!project || !selectedPanel) return;

    const dialogueLines = editDialogue.split('\n').filter(l => l.trim());
    
    updatePanel(project.id, selectedPanel, {
      prompt: editPrompt,
      dialogue: dialogueLines,
    });
    
    setSelectedPanel(null);
  };

  const exportPDF = async () => {
    if (!project || !useCredits(2)) {
      alert('Not enough credits for PDF export!');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Title page
    pdf.setFontSize(32);
    pdf.text(project.title || 'Untitled Comic', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('Created with Nano Banana 🍌', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
    
    // Add panels (2 per page for simplicity)
    for (let i = 0; i < project.panels.length; i++) {
      if (i % 2 === 0) {
        pdf.addPage();
      }
      
      const panel = project.panels[i];
      const y = i % 2 === 0 ? 20 : pageHeight / 2 + 10;
      
      // Add placeholder rectangle for panel
      pdf.setDrawColor(100);
      pdf.rect(20, y, pageWidth - 40, pageHeight / 2 - 30);
      
      // Add scene description
      pdf.setFontSize(10);
      const text = panel.sceneDescription.substring(0, 100) + '...';
      pdf.text(text, 25, y + 10, { maxWidth: pageWidth - 50 });
      
      // Add dialogue
      if (panel.dialogue.length > 0) {
        pdf.setFontSize(12);
        pdf.text(panel.dialogue[0], pageWidth / 2, y + pageHeight / 4, { align: 'center' });
      }
    }

    pdf.save(`${project.title || 'comic'}.pdf`);
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/" className="text-yellow-400 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 sticky top-0 bg-black/90 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍌</span>
            </Link>
            <div>
              <h1 className="font-bold">{project.title || 'Untitled Comic'}</h1>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <span className="capitalize">{project.style}</span>
                <span>•</span>
                <span className="capitalize">{project.tone}</span>
                <span>•</span>
                <span>{project.panels.length} panels</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full font-semibold text-sm">
              🪙 {credits}
            </div>
            {project.panels.length > 0 && (
              <button
                onClick={exportPDF}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                📄 Export PDF (2 credits)
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Story Preview */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h2 className="font-semibold mb-2">Story</h2>
          <p className="text-gray-400 text-sm line-clamp-3">{project.story}</p>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="bg-blue-500/20 text-blue-400 rounded-lg p-4 mb-8 flex items-center gap-3">
            <span className="animate-spin text-2xl">🍌</span>
            <span>Generating panels... This may take a moment.</span>
          </div>
        )}

        {/* Panels Grid */}
        {project.panels.length > 0 ? (
          <div className="panel-grid">
            {project.panels.map((panel, index) => (
              <div
                key={panel.id}
                className={`comic-panel relative ${panel.isGenerating ? 'opacity-50' : ''}`}
              >
                {/* Panel Number */}
                <div className="absolute top-2 left-2 bg-black/70 text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10">
                  {index + 1}
                </div>

                {/* Panel Image */}
                <div className="aspect-[2/3] relative">
                  {panel.isGenerating ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <span className="animate-spin text-4xl">🍌</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={panel.imageUrl}
                      alt={`Panel ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Dialogue Overlay */}
                  {panel.dialogue.length > 0 && !panel.isGenerating && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="speech-bubble text-sm">
                        {panel.dialogue[0]}
                      </div>
                    </div>
                  )}
                </div>

                {/* Panel Controls */}
                <div className="p-3 bg-gray-900">
                  <div className="text-xs text-gray-500 mb-2 flex gap-2">
                    <span className="bg-gray-800 px-2 py-1 rounded">{panel.cameraAngle}</span>
                    <span className="bg-gray-800 px-2 py-1 rounded">{panel.emotion}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPanel(panel)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => regeneratePanel(panel.id)}
                      disabled={panel.isGenerating}
                      className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm py-2 rounded transition disabled:opacity-50"
                    >
                      🔄 Regen (2)
                    </button>
                    <button
                      onClick={() => deletePanel(project.id, panel.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm px-3 py-2 rounded transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Panel Button */}
            <button
              onClick={() => {
                if (useCredits(3)) {
                  const newPanel: Panel = {
                    id: crypto.randomUUID(),
                    imageUrl: MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)] + `?t=${Date.now()}`,
                    prompt: `${project.style} style comic panel`,
                    sceneDescription: 'New scene',
                    cameraAngle: 'medium shot',
                    emotion: 'neutral',
                    dialogue: [],
                    seed: Math.floor(Math.random() * 1000000),
                    isGenerating: false,
                  };
                  addPanel(project.id, newPanel);
                } else {
                  alert('Not enough credits!');
                }
              }}
              className="border-2 border-dashed border-gray-700 hover:border-yellow-500 rounded-lg aspect-[2/3] flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-yellow-400 transition"
            >
              <span className="text-4xl">+</span>
              <span>Add Panel (3 credits)</span>
            </button>
          </div>
        ) : !isGenerating && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold mb-2">No panels yet</h2>
            <p className="text-gray-400 mb-6">Click below to generate your comic panels</p>
            <button
              onClick={generatePanels}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-lg transition"
            >
              🍌 Generate Panels (3 credits each)
            </button>
          </div>
        )}
      </main>

      {/* Edit Panel Modal */}
      {selectedPanel && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Panel</h2>
                <button
                  onClick={() => setSelectedPanel(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Quick Expression Buttons */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Quick Expressions</label>
                  <div className="flex flex-wrap gap-2">
                    {['😊 Happy', '😢 Sad', '😠 Angry', '😲 Surprised', '🥰 Romantic', '😨 Scared'].map((exp) => (
                      <button
                        key={exp}
                        onClick={() => setEditPrompt(prev => prev + `, ${exp.split(' ')[1].toLowerCase()} expression`)}
                        className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition"
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera Angle */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Camera Angle</label>
                  <div className="flex flex-wrap gap-2">
                    {CAMERA_ANGLES.map((angle) => (
                      <button
                        key={angle}
                        onClick={() => setEditPrompt(prev => prev.replace(/close-up|medium shot|wide shot|over-the-shoulder|dramatic angle|birds eye/gi, angle))}
                        className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition capitalize"
                      >
                        {angle}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Scene Prompt</label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition resize-none text-sm"
                    placeholder="Describe the scene..."
                  />
                </div>

                {/* Dialogue */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Dialogue (one line per bubble)</label>
                  <textarea
                    value={editDialogue}
                    onChange={(e) => setEditDialogue(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-500 transition resize-none text-sm"
                    placeholder="Enter dialogue lines..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveEditedPanel}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      saveEditedPanel();
                      regeneratePanel(selectedPanel);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition"
                  >
                    Save & Regenerate (2 credits)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function splitStory(story: string, parts: number): string[] {
  const sentences = story.split(/[.!?]+/).filter(s => s.trim());
  const chunkSize = Math.ceil(sentences.length / parts);
  const chunks: string[] = [];
  
  for (let i = 0; i < parts; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, sentences.length);
    chunks.push(sentences.slice(start, end).join('. ').trim() || `Scene ${i + 1}`);
  }
  
  return chunks;
}

function extractDialogue(text: string): string[] {
  const matches = text.match(/"[^"]+"/g) || [];
  return matches.map(m => m.replace(/"/g, '')).slice(0, 2);
}
