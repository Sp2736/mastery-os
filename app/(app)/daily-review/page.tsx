export default function DailyReviewPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-white">Daily Review</h2>
      
      <div className="glass-panel p-8 max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-white/80 mb-6">Today's Log</h3>
        
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60 uppercase tracking-wider">What did you learn today?</label>
            <textarea 
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
              placeholder="Reflect on today's progress..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wider">Focus (1-5)</label>
              <input 
                type="number" min="1" max="5"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wider">Energy (1-5)</label>
              <input 
                type="number" min="1" max="5"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
          </div>
          
          <button type="button" className="w-full py-4 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 font-bold tracking-wider uppercase rounded-xl border border-amber-500/30 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            Commit Entry
          </button>
        </form>
      </div>
    </div>
  );
}
