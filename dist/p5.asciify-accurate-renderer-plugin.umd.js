(function(r,e){typeof exports=="object"&&typeof module<"u"?e(exports,require("p5.asciify")):typeof define=="function"&&define.amd?define(["exports","p5.asciify"],e):(r=typeof globalThis<"u"?globalThis:r||self,e((r.p5=r.p5||{},r.p5["asciify-accurate-renderer-plugin"]={}),r.p5asciify))})(this,function(r,e){"use strict";var F=Object.defineProperty;var x=(r,e,a)=>e in r?F(r,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):r[e]=a;var s=(r,e,a)=>x(r,typeof e!="symbol"?e+"":e,a);const a=t=>`
precision mediump float;uniform sampler2D u_characterTexture;uniform float u_charsetCols,u_charsetRows;uniform sampler2D u_sketchTexture;uniform vec2 u_gridPixelDimensions,u_gridCellDimensions;uniform sampler2D u_charPaletteTexture;uniform vec2 u_charPaletteSize;const float u=float(${t}),f=u*u;void main(){vec2 v=floor(floor(gl_FragCoord.xy).xy),r=u_gridPixelDimensions/u_gridCellDimensions,e=v*r/u_gridPixelDimensions;v=(v+vec2(1))*r/u_gridPixelDimensions-e;bool s=true;float k=1./u;for(int u=0;u<${t};u++){if(!s)break;for(int f=0;f<${t};f++){if(!s)break;vec2 r=vec2(float(f)+.5,float(u)+.5)*k;vec4 i=texture2D(u_sketchTexture,e+r*v);if(i.w>0.)s=false;}}if(s){gl_FragColor=vec4(0);return;}float i=1e20,g=0.,t=u_charPaletteSize.x;for(int u=0;u<1024;u++){if(float(u)>=t)break;vec2 s=vec2((float(u)+.5)/t,.5/u_charPaletteSize.y);vec4 r=texture2D(u_charPaletteTexture,s);float m=r.x*255.+r.y*255.*256.+r.z*255.*65536.,y=floor(m/u_charsetCols);s=vec2((m-u_charsetCols*y)/u_charsetCols,y/u_charsetRows);vec2 C=vec2(1./u_charsetCols,1./u_charsetRows);y=0.;for(int u=0;u<${t};u++)for(int f=0;f<${t};f++){vec2 r=vec2(float(f)+.5,float(u)+.5)*k;float m=texture2D(u_sketchTexture,e+r*v).x-texture2D(u_characterTexture,s+r*C).x;y+=m*m;}y/=f;if(y<i)i=y,g=m;}i=mod(g,256.);g=floor(g/256.);gl_FragColor=vec4(i/255.,g/255.,0,1);}
`,c=(t,i)=>`
precision mediump float;uniform sampler2D u_inputImage;uniform vec2 u_inputImageSize;uniform int u_gridCols,u_gridRows;const int u=${t},f=${i};void main(){vec2 v=floor(gl_FragCoord.xy),e=u_inputImageSize/vec2(float(u_gridCols),float(u_gridRows));v*=e;float i=0.,t=float(u*f);for(int s=0;s<u;s++)for(int g=0;g<f;g++){vec2 m=clamp((v+(vec2(float(s),float(g))+.5)*(e/vec2(float(u),float(f))))/u_inputImageSize,0.,1.);vec4 d=texture2D(u_inputImage,m);float t=.299*d.x+.587*d.y+.114*d.z;i+=t;}i/=t;gl_FragColor=vec4(vec3(i),1);}
`,d=(t,i,n)=>`
precision mediump float;uniform sampler2D u_inputImage,u_inputImageBW;uniform vec2 u_inputImageSize;uniform int u_gridCols,u_gridRows,u_colorRank;const int e=${t},u=${i},f=${n};void main(){vec2 i=floor(gl_FragCoord.xy),t=u_inputImageSize/vec2(float(u_gridCols),float(u_gridRows));i*=t;vec2 k=(i+t*.5)/u_inputImageSize;vec4 v=texture2D(u_inputImage,k),c[e];float b[e];for(int i=0;i<e;i++)c[i]=vec4(0),b[i]=0.;for(int v=0;v<u;v++)for(int k=0;k<f;k++){vec2 s=clamp((i+(vec2(float(v),float(k))+.5)*(t/vec2(float(u),float(f))))/u_inputImageSize,0.,1.);vec4 m=texture2D(u_inputImage,s),d=texture2D(u_inputImageBW,s);float r=step(.5,d.x);bool z=false;if(u_colorRank==1&&r>.5)z=true;else if(u_colorRank==2&&r<=.5)z=true;if(!z)continue;z=false;for(int i=0;i<e;i++)if(m.xyz==c[i].xyz){b[i]+=1.;z=true;break;}if(!z)for(int i=0;i<e;i++)if(b[i]==0.){c[i]=m;b[i]=1.;break;}}float z=0.;vec4 m=vec4(0);for(int i=0;i<e;i++){float u=b[i];vec4 k=c[i];if(u>z)z=u,m=k;}if(u_colorRank==2&&z==0.)m=v;gl_FragColor=vec4(m.xyz,1);}
`,_=`precision mediump float;\r
\r
// Uniforms\r
uniform sampler2D u_inputImage;        // Original input image\r
uniform sampler2D u_brightnessTexture; // Average brightness texture\r
uniform vec2 u_inputImageSize;         // Size of the input image (e.g., 800.0, 800.0)\r
uniform int u_gridCols;                // Number of grid columns (e.g., 100)\r
uniform int u_gridRows;                // Number of grid rows (e.g., 100)\r
uniform float u_pixelRatio;            // Device pixel ratio\r
\r
// Constants\r
const float EPSILON = 0.01;           // Epsilon threshold for floating-point comparison\r
\r
void main() {\r
    // Adjust fragment coordinates based on pixel ratio to get logical pixel position\r
    vec2 logicalFragCoord = floor(gl_FragCoord.xy / u_pixelRatio);\r
\r
    // Calculate the size of each grid cell in logical pixels\r
    float cellWidth = u_inputImageSize.x / float(u_gridCols);\r
    float cellHeight = u_inputImageSize.y / float(u_gridRows);\r
\r
    // Normalize fragment coordinates to [0, 1] for sampling the original image\r
    vec2 imageTexCoord = logicalFragCoord / u_inputImageSize;\r
\r
    // Sample the original image color at the current fragment\r
    vec4 originalColor = texture2D(u_inputImage, imageTexCoord);\r
\r
    // Early return if pixel is transparent\r
    if (originalColor.a < EPSILON) {\r
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\r
        return;\r
    }\r
\r
    // Rest of the brightness processing for non-transparent pixels\r
    float gridX = floor(logicalFragCoord.x / cellWidth);\r
    float gridY = floor(logicalFragCoord.y / cellHeight);\r
\r
    gridX = clamp(gridX, 0.0, float(u_gridCols - 1));\r
    gridY = clamp(gridY, 0.0, float(u_gridRows - 1));\r
\r
    vec2 brightnessTexCoord = (vec2(gridX, gridY) + 0.5) / vec2(float(u_gridCols), float(u_gridRows));\r
    float averageBrightness = texture2D(u_brightnessTexture, brightnessTexCoord).r;\r
\r
    float fragmentBrightness = 0.299 * originalColor.r + 0.587 * originalColor.g + 0.114 * originalColor.b;\r
    float brightnessDifference = fragmentBrightness - averageBrightness;\r
\r
    float finalColorValue = brightnessDifference < -EPSILON ? 0.0 : 1.0;\r
    gl_FragColor = vec4(vec3(finalColorValue), 1.0);\r
}\r
`,o=`precision mediump float;\r
\r
attribute vec3 aPosition;\r
attribute vec2 aTexCoord;\r
\r
varying vec2 v_texCoord;\r
\r
void main() {\r
    vec4 positionVec4 = vec4(aPosition, 1.0);\r
\r
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;\r
\r
    gl_Position = positionVec4;\r
\r
    v_texCoord = aTexCoord;\r
}`,h={enabled:!0,characters:" .:-=+*%@#",characterColor:"#FFFFFF",characterColorMode:"sampled",backgroundColor:"#000000",backgroundColorMode:"sampled",invertMode:!1,rotationAngle:0,flipHorizontally:!1,flipVertically:!1},m=()=>{if(typeof e.renderers<"u"&&e.renderers.renderer2d&&e.renderers.renderer2d.feature&&typeof e.renderers.renderer2d.feature.P5AsciifyAbstractFeatureRenderer2D<"u")return e.renderers.renderer2d.feature.P5AsciifyAbstractFeatureRenderer2D;if(typeof window<"u"&&window.P5AsciifyAbstractFeatureRenderer2D&&typeof window.P5AsciifyAbstractFeatureRenderer2D=="function")return window.P5AsciifyAbstractFeatureRenderer2D;const t=typeof window<"u"?Object.keys(window).filter(i=>i.toLowerCase().includes("asciify")||i.toLowerCase().includes("p5")):[];throw new Error("`P5AsciifyAbstractFeatureRenderer2D` not found. Please ensure p5.asciify is loaded before this plugin. "+(t.length>0?`Found related globals: ${t.join(", ")}`:"No related globals found."))};let l=null;const p=()=>(l===null&&(l=m()),l);class S extends p(){constructor(n,u,f,b,v=h){const C={...h,...v};super(n,u,f,b,C);s(this,"_characterSelectionShader");s(this,"_brightnessSampleShader");s(this,"_colorSampleShader");s(this,"_brightnessSplitShader");s(this,"_brightnessSampleFramebuffer");s(this,"_brightnessSplitFramebuffer");this._characterSelectionShader=this._p.createShader(o,a(this._fontManager.fontSize)),this._brightnessSampleShader=this._p.createShader(o,c(this._grid.cellHeight,this._grid.cellWidth)),this._colorSampleShader=this._p.createShader(o,d(16,this._grid.cellHeight,this._grid.cellWidth)),this._brightnessSplitShader=this._p.createShader(o,_),this._brightnessSampleFramebuffer=this._p.createFramebuffer({density:1,width:this._grid.cols,height:this._grid.rows,depthFormat:this._p.UNSIGNED_INT,textureFiltering:this._p.NEAREST}),this._brightnessSplitFramebuffer=this._p.createFramebuffer({density:1,width:this._captureFramebuffer.width,height:this._captureFramebuffer.height,depthFormat:this._p.UNSIGNED_INT,textureFiltering:this._p.NEAREST})}resizeFramebuffers(){super.resizeFramebuffers(),this._brightnessSampleFramebuffer.resize(this._grid.cols,this._grid.rows),this._brightnessSplitFramebuffer.resize(this._captureFramebuffer.width,this._captureFramebuffer.height)}resetShaders(){this._characterSelectionShader=this._p.createShader(o,a(this._fontManager.fontSize)),this._brightnessSampleShader=this._p.createShader(o,c(this._grid.cellHeight,this._grid.cellWidth)),this._colorSampleShader=this._p.createShader(o,d(16,this._grid.cellHeight,this._grid.cellWidth))}render(){this._brightnessSampleFramebuffer.begin(),this._p.clear(),this._p.shader(this._brightnessSampleShader),this._brightnessSampleShader.setUniform("u_inputImage",this._captureFramebuffer),this._brightnessSampleShader.setUniform("u_inputImageSize",[this._captureFramebuffer.width,this._captureFramebuffer.height]),this._brightnessSampleShader.setUniform("u_gridCols",this._grid.cols),this._brightnessSampleShader.setUniform("u_gridRows",this._grid.rows),this._p.rect(0,0,this._brightnessSampleFramebuffer.width,this._brightnessSampleFramebuffer.height),this._brightnessSampleFramebuffer.end(),this._brightnessSplitFramebuffer.begin(),this._p.clear(),this._p.shader(this._brightnessSplitShader),this._brightnessSplitShader.setUniform("u_inputImage",this._captureFramebuffer),this._brightnessSplitShader.setUniform("u_brightnessTexture",this._brightnessSampleFramebuffer),this._brightnessSplitShader.setUniform("u_inputImageSize",[this._captureFramebuffer.width,this._captureFramebuffer.height]),this._brightnessSplitShader.setUniform("u_gridCols",this._grid.cols),this._brightnessSplitShader.setUniform("u_gridRows",this._grid.rows),this._brightnessSplitShader.setUniform("u_pixelRatio",this._p.pixelDensity()),this._p.rect(0,0,this._brightnessSplitFramebuffer.width,this._brightnessSplitFramebuffer.height),this._brightnessSplitFramebuffer.end(),this._primaryColorFramebuffer.begin(),this._options.characterColorMode===1?this._p.background(this._options.characterColor):(this._p.clear(),this._p.shader(this._colorSampleShader),this._colorSampleShader.setUniform("u_inputImage",this._captureFramebuffer),this._colorSampleShader.setUniform("u_inputImageBW",this._brightnessSplitFramebuffer),this._colorSampleShader.setUniform("u_inputImageSize",[this._captureFramebuffer.width,this._captureFramebuffer.height]),this._colorSampleShader.setUniform("u_gridCols",this._grid.cols),this._colorSampleShader.setUniform("u_gridRows",this._grid.rows),this._colorSampleShader.setUniform("u_colorRank",1),this._p.rect(0,0,this._primaryColorFramebuffer.width,this._primaryColorFramebuffer.height)),this._primaryColorFramebuffer.end(),this._secondaryColorFramebuffer.begin(),this._options.backgroundColorMode===1?this._p.background(this._options.backgroundColor):(this._p.clear(),this._p.shader(this._colorSampleShader),this._colorSampleShader.setUniform("u_inputImage",this._captureFramebuffer),this._colorSampleShader.setUniform("u_inputImageBW",this._brightnessSplitFramebuffer),this._colorSampleShader.setUniform("u_inputImageSize",[this._captureFramebuffer.width,this._captureFramebuffer.height]),this._colorSampleShader.setUniform("u_gridCols",this._grid.cols),this._colorSampleShader.setUniform("u_gridRows",this._grid.rows),this._colorSampleShader.setUniform("u_colorRank",2),this._p.rect(0,0,this._secondaryColorFramebuffer.width,this._secondaryColorFramebuffer.height)),this._secondaryColorFramebuffer.end(),this._transformFramebuffer.begin(),this._p.background(this._options.invertMode?255:0,this._options.flipHorizontally?255:0,this._options.flipVertically?255:0),this._transformFramebuffer.end(),this._rotationFramebuffer.begin(),this._p.background(this._options.rotationAngle),this._rotationFramebuffer.end(),this._characterFramebuffer.begin(),this._p.clear(),this._p.shader(this._characterSelectionShader),this._characterSelectionShader.setUniform("u_characterTexture",this._fontManager.texture),this._characterSelectionShader.setUniform("u_charsetCols",this._fontManager.textureColumns),this._characterSelectionShader.setUniform("u_charsetRows",this._fontManager.textureRows),this._characterSelectionShader.setUniform("u_charPaletteTexture",this._characterColorPalette.framebuffer),this._characterSelectionShader.setUniform("u_charPaletteSize",[this._characterColorPalette.colors.length,1]),this._characterSelectionShader.setUniform("u_sketchTexture",this._brightnessSplitFramebuffer),this._characterSelectionShader.setUniform("u_gridCellDimensions",[this._grid.cols,this._grid.rows]),this._characterSelectionShader.setUniform("u_gridPixelDimensions",[this._grid.width,this._grid.height]),this._p.rect(0,0,this._characterFramebuffer.width,this._characterFramebuffer.height),this._characterFramebuffer.end()}}const g={id:"accurate",name:"Accurate ASCII Renderer",description:"An ASCII renderer that attempts picking the most fitting ASCII representation to accurately represent the input sketch using the available ASCII characters.",version:"1.0.0",author:"humanbydefinition",create(t,i,n,u,f){return new S(t,i,n,u,f||h)}};typeof window<"u"&&(window.AccurateRendererPlugin=g),r.AccurateRendererPlugin=g,Object.defineProperty(r,Symbol.toStringTag,{value:"Module"})});
