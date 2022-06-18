import { motion } from 'framer-motion';
import { useState } from 'react';

import logo from '@/logo.svg';

import './App.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <motion.img
          animate={{ rotate: 180 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          src={logo}
          className="App-logo"
          alt="logo"
        />
        <p>Hello Vite + React!</p>
        <p>
          <button
            onClick={() => {
              setCount((c) => c + 1);
            }}
          >
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}
