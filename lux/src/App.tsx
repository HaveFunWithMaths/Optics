import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { RefractionCanvas } from './components/RefractionCanvas';
import { ControlPanel } from './components/ControlPanel';
import { isTotalInternalReflection } from './utils/physics';
import './index.css';

function App() {
  const [n1, setN1] = useState(1.5); // Glass
  const [n2, setN2] = useState(1.0); // Air
  const [incidentAngle, setIncidentAngle] = useState(30);

  const handleAngleChange = useCallback((angle: number) => {
    setIncidentAngle(angle);
  }, []);

  const isTIR = isTotalInternalReflection(n1, n2, incidentAngle);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {/* Centered Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex items-center gap-3 glass-card px-5 py-2.5 rounded-xl">
          <Zap className="text-amber-400" size={24} />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
            Light Refraction Simulator
          </h1>
        </div>
      </motion.header>

      {/* Canvas Container - fills remaining space */}
      <div className="flex-1 w-full h-full relative">
        <RefractionCanvas
          n1={n1}
          n2={n2}
          incidentAngle={incidentAngle}
          onAngleChange={handleAngleChange}
        />

        {/* Control Panel - responsive positioning */}
        <ControlPanel
          n1={n1}
          n2={n2}
          incidentAngle={incidentAngle}
          onN1Change={setN1}
          onN2Change={setN2}
          onAngleChange={handleAngleChange}
          isTIR={isTIR}
        />
      </div>
    </div>
  );
}

export default App;
