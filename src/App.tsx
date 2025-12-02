import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main className="w-[400px] p-6 flex flex-col items-center bg-[#242424] text-[rgba(255,255,255,0.87)] font-sans rounded-xl shadow-2xl border border-gray-700">
        
        {/* Logo Section */}
        <div className="flex gap-8 mb-8">
          <a href="https://vite.dev" target="_blank" className="hover:opacity-80 transition-opacity">
            <img src={viteLogo} className="h-20 w-20 hover:drop-shadow-[0_0_2em_#646cffaa] transition-all" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="hover:opacity-80 transition-opacity">
            <img src={reactLogo} className="h-20 w-20 animate-[spin_20s_linear_infinite] hover:drop-shadow-[0_0_2em_#61dafbaa] transition-all" alt="React logo" />
          </a>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold mb-8 text-center">Vite + React</h1>
        
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
        
        <p className="mt-8 text-[#888] text-sm">
          Click on the Vite and React logos to learn more
        </p>
      </main>

    </>
  )
}

export default App
