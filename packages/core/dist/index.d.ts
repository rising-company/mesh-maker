type PresetName = 'stitch' | 'midnight' | 'neon' | 'aurora' | 'ember' | 'ocean';
interface MeshMakerOptions {
    preset?: PresetName;
    dotSize?: number;
    spacing?: number;
    dotColor?: string;
    dotOpacity?: number;
    hover?: boolean;
    hoverRadius?: number;
    hoverStrength?: number;
    hoverMomentum?: number;
    underlay?: boolean;
    colors?: string[];
    glowIntensity?: number;
    glowSpeed?: number;
    fps?: number;
    pixelRatio?: number;
    animate?: boolean;
}
interface Preset {
    name: string;
    colors: string[];
    defaults?: Partial<Omit<MeshMakerOptions, 'preset' | 'colors'>>;
}

/** Fully resolved options with no optional fields */
interface ResolvedOptions {
    preset: PresetName;
    colors: string[];
    dotSize: number;
    spacing: number;
    dotColor: string;
    dotOpacity: number;
    hover: boolean;
    hoverRadius: number;
    hoverStrength: number;
    hoverMomentum: number;
    underlay: boolean;
    glowIntensity: number;
    glowSpeed: number;
    fps: number;
    pixelRatio: number;
    animate: boolean;
}
/**
 * Resolves user-provided options against preset defaults and global defaults.
 * Pure function — no WebGL or DOM access needed.
 */
declare function resolveOptions(opts: MeshMakerOptions): ResolvedOptions;
declare class MeshMaker {
    private _canvas;
    private _gl;
    private _isWebGL2;
    private _program;
    private _loop;
    private _resizeObserver;
    private _options;
    private _uniforms;
    private _positionBuffer;
    private _mouseTarget;
    private _mouseCurrent;
    private _onMouseMove;
    private _onTouchMove;
    private _onMouseLeave;
    constructor(canvas: HTMLCanvasElement, options?: MeshMakerOptions);
    get isPlaying(): boolean;
    get currentPreset(): PresetName;
    play(): void;
    pause(): void;
    destroy(): void;
    resize(): void;
    setPreset(name: PresetName): void;
    setColors(colors: string[]): void;
    setDotSize(size: number): void;
    setSpacing(spacing: number): void;
    setHover(enabled: boolean): void;
    setUnderlay(enabled: boolean): void;
    private _setupQuad;
    private _cacheUniforms;
    private _uploadStaticUniforms;
    private _uploadColorUniforms;
    private _attachMouseListeners;
    private _detachMouseListeners;
    private _handleResize;
    private _render;
}

declare const presetNames: PresetName[];
declare function getPreset(name: PresetName): Preset;

export { MeshMaker, type MeshMakerOptions, type Preset, type PresetName, type ResolvedOptions, getPreset, presetNames, resolveOptions };
