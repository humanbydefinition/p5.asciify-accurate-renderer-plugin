/**
 * @name Accurate-plugin-renderer-example
 * @description Basic example applying the 'accurate' plugin renderer to a p5.js canvas with p5.asciify.
 * @author humanbydefinition
 * @link https://github.com/humanbydefinition/p5.asciify
 * 
 * This example demonstrates how to apply the 'accurate' plugin renderer to a p5.js canvas.
 * An image (CC0 licensed) is displayed on the canvas and asciified using the 'accurate' renderer.
 * 
 * Attribution:
 * - Brutalist high-rise building image by @AliImran on pexels.com:
 *  - https://www.pexels.com/photo/black-and-white-photo-of-a-brutalist-high-rise-building-17209382/
 */

import p5 from 'p5';
import { p5asciify } from 'p5.asciify';

import { AccurateRendererPlugin } from '../plugin/AccurateRendererPlugin';
import ExampleImage from './brutalist-high-rise-building.jpeg';

const sketch = new p5((p) => {

    let asciifier;
    let img;

    p.preload = () => {
        img = p.loadImage(ExampleImage);
    };

    p.setup = () => {
        p.setAttributes('antialias', false);
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

        p5asciify.registerPlugin(AccurateRendererPlugin);
    };

    p.setupAsciify = () => {
        asciifier = p5asciify.asciifier();

        asciifier.renderers().get("brightness").disable();

        asciifier.renderers().add("accurate", "accurate");

        asciifier.renderers().get("accurate").update({
            characters: asciifier.fontManager.characters.map(charObj => charObj.character).join(''),
            characterColorMode: "sampled",
            backgroundColorMode: "sampled",
        });
    };

    p.draw = () => {
        p.clear();
        p.image(img, -p.windowWidth / 2, -p.windowHeight / 2);
    };

    p.drawAsciify = () => {
        const fpsText = "FPS:" + Math.min(Math.ceil(p.frameRate()), 60);

        p.noStroke();
        p.fill(0);
        p.rect(-p.width / 2, p.height / 2 - p.textAscent() - 4, p.textWidth(fpsText), p.textAscent());

        p.textFont(asciifier.fontManager.font);
        p.textSize(64);
        p.fill(255, 255, 0);
        p.text(fpsText, -p.width / 2, p.height / 2);
    };


    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
});

export default sketch;