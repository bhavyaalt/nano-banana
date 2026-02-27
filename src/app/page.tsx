'use client';

import Link from 'next/link';
import { useComicStore } from '@/store/comic-store';

export default function Home() {
  const { credits, projects } = useComicStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍌</span>
            <span className="text-xl font-bold">Nano Banana</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full font-semibold">
              🪙 {credits} Credits
            </div>
            <Link 
              href="/create"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-full transition"
            >
              Create Comic
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-float">🍌</div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
            AI Comic Generator
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Turn your stories into stunning comic books. 
            Character-consistent faces, editable panels, high-res PDF export.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg px-8 py-4 rounded-full transition animate-pulse-glow"
          >
            <span>Start Creating</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Nano Banana?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              emoji="🎭"
              title="Character Consistency"
              description="Upload photos, train AI on your characters. They look the same across every panel."
            />
            <FeatureCard
              emoji="✏️"
              title="Edit, Don't Restart"
              description="Regenerate single panels. Change expressions, backgrounds, camera angles. No full restart needed."
            />
            <FeatureCard
              emoji="📄"
              title="HD PDF Export"
              description="Download your comic as a high-resolution PDF ready for printing or sharing."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <StepCard number={1} title="Write Your Story" description="Enter your story idea, choose tone and style" />
            <StepCard number={2} title="Add Characters" description="Upload reference photos for consistent faces" />
            <StepCard number={3} title="Generate Panels" description="AI creates your comic panel by panel" />
            <StepCard number={4} title="Edit & Export" description="Fine-tune each panel, download HD PDF" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Credit Pricing</h2>
          <p className="text-center text-gray-400 mb-12">Pay for what you use. Credits never expire.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Starter"
              credits={100}
              price={19}
              features={['~5 comic pages', 'All styles included', 'HD PDF export']}
            />
            <PricingCard
              name="Pro"
              credits={300}
              price={49}
              features={['~15 comic pages', 'Priority generation', 'HD PDF export']}
              popular
            />
            <PricingCard
              name="Ultra"
              credits={1000}
              price={129}
              features={['~50 comic pages', 'Priority generation', 'HD PDF export']}
            />
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Your Projects</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  href={`/comic/${project.id}`}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition"
                >
                  <h3 className="font-bold text-lg mb-2">{project.title || 'Untitled'}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.story}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-400">{project.panels.length} panels</span>
                    <span className={`px-2 py-1 rounded ${
                      project.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'generating' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>🍌 Nano Banana — AI Comic Generator</p>
          <p className="text-sm mt-2">Made with ⚡ by Shawn & Bhavya</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-yellow-500 text-black font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ name, credits, price, features, popular }: { 
  name: string; 
  credits: number; 
  price: number; 
  features: string[];
  popular?: boolean;
}) {
  return (
    <div className={`rounded-xl p-6 ${popular ? 'bg-yellow-500 text-black ring-4 ring-yellow-400/50' : 'bg-gray-800'}`}>
      {popular && <div className="text-sm font-bold mb-2">MOST POPULAR</div>}
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <div className="text-3xl font-black mb-1">{credits} <span className="text-lg font-normal">credits</span></div>
      <div className="text-2xl font-bold mb-4">${price}</div>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <span>✓</span>
            <span className={popular ? '' : 'text-gray-400'}>{f}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-lg font-bold transition ${
        popular 
          ? 'bg-black text-white hover:bg-gray-900' 
          : 'bg-yellow-500 text-black hover:bg-yellow-400'
      }`}>
        Buy Credits
      </button>
    </div>
  );
}
