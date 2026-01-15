import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Sun, Droplets, Gem, Wind, Settings2 } from 'lucide-react';
import { calculateCriticalAngle, getMediumName } from '../utils/physics';

interface ControlPanelProps {
    n1: number;
    n2: number;
    incidentAngle: number;
    onN1Change: (value: number) => void;
    onN2Change: (value: number) => void;
    onAngleChange: (value: number) => void;
    isTIR: boolean;
}

interface PresetMedium {
    name: string;
    n: number;
    icon: React.ReactNode;
}

const PRESETS: PresetMedium[] = [
    { name: 'Air', n: 1.0, icon: <Wind size={14} /> },
    { name: 'Water', n: 1.33, icon: <Droplets size={14} /> },
    { name: 'Glass', n: 1.5, icon: <Sun size={14} /> },
    { name: 'Diamond', n: 2.42, icon: <Gem size={14} /> },
];

export function ControlPanel({
    n1,
    n2,
    incidentAngle,
    onN1Change,
    onN2Change,
    onAngleChange,
    isTIR,
}: ControlPanelProps) {
    const criticalAngle = calculateCriticalAngle(n1, n2);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-16 right-4 w-72 sm:w-80 glass-card rounded-2xl p-4 sm:p-5 z-10 max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <Settings2 className="text-blue-400" size={20} />
                <h2 className="text-lg font-semibold text-white">Controls</h2>
            </div>

            {/* TIR Warning Badge */}
            <AnimatePresence>
                {isTIR && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                            <AlertTriangle className="text-amber-400 flex-shrink-0" size={18} />
                            <span className="text-amber-300 text-sm font-medium">
                                Total Internal Reflection
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Medium 1 Control */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-300 font-medium">
                        Medium 1 (n₁)
                    </label>
                    <span className="text-xs text-slate-400">{getMediumName(n1)}</span>
                </div>
                <div className="flex gap-3 items-center">
                    <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.01"
                        value={n1}
                        onChange={(e) => onN1Change(parseFloat(e.target.value))}
                        className="flex-1 h-2"
                    />
                    <input
                        type="number"
                        min="1"
                        max="2.5"
                        step="0.01"
                        value={n1.toFixed(2)}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= 2.5) onN1Change(val);
                        }}
                        className="w-16 px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-center text-sm focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                {/* Presets */}
                <div className="flex gap-1.5 mt-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => onN1Change(preset.n)}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all
                ${Math.abs(n1 - preset.n) < 0.05
                                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                    : 'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-600/40'
                                }`}
                        >
                            {preset.icon}
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Medium 2 Control */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-300 font-medium">
                        Medium 2 (n₂)
                    </label>
                    <span className="text-xs text-slate-400">{getMediumName(n2)}</span>
                </div>
                <div className="flex gap-3 items-center">
                    <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.01"
                        value={n2}
                        onChange={(e) => onN2Change(parseFloat(e.target.value))}
                        className="flex-1 h-2"
                    />
                    <input
                        type="number"
                        min="1"
                        max="2.5"
                        step="0.01"
                        value={n2.toFixed(2)}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= 2.5) onN2Change(val);
                        }}
                        className="w-16 px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-center text-sm focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                {/* Presets */}
                <div className="flex gap-1.5 mt-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => onN2Change(preset.n)}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all
                ${Math.abs(n2 - preset.n) < 0.05
                                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                    : 'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-600/40'
                                }`}
                        >
                            {preset.icon}
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Incident Angle Control */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-300 font-medium">
                        Incident Angle (θ₁)
                    </label>
                    <span className="text-xs text-blue-400 font-mono">{incidentAngle.toFixed(1)}°</span>
                </div>
                <div className="flex gap-3 items-center">
                    <input
                        type="range"
                        min="0"
                        max="89"
                        step="0.5"
                        value={incidentAngle}
                        onChange={(e) => onAngleChange(parseFloat(e.target.value))}
                        className="flex-1 h-2"
                    />
                    <input
                        type="number"
                        min="0"
                        max="89"
                        step="0.5"
                        value={incidentAngle.toFixed(1)}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0 && val <= 89) onAngleChange(val);
                        }}
                        className="w-16 px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-center text-sm focus:outline-none focus:border-blue-500/50"
                    />
                </div>
            </div>

            {/* Physics Info */}
            <div className="pt-4 border-t border-slate-600/30">
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Snell's Law:</span>
                        <span className="text-slate-300 font-mono">n₁ sin(θ₁) = n₂ sin(θ₂)</span>
                    </div>
                    {criticalAngle !== null && (
                        <div className="flex justify-between">
                            <span className="text-slate-400">Critical Angle:</span>
                            <span className="text-amber-400 font-mono">{criticalAngle.toFixed(1)}°</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 pt-4 border-t border-slate-600/30">
                <p className="text-xs text-slate-500 italic">
                    💡 Drag the light source on the canvas to change the angle
                </p>
            </div>
        </motion.div>
    );
}
