import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Character {
  id: string;
  name: string;
  token: string;
  referenceImages: string[];
  trained: boolean;
}

export interface Panel {
  id: string;
  imageUrl: string;
  prompt: string;
  sceneDescription: string;
  cameraAngle: string;
  emotion: string;
  dialogue: string[];
  seed: number;
  isGenerating: boolean;
}

export interface Project {
  id: string;
  title: string;
  story: string;
  tone: 'romantic' | 'funny' | 'dramatic' | 'kids';
  style: 'western' | 'manga' | 'cinematic' | 'watercolor';
  language: string;
  characters: Character[];
  panels: Panel[];
  createdAt: number;
  status: 'draft' | 'generating' | 'editing' | 'complete';
}

interface ComicStore {
  credits: number;
  projects: Project[];
  currentProjectId: string | null;
  
  // Actions
  addCredits: (amount: number) => void;
  useCredits: (amount: number) => boolean;
  
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'panels' | 'characters' | 'status'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  getCurrentProject: () => Project | null;
  
  addPanel: (projectId: string, panel: Panel) => void;
  updatePanel: (projectId: string, panelId: string, updates: Partial<Panel>) => void;
  deletePanel: (projectId: string, panelId: string) => void;
  reorderPanels: (projectId: string, panelIds: string[]) => void;
  
  addCharacter: (projectId: string, character: Character) => void;
  updateCharacter: (projectId: string, characterId: string, updates: Partial<Character>) => void;
}

export const useComicStore = create<ComicStore>()(
  persist(
    (set, get) => ({
      credits: 100, // Start with 100 free credits for MVP
      projects: [],
      currentProjectId: null,

      addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
      
      useCredits: (amount) => {
        const state = get();
        if (state.credits >= amount) {
          set({ credits: state.credits - amount });
          return true;
        }
        return false;
      },

      createProject: (projectData) => {
        const id = crypto.randomUUID();
        const project: Project = {
          ...projectData,
          id,
          createdAt: Date.now(),
          panels: [],
          characters: [],
          status: 'draft',
        };
        set((state) => ({ 
          projects: [...state.projects, project],
          currentProjectId: id 
        }));
        return id;
      },

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? { ...p, ...updates } : p
        ),
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
      })),

      setCurrentProject: (id) => set({ currentProjectId: id }),

      getCurrentProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.currentProjectId) || null;
      },

      addPanel: (projectId, panel) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, panels: [...p.panels, panel] } : p
        ),
      })),

      updatePanel: (projectId, panelId, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                panels: p.panels.map((panel) =>
                  panel.id === panelId ? { ...panel, ...updates } : panel
                ),
              }
            : p
        ),
      })),

      deletePanel: (projectId, panelId) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, panels: p.panels.filter((panel) => panel.id !== panelId) }
            : p
        ),
      })),

      reorderPanels: (projectId, panelIds) => set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          const panelMap = new Map(p.panels.map((panel) => [panel.id, panel]));
          return {
            ...p,
            panels: panelIds.map((id) => panelMap.get(id)!).filter(Boolean),
          };
        }),
      })),

      addCharacter: (projectId, character) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, characters: [...p.characters, character] }
            : p
        ),
      })),

      updateCharacter: (projectId, characterId, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                characters: p.characters.map((c) =>
                  c.id === characterId ? { ...c, ...updates } : c
                ),
              }
            : p
        ),
      })),
    }),
    {
      name: 'nano-banana-storage',
    }
  )
);
