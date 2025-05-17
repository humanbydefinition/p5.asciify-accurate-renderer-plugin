import { plugins } from 'p5.asciify';
declare global {
    interface Window {
        AccurateRendererPlugin: plugins.P5AsciifyRendererPlugin;
    }
}
/**
 * `p5.asciify` plugin that provides an accurate ASCII renderer.
 * This renderer attempts to pick the most fitting ASCII representation
 * to accurately represent the input sketch using the available ASCII characters.
 */
export declare const AccurateRendererPlugin: plugins.P5AsciifyRendererPlugin;
