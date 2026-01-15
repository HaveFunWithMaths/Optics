import { useRefractionCanvas } from '../hooks/useRefractionCanvas';

interface RefractionCanvasProps {
    n1: number;
    n2: number;
    incidentAngle: number;
    onAngleChange: (angle: number) => void;
}

export function RefractionCanvas({
    n1,
    n2,
    incidentAngle,
    onAngleChange,
}: RefractionCanvasProps) {
    const { canvasRef } = useRefractionCanvas({
        n1,
        n2,
        incidentAngle,
        onAngleChange,
    });

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            style={{ display: 'block' }}
        />
    );
}
