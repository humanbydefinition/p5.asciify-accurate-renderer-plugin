import p5 from 'p5';
import { p5asciify } from 'p5.asciify';

import { AccurateRendererPlugin } from './plugin/AccurateRendererPlugin';

const sketch = new p5((p) => {

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

        p5asciify.registerPlugin(AccurateRendererPlugin);
    };

    p.setupAsciify = () => {
        p5asciify.asciifier().renderers().get("brightness").update({
            enabled: false,
        });

        p5asciify.asciifier().renderers().add("accurate", "accurate", { enabled: true});

        console.log(p5asciify.asciifier().renderers().getAvailableRendererTypes());
    };

    p.draw = () => {
        p.background(0);
        p.rotateX(p.frameCount * 0.02);
        p.rotateY(p.frameCount * 0.02);
        p.normalMaterial();
        p.box(400);
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
});

export default sketch;