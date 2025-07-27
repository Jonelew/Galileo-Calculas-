// Universe Explorer - 3D Solar System and Universe Visualization
class UniverseExplorer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.planets = {};
        this.stars = [];
        this.currentView = 'solar';
        this.animationSpeed = 1;
        this.isPlaying = true;
        this.clock = new THREE.Clock();
        this.isMobile = this.detectMobile();
        
        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    init() {
        this.setupScene();
        this.createLighting();
        this.createSolarSystem();
        this.createStarField();
        this.setupControls();
        this.bindEvents();
        this.hideLoadingScreen();
        this.animate();
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(0, 50, 100);
        
        // Create renderer with mobile optimizations
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !this.isMobile, // Disable antialiasing on mobile for better performance
            alpha: true,
            powerPreference: this.isMobile ? "low-power" : "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Optimize pixel ratio for mobile
        this.renderer.setPixelRatio(this.isMobile ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio);
        
        // Reduce shadow quality on mobile
        this.renderer.shadowMap.enabled = !this.isMobile; // Disable shadows on mobile
        if (!this.isMobile) {
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Sun light (point light)
        const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
    }

    createSolarSystem() {
        // Planet data with realistic relative sizes and distances
        const planetData = {
            sun: { 
                size: 10, 
                distance: 0, 
                color: 0xffd54f, 
                rotationSpeed: 0.01,
                orbitSpeed: 0,
                info: {
                    title: "The Sun",
                    description: "The Sun is a G-type main-sequence star that formed approximately 4.6 billion years ago.",
                    facts: [
                        "Mass: 1.989 × 10³⁰ kg",
                        "Temperature: 5,778 K (surface)",
                        "Composition: 73% Hydrogen, 25% Helium",
                        "Age: 4.6 billion years"
                    ]
                }
            },
            mercury: { 
                size: 1.5, 
                distance: 25, 
                color: 0x8c7853, 
                rotationSpeed: 0.02,
                orbitSpeed: 0.04,
                info: {
                    title: "Mercury",
                    description: "Mercury is the smallest planet in our solar system and closest to the Sun.",
                    facts: [
                        "Distance from Sun: 58 million km",
                        "Day length: 59 Earth days",
                        "Year length: 88 Earth days",
                        "Temperature: -173°C to 427°C"
                    ]
                }
            },
            venus: { 
                size: 2, 
                distance: 35, 
                color: 0xff6f00, 
                rotationSpeed: 0.015,
                orbitSpeed: 0.035,
                info: {
                    title: "Venus",
                    description: "Venus is the hottest planet in our solar system due to its thick atmosphere.",
                    facts: [
                        "Distance from Sun: 108 million km",
                        "Day length: 243 Earth days",
                        "Year length: 225 Earth days",
                        "Atmosphere: 96% Carbon Dioxide"
                    ]
                }
            },
            earth: { 
                size: 2.2, 
                distance: 45, 
                color: 0x2196f3, 
                rotationSpeed: 0.02,
                orbitSpeed: 0.03,
                info: {
                    title: "Earth",
                    description: "Earth is the only known planet with life and liquid water on its surface.",
                    facts: [
                        "Distance from Sun: 150 million km",
                        "Day length: 24 hours",
                        "Year length: 365.25 days",
                        "71% of surface covered by water"
                    ]
                }
            },
            mars: { 
                size: 1.8, 
                distance: 60, 
                color: 0xd32f2f, 
                rotationSpeed: 0.018,
                orbitSpeed: 0.025,
                info: {
                    title: "Mars",
                    description: "Mars is known as the Red Planet due to iron oxide on its surface.",
                    facts: [
                        "Distance from Sun: 228 million km",
                        "Day length: 24.6 hours",
                        "Year length: 687 Earth days",
                        "Has the largest volcano: Olympus Mons"
                    ]
                }
            },
            jupiter: { 
                size: 6, 
                distance: 90, 
                color: 0xff9800, 
                rotationSpeed: 0.025,
                orbitSpeed: 0.02,
                info: {
                    title: "Jupiter",
                    description: "Jupiter is the largest planet in our solar system, a gas giant.",
                    facts: [
                        "Distance from Sun: 778 million km",
                        "Day length: 9.9 hours",
                        "Year length: 12 Earth years",
                        "Has over 80 known moons"
                    ]
                }
            },
            saturn: { 
                size: 5, 
                distance: 120, 
                color: 0xffb74d, 
                rotationSpeed: 0.023,
                orbitSpeed: 0.015,
                info: {
                    title: "Saturn",
                    description: "Saturn is famous for its prominent ring system made of ice and rock.",
                    facts: [
                        "Distance from Sun: 1.4 billion km",
                        "Day length: 10.7 hours",
                        "Year length: 29 Earth years",
                        "Density lower than water"
                    ]
                }
            },
            uranus: { 
                size: 3.5, 
                distance: 150, 
                color: 0x00bcd4, 
                rotationSpeed: 0.02,
                orbitSpeed: 0.012,
                info: {
                    title: "Uranus",
                    description: "Uranus rotates on its side and has a unique ring system.",
                    facts: [
                        "Distance from Sun: 2.9 billion km",
                        "Day length: 17.2 hours",
                        "Year length: 84 Earth years",
                        "Rotates on its side (98° tilt)"
                    ]
                }
            },
            neptune: { 
                size: 3.2, 
                distance: 180, 
                color: 0x3f51b5, 
                rotationSpeed: 0.019,
                orbitSpeed: 0.01,
                info: {
                    title: "Neptune",
                    description: "Neptune is the windiest planet with speeds up to 2,100 km/h.",
                    facts: [
                        "Distance from Sun: 4.5 billion km",
                        "Day length: 16.1 hours",
                        "Year length: 165 Earth years",
                        "Strongest winds in solar system"
                    ]
                }
            }
        };

        // Create planets
        Object.keys(planetData).forEach(planetName => {
            const data = planetData[planetName];
            this.createPlanet(planetName, data);
        });

        // Create asteroid belt
        this.createAsteroidBelt();
    }

    createPlanet(name, data) {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        
        let material;
        if (name === 'sun') {
            // Sun with glow effect
            material = new THREE.MeshBasicMaterial({ 
                color: data.color,
                transparent: true,
                opacity: 0.9
            });
            
            // Add glow
            const glowGeometry = new THREE.SphereGeometry(data.size * 1.2, 32, 32);
            const glowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    glowColor: { value: new THREE.Color(0xffd54f) },
                    viewVector: { value: this.camera.position }
                },
                transparent: true,
                blending: THREE.AdditiveBlending,
                vertexShader: `
                    uniform vec3 viewVector;
                    varying float intensity;
                    void main() {
                        vec3 vNormal = normalize(normalMatrix * normal);
                        vec3 vNormel = normalize(normalMatrix * viewVector);
                        intensity = pow(0.8 - dot(vNormal, vNormel), 2.0);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 glowColor;
                    varying float intensity;
                    void main() {
                        vec3 glow = glowColor * intensity;
                        gl_FragColor = vec4(glow, 1.0);
                    }
                `
            });
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            this.scene.add(glow);
        } else {
            material = new THREE.MeshPhongMaterial({ 
                color: data.color,
                shininess: 30
            });
        }
        
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = data.distance;
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.userData = { 
            name, 
            orbitRadius: data.distance, 
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: data.rotationSpeed,
            orbitSpeed: data.orbitSpeed,
            info: data.info
        };
        
        // Create orbit line
        if (data.distance > 0) {
            const orbitGeometry = new THREE.RingGeometry(data.distance - 0.5, data.distance + 0.5, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x444444, 
                transparent: true, 
                opacity: 0.3, 
                side: THREE.DoubleSide 
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);
        }
        
        // Special effects for certain planets
        if (name === 'saturn') {
            this.addSaturnRings(planet, data.size);
        }
        
        this.scene.add(planet);
        this.planets[name] = planet;
    }

    addSaturnRings(planet, planetSize) {
        const ringGeometry = new THREE.RingGeometry(planetSize * 1.2, planetSize * 2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa, 
            transparent: true, 
            opacity: 0.6, 
            side: THREE.DoubleSide 
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }

    createAsteroidBelt() {
        // Reduce asteroid count on mobile for better performance
        const asteroidCount = this.isMobile ? 50 : 200;
        
        for (let i = 0; i < asteroidCount; i++) {
            const asteroidGeometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.1, 8, 8);
            const asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
            
            const distance = 75 + Math.random() * 10;
            const angle = Math.random() * Math.PI * 2;
            asteroid.position.x = Math.cos(angle) * distance;
            asteroid.position.z = Math.sin(angle) * distance;
            asteroid.position.y = (Math.random() - 0.5) * 5;
            
            asteroid.userData = {
                orbitRadius: distance,
                angle: angle,
                orbitSpeed: 0.005 + Math.random() * 0.01
            };
            
            this.scene.add(asteroid);
        }
    }

    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
        
        const starVertices = [];
        // Reduce star count on mobile for better performance
        const starCount = this.isMobile ? 3000 : 10000;
        
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    setupControls() {
        // Check if OrbitControls is available
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 10;
            this.controls.maxDistance = 500;
            console.log('OrbitControls initialized successfully');
        } else {
            console.error('OrbitControls not available - using fallback');
            // Fallback: basic mouse controls
            this.setupBasicControls();
        }
    }

    setupBasicControls() {
        // Mouse controls for desktop
        this.setupMouseControls();
        
        // Touch controls for mobile
        this.setupTouchControls();
    }

    setupMouseControls() {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            this.rotateCamera(deltaX, deltaY);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.zoomCamera(event.deltaY);
        });
    }

    setupTouchControls() {
        let touches = [];
        let lastDistance = 0;
        
        // Prevent default touch behaviors
        this.renderer.domElement.addEventListener('touchstart', (event) => {
            event.preventDefault();
            touches = Array.from(event.touches).map(touch => ({
                x: touch.clientX,
                y: touch.clientY,
                id: touch.identifier
            }));
            
            if (touches.length === 2) {
                // Two finger pinch - calculate initial distance
                const dx = touches[0].x - touches[1].x;
                const dy = touches[0].y - touches[1].y;
                lastDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });
        
        this.renderer.domElement.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const currentTouches = Array.from(event.touches).map(touch => ({
                x: touch.clientX,
                y: touch.clientY,
                id: touch.identifier
            }));
            
            if (touches.length === 1 && currentTouches.length === 1) {
                // Single finger - rotate camera
                const deltaX = currentTouches[0].x - touches[0].x;
                const deltaY = currentTouches[0].y - touches[0].y;
                
                this.rotateCamera(deltaX, deltaY);
                
            } else if (touches.length === 2 && currentTouches.length === 2) {
                // Two finger pinch - zoom
                const dx = currentTouches[0].x - currentTouches[1].x;
                const dy = currentTouches[0].y - currentTouches[1].y;
                const currentDistance = Math.sqrt(dx * dx + dy * dy);
                
                const deltaDistance = currentDistance - lastDistance;
                this.zoomCamera(-deltaDistance * 2); // Negative for natural pinch direction
                
                lastDistance = currentDistance;
            }
            
            touches = currentTouches;
        });
        
        this.renderer.domElement.addEventListener('touchend', (event) => {
            event.preventDefault();
            touches = Array.from(event.touches).map(touch => ({
                x: touch.clientX,
                y: touch.clientY,
                id: touch.identifier
            }));
        });
        
        // Prevent scrolling on the canvas
        this.renderer.domElement.addEventListener('touchcancel', (event) => {
            event.preventDefault();
        });
    }

    rotateCamera(deltaX, deltaY) {
        // Rotate camera around the scene
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position);
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        this.camera.position.setFromSpherical(spherical);
        this.camera.lookAt(0, 0, 0);
    }

    zoomCamera(delta) {
        const distance = this.camera.position.length();
        const newDistance = distance + delta * 0.01;
        this.camera.position.normalize().multiplyScalar(Math.max(10, Math.min(500, newDistance)));
    }

    bindEvents() {
        // View mode buttons
        document.querySelectorAll('.control-btn[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view || e.currentTarget.dataset.view;
                console.log('View button clicked:', view);
                if (view) {
                    this.switchView(view);
                }
            });
        });
        
        // Planet selection buttons
        document.querySelectorAll('.planet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planetName = e.currentTarget.dataset.planet;
                console.log('Planet button clicked:', planetName);
                this.focusOnPlanet(planetName);
            });
        });
        
        // Animation controls
        const speedSlider = document.getElementById('speedSlider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.animationSpeed = parseFloat(e.target.value);
                document.getElementById('speedValue').textContent = this.animationSpeed + 'x';
                console.log('Speed changed to:', this.animationSpeed);
            });
        }
        
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                console.log('Play/Pause clicked');
                this.togglePlayPause();
            });
        }
        
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset clicked');
                this.resetView();
            });
        }
        
        console.log('All event listeners bound successfully');
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.control-btn[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Animate camera to new position
        const targetPosition = this.getViewPosition(view);
        this.animateCameraTo(targetPosition);
        
        // Update info panel
        this.updateInfoPanel(view);
    }

    getViewPosition(view) {
        switch (view) {
            case 'solar':
                return { x: 0, y: 50, z: 200 };
            case 'galaxy':
                return { x: 0, y: 200, z: 800 };
            case 'universe':
                return { x: 0, y: 500, z: 1500 };
            default:
                return { x: 0, y: 50, z: 200 };
        }
    }

    animateCameraTo(targetPosition) {
        const startPosition = this.camera.position.clone();
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, new THREE.Vector3(
                targetPosition.x, targetPosition.y, targetPosition.z
            ), easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    focusOnPlanet(planetName) {
        const planet = this.planets[planetName];
        if (planet) {
            const planetPosition = planet.position.clone();
            const cameraOffset = new THREE.Vector3(0, 20, planet.userData.name === 'sun' ? 50 : 30);
            const targetPosition = planetPosition.add(cameraOffset);
            
            this.animateCameraTo(targetPosition);
            this.updateInfoPanel('planet', planet.userData.info);
        }
    }

    updateInfoPanel(type, data = null) {
        const titleElement = document.getElementById('objectTitle');
        const descriptionElement = document.getElementById('objectDescription');
        
        if (type === 'planet' && data) {
            titleElement.textContent = data.title;
            descriptionElement.innerHTML = `
                <p>${data.description}</p>
                <ul>
                    ${data.facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            `;
        } else {
            // Default view info
            const viewInfo = {
                solar: {
                    title: "Solar System Overview",
                    description: `
                        <p>Our Solar System consists of the Sun and everything that orbits it, including planets, moons, asteroids, comets and meteoroids.</p>
                        <ul>
                            <li><strong>Age:</strong> ~4.6 billion years</li>
                            <li><strong>Location:</strong> Milky Way Galaxy</li>
                            <li><strong>Planets:</strong> 8 major planets</li>
                            <li><strong>Central Star:</strong> The Sun</li>
                        </ul>
                    `
                },
                galaxy: {
                    title: "Milky Way Galaxy",
                    description: `
                        <p>The Milky Way is a barred spiral galaxy containing our Solar System.</p>
                        <ul>
                            <li><strong>Diameter:</strong> ~100,000 light-years</li>
                            <li><strong>Stars:</strong> 100-400 billion</li>
                            <li><strong>Age:</strong> ~13.6 billion years</li>
                            <li><strong>Type:</strong> Barred spiral galaxy</li>
                        </ul>
                    `
                },
                universe: {
                    title: "Observable Universe",
                    description: `
                        <p>The observable universe is the spherical region centered on Earth from which light has had time to reach us.</p>
                        <ul>
                            <li><strong>Age:</strong> ~13.8 billion years</li>
                            <li><strong>Diameter:</strong> ~93 billion light-years</li>
                            <li><strong>Galaxies:</strong> Over 2 trillion</li>
                            <li><strong>Stars:</strong> 10²³ - 10²⁴</li>
                        </ul>
                    `
                }
            };
            
            const info = viewInfo[type] || viewInfo.solar;
            titleElement.textContent = info.title;
            descriptionElement.innerHTML = info.description;
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('playPauseBtn');
        const icon = btn.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
            btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        } else {
            icon.className = 'fas fa-play';
            btn.innerHTML = '<i class="fas fa-play"></i> Play';
        }
    }

    resetView() {
        this.camera.position.set(0, 50, 200);
        this.camera.lookAt(0, 0, 0);
        if (this.controls && this.controls.target) {
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
        this.switchView('solar');
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isPlaying) {
            const deltaTime = this.clock.getDelta();
            
            // Animate planets
            Object.values(this.planets).forEach(planet => {
                const userData = planet.userData;
                
                // Rotation
                planet.rotation.y += userData.rotationSpeed * this.animationSpeed;
                
                // Orbital motion
                if (userData.orbitRadius > 0) {
                    userData.angle += userData.orbitSpeed * this.animationSpeed;
                    planet.position.x = Math.cos(userData.angle) * userData.orbitRadius;
                    planet.position.z = Math.sin(userData.angle) * userData.orbitRadius;
                }
            });
            
            // Animate asteroids
            this.scene.children.forEach(child => {
                if (child.userData && child.userData.orbitRadius && child.userData.orbitSpeed) {
                    child.userData.angle += child.userData.orbitSpeed * this.animationSpeed;
                    child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
                    child.position.z = Math.sin(child.userData.angle) * child.userData.orbitRadius;
                }
            });
        }
        
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // Show mobile welcome message
                if (this.isMobile) {
                    this.showMobileWelcome();
                }
            }, 500);
        }, 2000);
    }

    showMobileWelcome() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            z-index: 1001;
            max-width: 300px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        welcomeDiv.innerHTML = `
            <h3 style="color: #64b5f6; margin-bottom: 15px;">
                <i class="fas fa-rocket"></i> Welcome to Universe Explorer!
            </h3>
            <p style="margin-bottom: 15px; font-size: 14px;">
                <strong>Touch Controls:</strong><br>
                🖱️ One finger: Drag to rotate<br>
                🤏 Two fingers: Pinch to zoom<br>
                👆 Tap planets to explore
            </p>
            <button onclick="this.parentElement.remove()" style="
                background: #64b5f6;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-weight: bold;
            ">Start Exploring! 🚀</button>
        `;
        
        document.body.appendChild(welcomeDiv);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (welcomeDiv.parentElement) {
                welcomeDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the Universe Explorer when page loads
window.addEventListener('load', () => {
    try {
        console.log('Initializing Universe Explorer...');
        const explorer = new UniverseExplorer();
        window.universeExplorer = explorer; // Make it globally accessible for debugging
        console.log('Universe Explorer initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize Universe Explorer:', error);
        // Show error message to user
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; color: white; font-family: Arial, sans-serif;">
                <h1>🚀 Universe Explorer</h1>
                <p>Error loading the application. Please check your browser console for details.</p>
                <p>Make sure you're using a modern browser with WebGL support.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: #64b5f6; border: none; border-radius: 5px; color: white; cursor: pointer;">Reload Page</button>
            </div>
        `;
    }
});