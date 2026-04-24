import * as vue from 'vue';
import { PropType } from 'vue';
import { PresetName } from '@rising-company/mesh-maker-core';
export { MeshMakerOptions, Preset, PresetName, getPreset, presetNames } from '@rising-company/mesh-maker-core';

declare const MeshMaker: vue.DefineComponent<vue.ExtractPropTypes<{
    preset: {
        type: PropType<PresetName>;
        default: string;
    };
    colors: {
        type: PropType<string[]>;
        default: undefined;
    };
    dotSize: {
        type: NumberConstructor;
        default: number;
    };
    spacing: {
        type: NumberConstructor;
        default: number;
    };
    dotColor: {
        type: StringConstructor;
        default: string;
    };
    dotOpacity: {
        type: NumberConstructor;
        default: number;
    };
    hover: {
        type: BooleanConstructor;
        default: boolean;
    };
    hoverRadius: {
        type: NumberConstructor;
        default: number;
    };
    hoverStrength: {
        type: NumberConstructor;
        default: number;
    };
    hoverMomentum: {
        type: NumberConstructor;
        default: number;
    };
    underlay: {
        type: BooleanConstructor;
        default: boolean;
    };
    glowIntensity: {
        type: NumberConstructor;
        default: number;
    };
    glowSpeed: {
        type: NumberConstructor;
        default: number;
    };
    fps: {
        type: NumberConstructor;
        default: number;
    };
    pixelRatio: {
        type: NumberConstructor;
        default: undefined;
    };
    animate: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, () => vue.VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, vue.ComponentOptionsMixin, vue.ComponentOptionsMixin, {}, string, vue.PublicProps, Readonly<vue.ExtractPropTypes<{
    preset: {
        type: PropType<PresetName>;
        default: string;
    };
    colors: {
        type: PropType<string[]>;
        default: undefined;
    };
    dotSize: {
        type: NumberConstructor;
        default: number;
    };
    spacing: {
        type: NumberConstructor;
        default: number;
    };
    dotColor: {
        type: StringConstructor;
        default: string;
    };
    dotOpacity: {
        type: NumberConstructor;
        default: number;
    };
    hover: {
        type: BooleanConstructor;
        default: boolean;
    };
    hoverRadius: {
        type: NumberConstructor;
        default: number;
    };
    hoverStrength: {
        type: NumberConstructor;
        default: number;
    };
    hoverMomentum: {
        type: NumberConstructor;
        default: number;
    };
    underlay: {
        type: BooleanConstructor;
        default: boolean;
    };
    glowIntensity: {
        type: NumberConstructor;
        default: number;
    };
    glowSpeed: {
        type: NumberConstructor;
        default: number;
    };
    fps: {
        type: NumberConstructor;
        default: number;
    };
    pixelRatio: {
        type: NumberConstructor;
        default: undefined;
    };
    animate: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
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
}, {}, {}, {}, string, vue.ComponentProvideOptions, true, {}, any>;

export { MeshMaker };
