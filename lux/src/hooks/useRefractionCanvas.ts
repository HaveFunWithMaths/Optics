import { useRef, useEffect, useCallback } from 'react';
import { degToRad, calculateRefraction, calculateReflectedAngle } from '../utils/physics';

interface UseRefractionCanvasProps {
    n1: number;
    n2: number;
    incidentAngle: number;
    onAngleChange: (angle: number) => void;
}

interface CanvasColors {
    medium1: string;
    medium2: string;
    incidentRay: string;
    incidentGlow: string;
    refractedRay: string;
    refractedGlow: string;
    reflectedRay: string;
    reflectedGlow: string;
    normal: string;
    arc: string;
    text: string;
}

const COLORS: CanvasColors = {
    medium1: '#1a1a2e',
    medium2: '#0f3460',
    incidentRay: '#ff4757',
    incidentGlow: 'rgba(255, 71, 87, 0.6)',
    refractedRay: '#2ed573',
    refractedGlow: 'rgba(46, 213, 115, 0.6)',
    reflectedRay: '#ffa502',
    reflectedGlow: 'rgba(255, 165, 2, 0.5)',
    normal: '#a0aec0',
    arc: '#60a5fa',
    text: '#e2e8f0',
};

export function useRefractionCanvas({
    n1,
    n2,
    incidentAngle,
    onAngleChange,
}: UseRefractionCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDragging = useRef(false);
    const animationRef = useRef<number | undefined>(undefined);

    // Calculate intersection point (center of canvas)
    const getIntersection = useCallback((canvas: HTMLCanvasElement) => {
        return {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };
    }, []);

    // Draw the entire scene
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const intersection = getIntersection(canvas);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw Medium 1 (top half)
        ctx.fillStyle = COLORS.medium1;
        ctx.fillRect(0, 0, width, height / 2);

        // Draw Medium 2 (bottom half)
        ctx.fillStyle = COLORS.medium2;
        ctx.fillRect(0, height / 2, width, height / 2);

        // Draw subtle gradient overlay for depth
        const gradient1 = ctx.createLinearGradient(0, 0, 0, height / 2);
        gradient1.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
        gradient1.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, width, height / 2);

        const gradient2 = ctx.createLinearGradient(0, height / 2, 0, height);
        gradient2.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        gradient2.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, height / 2, width, height / 2);

        // Draw interface line (subtle)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw Normal line (dashed)
        ctx.beginPath();
        ctx.strokeStyle = COLORS.normal;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.moveTo(intersection.x, 40);
        ctx.lineTo(intersection.x, height - 40);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label for Normal
        ctx.fillStyle = COLORS.text;
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Normal', intersection.x, 28);

        // Calculate ray length
        const rayLength = Math.min(width, height) * 0.45;

        // Calculate incident ray endpoint
        const incidentAngleRad = degToRad(incidentAngle);
        const incidentEndX = intersection.x - Math.sin(incidentAngleRad) * rayLength;
        const incidentEndY = intersection.y - Math.cos(incidentAngleRad) * rayLength;

        // Draw incident ray with glow
        ctx.save();
        ctx.shadowColor = COLORS.incidentGlow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.strokeStyle = COLORS.incidentRay;
        ctx.lineWidth = 3;
        ctx.moveTo(incidentEndX, incidentEndY);
        ctx.lineTo(intersection.x, intersection.y);
        ctx.stroke();
        ctx.restore();

        // Draw light source (laser emitter)
        drawLightSource(ctx, incidentEndX, incidentEndY, incidentAngleRad);

        // Calculate refraction result
        const result = calculateRefraction(n1, n2, incidentAngle);

        if (result.isTIR) {
            // Total Internal Reflection - draw reflected ray
            const reflectedAngle = calculateReflectedAngle(incidentAngle);
            const reflectedAngleRad = degToRad(reflectedAngle);
            const reflectedEndX = intersection.x + Math.sin(reflectedAngleRad) * rayLength;
            const reflectedEndY = intersection.y - Math.cos(reflectedAngleRad) * rayLength;

            // Draw reflected ray with glow
            ctx.save();
            ctx.shadowColor = COLORS.reflectedGlow;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.strokeStyle = COLORS.reflectedRay;
            ctx.lineWidth = 3;
            ctx.moveTo(intersection.x, intersection.y);
            ctx.lineTo(reflectedEndX, reflectedEndY);
            ctx.stroke();
            ctx.restore();

            // Draw reflected angle arc
            drawAngleArc(ctx, intersection, reflectedAngle, false, true, COLORS.reflectedRay);
        } else if (result.refractedAngle !== null) {
            // Refraction - draw refracted ray
            const refractedAngleRad = degToRad(result.refractedAngle);
            const refractedEndX = intersection.x + Math.sin(refractedAngleRad) * rayLength;
            const refractedEndY = intersection.y + Math.cos(refractedAngleRad) * rayLength;

            // Draw refracted ray with glow
            ctx.save();
            ctx.shadowColor = COLORS.refractedGlow;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.strokeStyle = COLORS.refractedRay;
            ctx.lineWidth = 3;
            ctx.moveTo(intersection.x, intersection.y);
            ctx.lineTo(refractedEndX, refractedEndY);
            ctx.stroke();
            ctx.restore();

            // Draw refracted angle arc
            drawAngleArc(ctx, intersection, result.refractedAngle, true, false, COLORS.refractedRay);
        }

        // Draw incident angle arc
        drawAngleArc(ctx, intersection, incidentAngle, false, false, COLORS.incidentRay);

        // Draw medium labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Medium 1 (n₁ = ${n1.toFixed(2)})`, 20, 30);
        ctx.fillText(`Medium 2 (n₂ = ${n2.toFixed(2)})`, 20, height - 15);

    }, [n1, n2, incidentAngle, getIntersection]);

    // Draw light source (stylized laser emitter)
    function drawLightSource(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        angle: number
    ) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI);

        // Outer glow
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 71, 87, 0.2)';
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        gradient.addColorStop(0, '#ff6b7a');
        gradient.addColorStop(0.5, '#ff4757');
        gradient.addColorStop(1, '#c0392b');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Emitter tip
        ctx.beginPath();
        ctx.moveTo(-6, -12);
        ctx.lineTo(6, -12);
        ctx.lineTo(4, -20);
        ctx.lineTo(-4, -20);
        ctx.closePath();
        ctx.fillStyle = '#2d3436';
        ctx.fill();

        // Lens
        ctx.beginPath();
        ctx.arc(0, -12, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        ctx.restore();
    }

    // Draw angle arc with label
    function drawAngleArc(
        ctx: CanvasRenderingContext2D,
        center: { x: number; y: number },
        angleDeg: number,
        isBelow: boolean,
        isReflected: boolean,
        color: string
    ) {
        const arcRadius = 50;
        const angleRad = degToRad(angleDeg);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        let startAngle: number;
        let endAngle: number;

        if (isBelow) {
            // Refracted ray (below interface, RIGHT side of normal)
            // Draw arc from normal (pointing down) towards the ray (on the right)
            startAngle = Math.PI / 2 - angleRad;
            endAngle = Math.PI / 2;
        } else if (isReflected) {
            // Reflected ray (above interface, RIGHT side of normal)
            startAngle = -Math.PI / 2;
            endAngle = -Math.PI / 2 + angleRad;
        } else {
            // Incident ray (above interface, LEFT side of normal)
            // Draw arc from normal (pointing up) towards the ray (on the left)
            startAngle = -Math.PI / 2 - angleRad;
            endAngle = -Math.PI / 2;
        }

        ctx.arc(center.x, center.y, arcRadius, startAngle, endAngle);
        ctx.stroke();

        // Draw angle label
        const labelAngle = (startAngle + endAngle) / 2;
        const labelRadius = arcRadius + 20;
        const labelX = center.x + Math.cos(labelAngle) * labelRadius;
        const labelY = center.y + Math.sin(labelAngle) * labelRadius;

        ctx.fillStyle = color;
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${angleDeg.toFixed(1)}°`, labelX, labelY);
    }

    // Handle mouse/touch interaction
    const handlePointerDown = useCallback((e: PointerEvent) => {
        isDragging.current = true;
        handlePointerMove(e);
    }, []);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const intersection = getIntersection(canvas);

        // Only respond to clicks in the top half (Medium 1)
        if (y > intersection.y) return;

        // Calculate angle from normal
        const dx = x - intersection.x;
        const dy = intersection.y - y;

        if (dy <= 0) return;

        let angle = Math.atan2(Math.abs(dx), dy);
        angle = angle * (180 / Math.PI);
        angle = Math.max(0, Math.min(89, angle));

        onAngleChange(angle);
    }, [getIntersection, onAngleChange]);

    const handlePointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    // Set up canvas and event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set up canvas size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Set up pointer events
        canvas.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerDown, handlePointerMove, handlePointerUp]);

    // Animation loop
    useEffect(() => {
        const animate = () => {
            draw();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [draw]);

    return { canvasRef };
}
