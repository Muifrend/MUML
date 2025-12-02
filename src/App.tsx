import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main className="w-[400px] p-6 pt-10 flex flex-col items-center bg-[#242424] text-[rgba(255,255,255,0.87)] font-sans rounded-xl shadow-2xl border border-gray-700">
        
        {/* Title */}
        <h1 className="text-4xl font-bold mb-8 text-center">Copy Forum Links Straigth to NotebookLM</h1>
        
        {/* Interactive Section */}
        <div className="w-full bg-[#1a1a1a] p-6 rounded-lg text-center">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="rounded-lg border border-transparent px-4 py-2 text-lg font-medium bg-[#2a2a2a] cursor-pointer transition-colors hover:border-[#646cff] hover:bg-[#3a3a3a] mb-4"
          >
            count is {count}
          </button>
          
          <p className="text-sm text-gray-400">
            Edit <code className="font-mono bg-[#2f2f2f] px-1 rounded text-white">src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </main>

    </>
  )
}

export default App
