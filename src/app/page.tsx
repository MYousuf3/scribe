export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-amber-800 to-orange-700 text-transparent bg-clip-text">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider">
              📜 SCRIBE
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-amber-800 font-medium max-w-3xl mx-auto leading-relaxed">
            Ancient wisdom meets modern development. Generate intelligent changelogs from your git commits using AI.
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Feature Card 1 */}
          <div className="bg-gradient-to-br from-amber-100 to-orange-200 p-8 rounded-xl shadow-lg border-2 border-amber-300 transform hover:scale-105 transition-transform duration-300">
            
            <h3 className="text-xl font-bold text-amber-900 mb-3">Git Integration</h3>
            <p className="text-amber-800">
              Connect GitHub and GitLab repositories. Fetch commits automatically with intelligent parsing.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-gradient-to-br from-amber-100 to-orange-200 p-8 rounded-xl shadow-lg border-2 border-amber-300 transform hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-amber-900 mb-3">AI-Powered</h3>
            <p className="text-amber-800">
              Google Gemini AI analyzes commits and generates professional changelogs with categorized entries.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-gradient-to-br from-amber-100 to-orange-200 p-8 rounded-xl shadow-lg border-2 border-amber-300 transform hover:scale-105 transition-transform duration-300">
            
            <h3 className="text-xl font-bold text-amber-900 mb-3">Smart Categories</h3>
            <p className="text-amber-800">
              Automatically categorizes changes into Features, Bug Fixes, Improvements, and Documentation.
            </p>
          </div>
        </div>

        {/* Clay Tablet Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-br from-yellow-600 to-amber-700 p-12 rounded-3xl shadow-2xl border-4 border-amber-600 transform rotate-1">
            <div className="bg-gradient-to-br from-amber-200 to-orange-300 p-8 rounded-2xl shadow-inner border-2 border-amber-400 transform -rotate-1">
              <h2 className="text-3xl font-bold text-amber-900 mb-6">
                ⚱️ Ancient Technology, Modern Results
              </h2>
              <p className="text-lg text-amber-800 mb-6 max-w-2xl mx-auto leading-relaxed">
                Like ancient scribes who meticulously recorded the chronicles of their time, 
                Scribe captures the evolution of your codebase with unparalleled precision and wisdom.
              </p>
              <div className="text-2xl text-amber-700">
  Scribe
              </div>
            </div>
          </div>
        </div>

        {/* Project Management Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-amber-900 mb-6">
Manage Your Digital Codex
            </h2>
            <ul className="space-y-4 text-lg text-amber-800">
              <li className="flex items-center">
                <span className="text-2xl mr-3">📚</span>
                Track multiple projects and repositories
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">⏱️</span>
                Generate changelogs for any date range
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Professional formatting ready for release
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">•</span>
                Automated publishing and distribution
              </li>
            </ul>
          </div>
                      <div className="text-center">
              <div className="text-8xl md:text-9xl opacity-30 text-amber-600 font-serif">
                Ψ
              </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Chronicle Your Code? 📜
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Transform your commit history into legendary documentation
            </p>
            <button className="bg-white text-amber-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
