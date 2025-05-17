# p5.asciify `"accurate"` renderer plugin

A renderer plugin for the `p5.asciify` library that provides an additional renderer option `"accurate"` to add to any rendering pipeline. This renderer attempts to attempts to pick the most fitting ASCII representation to accurately represent the input sketch using the available ASCII characters.

> [!NOTE]
> This repository is still in development and not yet ready for production use, as the plugin system is not yet officially released with `p5.asciify`. The plugin is currently in a pre-release state and is not yet available on npm or any other package manager.

## Installation

### Prerequisites

- Plugins renderers require [`p5.asciify`](#) version `0.9.5` or later.
- The plugin is compatible with all `p5.js` versions that are compatible with `p5.asciify`.
  - This includes `p5.js` versions `1.8.0` to `1.x.x`, and `p5.js` versions `>=2.0.2`.

### Importing the plugin

#### Global mode

Download the latest `umd` version of this plugin from the [**GitHub releases page**](#) or import it directly from a CDN like [**jsDelivr**](#). The plugin is distributed as a single JavaScript file, which you can include in your project by adding the following script tag to your HTML file <u>after</u> importing `p5.asciify`:

```html
<!-- Import p5.js before p5.asciify -->
<script src="path/to/library/p5.min.js"></script>

<!-- Import p5.asciify after p5.js -->
<script src="path/to/library/p5.asciify.umd.js"></script>

<!-- Import the plugin after p5.asciify -->
<script src="path/to/library/p5.asciify.accurate.umd.js"></script>
```

#### Instance mode

Download the latest `esm` version of this plugin from the [**GitHub releases page**](#), import it directly from a CDN like [**jsDelivr**](#), or install it using `npm`:

```bash
npm install p5.asciify.accurate.renderer
```

```javascript
import p5 from 'p5';
import { p5asciify } from 'p5.asciify';
import { AccurateRendererPlugin } from 'p5.asciify.accurate.renderer';

const sketch = (p) => {

    let asciifier;

    p.setup = () => {
      p.createCanvas(800, 800, p.WEBGL);
    };

    p.setupAsciify = () => {
      p5asciify.registerPlugin(AccurateRendererPlugin);

      asciifier = p5asciify.asciifier();
      asciifier.renderers().disable();
      asciifier.renderers().add("accurate", "accurate", { enabled: true });
    };

    p.draw = () => {
      p.clear();
      p.background(0);
      p.fill(255);
      p.rotateX(p.radians(p.frameCount * 3));
      p.rotateZ(p.radians(p.frameCount));
      p.directionalLight(255, 255, 255, 0, 0, -1);
      p.box(800, 100, 100);
    };
};

let myp5 = new p5(sketch);
```

## Usage

To use the `"accurate"` renderer, you need to register the plugin with `p5.asciify` using `registerPlugin(AccurateRendererPlugin)`, and add it to a rendering pipeline of a `P5Asciifier` instance. The `"accurate"` renderer can then be used in the same way as the pre-defined `"brightness"` renderer.

```javascript
let asciifier;
let accurateRenderer;

function setup() {
  createCanvas(800, 800, WEBGL);
}

function setupAsciify() {
  p5asciify.registerPlugin(AccurateRendererPlugin);

  asciifier = p5asciify.asciifier();
  asciifier.renderers().disable();

  accurateRenderer = asciifier.renderers().add("accurate", "accurate", { enabled: true });

  accurateRenderer.update({
    enabled: true, // redundant, but for clarity
    characters: " .:-=+*%@#",
    characterColor: "#ffffff",
    characterColorMode: "sampled", // or "fixed"
    backgroundColor: "#000000",
    backgroundColorMode: "sampled", // or "fixed"
    invertMode: false, // swap char and bg colors
    rotationAngle: 0, // rotation angle in degrees
    flipVertically: false, // flip chars vertically
    flipHorizontally: false, // flip chars horizontally
  });
}

function draw() {
  background(32);
  fill(255);
  rotateX(radians(frameCount * 3));
  rotateZ(radians(frameCount));
  directionalLight(255, 255, 255, 0, 0, -1);
  box(400, 100, 100);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}