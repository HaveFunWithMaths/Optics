/**
 * Physics utilities for Snell's Law and Total Internal Reflection
 */

export interface RefractionResult {
    refractedAngle: number | null; // null if TIR
    isTIR: boolean;
    criticalAngle: number | null; // null if n1 <= n2
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Calculate the critical angle for total internal reflection
 * Only exists when n1 > n2
 * θc = arcsin(n2 / n1)
 */
export function calculateCriticalAngle(n1: number, n2: number): number | null {
    if (n1 <= n2) {
        return null; // No TIR possible when going from less dense to more dense medium
    }
    const ratio = n2 / n1;
    if (ratio > 1) return null;
    return radToDeg(Math.asin(ratio));
}

/**
 * Check if total internal reflection occurs
 */
export function isTotalInternalReflection(n1: number, n2: number, incidentAngleDeg: number): boolean {
    const criticalAngle = calculateCriticalAngle(n1, n2);
    if (criticalAngle === null) return false;
    return incidentAngleDeg >= criticalAngle;
}

/**
 * Calculate the refracted angle using Snell's Law
 * n1 * sin(θ1) = n2 * sin(θ2)
 * θ2 = arcsin((n1 * sin(θ1)) / n2)
 */
export function calculateRefractedAngle(n1: number, n2: number, incidentAngleDeg: number): number | null {
    if (isTotalInternalReflection(n1, n2, incidentAngleDeg)) {
        return null;
    }

    const incidentAngleRad = degToRad(incidentAngleDeg);
    const sinRefracted = (n1 * Math.sin(incidentAngleRad)) / n2;

    // Check for invalid case (shouldn't happen if TIR check is correct)
    if (sinRefracted > 1 || sinRefracted < -1) {
        return null;
    }

    return radToDeg(Math.asin(sinRefracted));
}

/**
 * Get complete refraction result
 */
export function calculateRefraction(n1: number, n2: number, incidentAngleDeg: number): RefractionResult {
    const criticalAngle = calculateCriticalAngle(n1, n2);
    const isTIR = isTotalInternalReflection(n1, n2, incidentAngleDeg);
    const refractedAngle = isTIR ? null : calculateRefractedAngle(n1, n2, incidentAngleDeg);

    return {
        refractedAngle,
        isTIR,
        criticalAngle,
    };
}

/**
 * Calculate the reflected angle (angle of incidence = angle of reflection)
 */
export function calculateReflectedAngle(incidentAngleDeg: number): number {
    return incidentAngleDeg;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Get common medium names based on refractive index
 */
export function getMediumName(n: number): string {
    if (n < 1.01) return 'Vacuum';
    if (n < 1.05) return 'Air';
    if (n >= 1.30 && n <= 1.35) return 'Water';
    if (n >= 1.45 && n <= 1.55) return 'Glass';
    if (n >= 2.35 && n <= 2.50) return 'Diamond';
    return `n = ${n.toFixed(2)}`;
}
