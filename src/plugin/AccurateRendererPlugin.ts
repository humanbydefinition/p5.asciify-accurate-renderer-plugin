import p5 from 'p5';
import type { P5AsciifyRendererPlugin } from 'p5.asciify/plugins';
import { P5AsciifyGrid, P5AsciifyFontManager, renderers } from 'p5.asciify';

import { P5AsciifyAccurateRenderer, ACCURATE_DEFAULT_OPTIONS } from './renderer/AccurateAsciiRenderer';
/**
 * The Accurate Renderer Plugin for p5.asciify
 */
export const AccurateRendererPlugin: P5AsciifyRendererPlugin = {
    id: 'accurate',
    name: 'Accurate ASCII Renderer',
    description: 'An ASCII renderer that attempts picking the most fitting ASCII representation to accurately represent the input sketch using the available ASCII characters.',
    version: '1.0.0',
    
    create(
        p: p5,
        captureFramebuffer: p5.Framebuffer,
        grid: P5AsciifyGrid,
        fontManager: P5AsciifyFontManager,
        options?: renderers.AsciiRendererOptions
    ): renderers.P5AsciifyRenderer {
        return new P5AsciifyAccurateRenderer(
            p,
            captureFramebuffer,
            grid,
            fontManager,
            options || ACCURATE_DEFAULT_OPTIONS
        );
    }
};

// Export the plugin as default for easier importing
export default AccurateRendererPlugin;