// WebGL canvas animation
class PortfolioAnimation {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.ctx) {
            // WebGLが使用できない場合、フォールバック
            this.setupCanvasFallback();
            return;
        }
        
        this.setupWebGL();
        this.animate();
    }

    setupWebGL() {
        const gl = this.ctx;
        
        // ウィンドウサイズに合わせてキャンバスをリサイズ
        this.resizeCanvas();
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0.98, 0.98, 0.98, 1.0);
        
        // シンプルな頂点シェーダー
        const vertexShaderSource = `
            attribute vec2 position;
            uniform float time;
            
            varying vec2 vPos;
            
            void main() {
                vPos = position;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
        
        // フラグメントシェーダー（爽やかなパーティクルエフェクト）
        const fragmentShaderSource = `
            precision highp float;
            
            varying vec2 vPos;
            uniform float time;
            uniform vec2 resolution;
            
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                return mix(a, b, u.x) +
                       (c - a) * u.y * (1.0 - u.x) +
                       (d - b) * u.y * u.x;
            }
            
            void main() {
                vec2 st = gl_FragCoord.xy / resolution.xy;
                st *= 3.0;
                
                float n = noise(st + time * 0.3);
                float n2 = noise(st * 2.0 - time * 0.2);
                
                // 爽やかなグラデーション背景（白～薄い水色）
                vec3 color = mix(
                    vec3(0.98, 0.99, 1.0),
                    vec3(0.95, 0.98, 1.0),
                    sin(time * 0.1 + n) * 0.5 + 0.5
                );
                
                // 光の粒子を強調（爽やかな水色系）
                float particle = smoothstep(0.85, 0.0, length(fract(st + time * 0.5) - 0.5) * 2.5);
                float particle2 = smoothstep(0.9, 0.0, length(fract(st * 1.5 - time * 0.3) - 0.5) * 2.0);
                float particle3 = smoothstep(0.8, 0.0, length(fract(st * 2.0 + time * 0.2) - 0.5) * 3.0);
                
                // 爽やかな光の色（強度UP）
                vec3 lightColor1 = vec3(0.5, 0.85, 1.0) * particle * (0.8 + 0.4 * sin(time + n));
                vec3 lightColor2 = vec3(0.4, 0.8, 0.95) * particle2 * (0.7 + 0.5 * cos(time * 0.7));
                vec3 lightColor3 = vec3(0.6, 0.9, 1.0) * particle3 * (0.6 + 0.6 * sin(time * 0.5));
                
                color += (lightColor1 + lightColor2 + lightColor3) * 0.6;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        this.program = this.createProgram(gl, vertexShaderSource, fragmentShaderSource);
        
        if (!this.program) {
            this.setupCanvasFallback();
            return;
        }
        
        gl.useProgram(this.program);
        
        // VAOの設定
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        const positions = [
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ];
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        const positionAttrib = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
        
        this.timeUniform = gl.getUniformLocation(this.program, 'time');
        this.resolutionUniform = gl.getUniformLocation(this.program, 'resolution');
        
        // リサイズイベント
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createProgram(gl, vertexSource, fragmentSource) {
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) return null;
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking failed:', gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    onWindowResize() {
        this.resizeCanvas();
        if (this.ctx) {
            this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    animate() {
        const gl = this.ctx;
        if (!gl) return;
        
        const time = Date.now() * 0.001;
        
        gl.uniform1f(this.timeUniform, time);
        gl.uniform2f(this.resolutionUniform, this.canvas.width, this.canvas.height);
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(() => this.animate());
    }

    setupCanvasFallback() {
        // WebGLが使用できない場合のフォールバック
        const canvas = this.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        class Particle {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 3;
                this.vy = (Math.random() - 0.5) * 3;
                this.radius = Math.random() * 4 + 2;
                this.alpha = Math.random() * 0.6 + 0.2;
                this.hue = Math.random() * 40 + 190; // 爽やかな水色系（190-230°）
                this.life = 300;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= 2;
                this.alpha = (this.life / 300) * (Math.random() * 0.7 + 0.3);
                
                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.life <= 0) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.fillStyle = `hsla(${this.hue}, 90%, 60%, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // グロー効果
                ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha * 0.5})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        
        const particles = Array.from({length: 200}, () => new Particle());
        
        const animate2d = () => {
            // 爽やかな背景
            ctx.fillStyle = 'rgba(245, 250, 255, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animate2d);
        };
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        
        animate2d();
    }
}

// ページ読み込み時にアニメーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioAnimation();
});
