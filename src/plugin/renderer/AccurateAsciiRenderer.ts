import p5 from 'p5';

import { renderers } from 'p5.asciify';
import { P5AsciifyGrid } from 'p5.asciify';

import { generateCharacterSelectionShader, generateBrightnessSampleShader, generateColorSampleShader } from './shaders/shaderGenerators.min';
import brightnessSplitShader from './shaders/brightnessSplit.frag?raw';
import vertexShader from './shaders/shader.vert?raw';
import { P5AsciifyFontManager } from 'p5.asciify';

/** 
 * Default configuration options for `"accurate"` ASCII renderer. 
 * 
 * If there are options not provided during the creation of the renderer, the default options will be used.
 */
export const ACCURATE_DEFAULT_OPTIONS = {
    /** Enable/disable the renderer */
    enabled: true,
    /** Characters used for pattern matching */
    characters: " .:-=+*%@#",
    /** Color of the ASCII characters. Only used when `characterColorMode` is set to `fixed` */
    characterColor: "#FFFFFF",
    /** Character color mode */
    characterColorMode: "sampled",
    /** Cell background color. Only used when `characterColorMode` is set to `fixed` */
    backgroundColor: "#000000",
    /** Background color mode */
    backgroundColorMode: "sampled",
    /** Swap the cells ASCII character colors with it's cell background colors */
    invertMode: false,
    /** Rotation angle of all characters in the grid in degrees */
    rotationAngle: 0,
    /** Flip the ASCII characters horizontally */
    flipHorizontally: false,
    /** Flip the ASCII characters vertically */
    flipVertically: false,
}

/**
 * Safely retrieves the base class with multiple fallback strategies.
 * This function handles both ESM and UMD/GLOBAL modes.
 */
const getBaseClass = (): typeof renderers.renderer2d.feature.P5AsciifyAbstractFeatureRenderer2D => {
    // Strategy 1: ESM mode - direct import (most reliable)
    if (typeof renderers !== 'undefined' && 
        renderers.renderer2d && 
        renderers.renderer2d.feature && 
        typeof renderers.renderer2d.feature.P5AsciifyAbstractFeatureRenderer2D !== 'undefined') {
        return renderers.renderer2d.feature.P5AsciifyAbstractFeatureRenderer2D;
    }
    
    // Strategy 2: UMD/GLOBAL mode - direct window export
    if (typeof window !== 'undefined' && 
        window.P5AsciifyAbstractFeatureRenderer2D && 
        typeof window.P5AsciifyAbstractFeatureRenderer2D === 'function') {
        return window.P5AsciifyAbstractFeatureRenderer2D;
    }
    
    // If all strategies fail, provide helpful error information
    const availableGlobals = typeof window !== 'undefined' ? Object.keys(window).filter(key => 
        key.toLowerCase().includes('asciify') || key.toLowerCase().includes('p5')
    ) : [];
    
    throw new Error(
        '`P5AsciifyAbstractFeatureRenderer2D` not found. ' +
        'Please ensure p5.asciify is loaded before this plugin. ' +
        (availableGlobals.length > 0 ? 
            `Found related globals: ${availableGlobals.join(', ')}` : 
            'No related globals found.')
    );
};

/**
 * Cached base class to avoid repeated lookups.
 */
let cachedBaseClass: typeof renderers.renderer2d.feature.P5AsciifyAbstractFeatureRenderer2D | null = null;

/**
 * Gets the base class with caching for performance.
 */
const getCachedBaseClass = (): typeof renderers.renderer2d.feature.P5AsciifyAbstractFeatureRenderer2D => {
    if (cachedBaseClass === null) {
        cachedBaseClass = getBaseClass();
    }
    return cachedBaseClass;
};

/**
 * An ASCII renderer that attempts picking the most fitting ASCII representation to accurately represent the input sketch using the available ASCII characters.
 */
export class P5AsciifyAccurateRenderer extends getCachedBaseClass() {
    private _characterSelectionShader: p5.Shader;
    private _brightnessSampleShader: p5.Shader;
    private _colorSampleShader: p5.Shader;
    private _brightnessSplitShader: p5.Shader;
    private _brightnessSampleFramebuffer: p5.Framebuffer;
    private _brightnessSplitFramebuffer: p5.Framebuffer;

    /**
     * Creates a new `"accurate"` ASCII renderer instance.
     * @param p5Instance The p5 instance.
     * @param captureFramebuffer The framebuffer to apply the ASCII effect to.
     * @param grid Grid object containing the relevant grid information.
     * @param fontManager The font texture atlas containing the ASCII characters texture.
     * @param options The options for the ASCII renderer.
     * @ignore
     */
    constructor(
        p5Instance: p5,
        captureFramebuffer: p5.Framebuffer,
        grid: P5AsciifyGrid,
        fontManager: P5AsciifyFontManager,
        options: renderers.FeatureAsciiRendererOptions = ACCURATE_DEFAULT_OPTIONS
    ) {
        const mergedOptions = { ...ACCURATE_DEFAULT_OPTIONS, ...options };
        super(p5Instance, captureFramebuffer, grid, fontManager, mergedOptions);

        this._characterSelectionShader = this._p.createShader(vertexShader, generateCharacterSelectionShader(this._fontManager.fontSize));
        this._brightnessSampleShader = this._p.createShader(vertexShader, generateBrightnessSampleShader(this._grid.cellHeight, this._grid.cellWidth));
        this._colorSampleShader = this._p.createShader(vertexShader, generateColorSampleShader(16, this._grid.cellHeight, this._grid.cellWidth));
        this._brightnessSplitShader = this._p.createShader(vertexShader, brightnessSplitShader);

        this._brightnessSampleFramebuffer = this._p.createFramebuffer({
            density: 1,
            width: this._grid.cols,
            height: this._grid.rows,
            depthFormat: this._p.UNSIGNED_INT,
            textureFiltering: this._p.NEAREST
        });
        this._brightnessSplitFramebuffer = this._p.createFramebuffer({
            density: 1,
            width: this._captureFramebuffer.width,
            height: this._captureFramebuffer.height,
            depthFormat: this._p.UNSIGNED_INT,
            textureFiltering: this._p.NEAREST
        });
    }

    resizeFramebuffers(): void {
        super.resizeFramebuffers();
        this._brightnessSampleFramebuffer.resize(this._grid.cols, this._grid.rows);
        this._brightnessSplitFramebuffer.resize(this._captureFramebuffer.width, this._captureFramebuffer.height);
    }

    resetShaders(): void {
        this._characterSelectionShader = this._p.createShader(vertexShader, generateCharacterSelectionShader(this._fontManager.fontSize));
        this._brightnessSampleShader = this._p.createShader(vertexShader, generateBrightnessSampleShader(this._grid.cellHeight, this._grid.cellWidth));
        this._colorSampleShader = this._p.createShader(vertexShader, generateColorSampleShader(16, this._grid.cellHeight, this._grid.cellWidth));
    }

    render(): void {
        // Brightness sample pass
        this._brightnessSampleFramebuffer.begin();
        this._p.clear();
        this._p.shader(this._brightnessSampleShader);
        this._brightnessSampleShader.setUniform('u_inputImage', this._captureFramebuffer);
        this._brightnessSampleShader.setUniform('u_inputImageSize', [this._captureFramebuffer.width, this._captureFramebuffer.height]);
        this._brightnessSampleShader.setUniform('u_gridCols', this._grid.cols);
        this._brightnessSampleShader.setUniform('u_gridRows', this._grid.rows);
        this._p.rect(0, 0, this._brightnessSampleFramebuffer.width, this._brightnessSampleFramebuffer.height);
        this._brightnessSampleFramebuffer.end();

        // Brightness split pass
        this._brightnessSplitFramebuffer.begin();
        this._p.clear();
        this._p.shader(this._brightnessSplitShader);
        this._brightnessSplitShader.setUniform('u_inputImage', this._captureFramebuffer);
        this._brightnessSplitShader.setUniform('u_brightnessTexture', this._brightnessSampleFramebuffer);
        this._brightnessSplitShader.setUniform('u_inputImageSize', [this._captureFramebuffer.width, this._captureFramebuffer.height]);
        this._brightnessSplitShader.setUniform('u_gridCols', this._grid.cols);
        this._brightnessSplitShader.setUniform('u_gridRows', this._grid.rows);
        this._brightnessSplitShader.setUniform('u_pixelRatio', this._p.pixelDensity());
        this._p.rect(0, 0, this._brightnessSplitFramebuffer.width, this._brightnessSplitFramebuffer.height);
        this._brightnessSplitFramebuffer.end();

        // Primary color sample pass
        this._primaryColorFramebuffer.begin();
        if (this._options.characterColorMode === 1) {
            this._p.background(this._options.characterColor as p5.Color);
        } else {
            this._p.clear();
            this._p.shader(this._colorSampleShader);
            this._colorSampleShader.setUniform('u_inputImage', this._captureFramebuffer);
            this._colorSampleShader.setUniform('u_inputImageBW', this._brightnessSplitFramebuffer);
            this._colorSampleShader.setUniform('u_inputImageSize', [this._captureFramebuffer.width, this._captureFramebuffer.height]);
            this._colorSampleShader.setUniform('u_gridCols', this._grid.cols);
            this._colorSampleShader.setUniform('u_gridRows', this._grid.rows);
            this._colorSampleShader.setUniform('u_colorRank', 1);
            this._p.rect(0, 0, this._primaryColorFramebuffer.width, this._primaryColorFramebuffer.height);
        }
        this._primaryColorFramebuffer.end();

        // Secondary color sample pass
        this._secondaryColorFramebuffer.begin();
        if (this._options.backgroundColorMode === 1) {
            this._p.background(this._options.backgroundColor as p5.Color);
        } else {
            this._p.clear();
            this._p.shader(this._colorSampleShader);
            this._colorSampleShader.setUniform('u_inputImage', this._captureFramebuffer);
            this._colorSampleShader.setUniform('u_inputImageBW', this._brightnessSplitFramebuffer);
            this._colorSampleShader.setUniform('u_inputImageSize', [this._captureFramebuffer.width, this._captureFramebuffer.height]);
            this._colorSampleShader.setUniform('u_gridCols', this._grid.cols);
            this._colorSampleShader.setUniform('u_gridRows', this._grid.rows);
            this._colorSampleShader.setUniform('u_colorRank', 2);
            this._p.rect(0, 0, this._secondaryColorFramebuffer.width, this._secondaryColorFramebuffer.height);
        }
        this._secondaryColorFramebuffer.end();

        this._transformFramebuffer.begin();
        this._p.background(this._options.invertMode ? 255 : 0, this._options.flipHorizontally ? 255 : 0, this._options.flipVertically ? 255 : 0);
        this._transformFramebuffer.end();

        this._rotationFramebuffer.begin();
        this._p.background(this._options.rotationAngle as p5.Color);
        this._rotationFramebuffer.end();

        // ASCII character pass
        this._characterFramebuffer.begin();
        this._p.clear();
        this._p.shader(this._characterSelectionShader);
        this._characterSelectionShader.setUniform('u_characterTexture', this._fontManager.texture);
        this._characterSelectionShader.setUniform('u_charsetCols', this._fontManager.textureColumns);
        this._characterSelectionShader.setUniform('u_charsetRows', this._fontManager.textureRows);
        this._characterSelectionShader.setUniform('u_charPaletteTexture', this._characterColorPalette.framebuffer);
        this._characterSelectionShader.setUniform('u_charPaletteSize', [this._characterColorPalette.colors.length, 1]);
        this._characterSelectionShader.setUniform('u_sketchTexture', this._brightnessSplitFramebuffer);
        this._characterSelectionShader.setUniform('u_gridCellDimensions', [this._grid.cols, this._grid.rows]);
        this._characterSelectionShader.setUniform('u_gridPixelDimensions', [this._grid.width, this._grid.height]);
        this._p.rect(0, 0, this._characterFramebuffer.width, this._characterFramebuffer.height);
        this._characterFramebuffer.end();
    }
}