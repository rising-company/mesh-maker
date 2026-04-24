import * as react_jsx_runtime from 'react/jsx-runtime';
import { CSSProperties } from 'react';
import { MeshMakerOptions } from '@rising-company/mesh-maker-core';
export { MeshMakerOptions, Preset, PresetName, getPreset, presetNames } from '@rising-company/mesh-maker-core';

interface MeshMakerProps extends MeshMakerOptions {
    className?: string;
    style?: CSSProperties;
    id?: string;
}
declare function MeshMaker({ preset, colors, dotSize, spacing, dotColor, dotOpacity, hover, hoverRadius, hoverStrength, hoverMomentum, underlay, glowIntensity, glowSpeed, fps, pixelRatio, animate, className, style, id, }: MeshMakerProps): react_jsx_runtime.JSX.Element;

export { MeshMaker, type MeshMakerProps };
