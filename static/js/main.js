document.addEventListener('DOMContentLoaded', async function() {
    // 動態載入 Three.js
    const THREE = await import('https://unpkg.com/three@0.157.0/build/three.module.js');

    // 全域函數宣告
    const isMobile = () => window.innerWidth <= 768;

    // 滾動觀察器選項
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '50px 0px'
    };

    // 創建觀察器實例
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 確保元素是 feature-card
                if (entry.target.classList.contains('feature-card')) {
                    // 添加延遲以確保動畫效果
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, entry.target.dataset.delay || 0);
                } else {
                    entry.target.classList.add('visible');
                }
            }
        });
    }, observerOptions);

    // 觀察所有區段
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // 觀察所有特色卡片
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });

    // 觀察所有統計卡片
    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });

    // 數字動畫函數
    function animateNumber(element) {
        const final = parseInt(element.textContent);
        const duration = 300; // 從 1000 改為 300 毫秒
        const start = 0;
        const increment = final / (duration / 16);
        let current = start;
        
        // 使用更快的緩動函數
        const easeOutQuart = t => 1 - (--t) * t * t * t;
        
        const timer = setInterval(() => {
            const progress = current / final;
            const easedProgress = easeOutQuart(progress);
            
            current += increment * 2; // 增加增量速度
            
            if (current >= final) {
                element.textContent = final.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(final * easedProgress).toLocaleString();
            }
        }, 16);
    }

    // 導航欄滾動效果
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('scrolled');
            navbar.classList.remove('visible');
            return;
        }
        
        if (currentScroll > lastScroll && !navbar.classList.contains('scrolled')) {
            // 向下滾動
            navbar.classList.add('scrolled');
            navbar.classList.remove('visible');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scrolled')) {
            // 向上滾動
            navbar.classList.add('visible');
        }
        
        lastScroll = currentScroll;
    });

    // 平滑滾動
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 添加視差滾動效果
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        document.querySelectorAll('.parallax').forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // 添加滑鼠移動視差效果
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.feature-card, .stat-card');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;
            
            const angleX = (cardCenterY - e.clientY) * 0.01;
            const angleY = (e.clientX - cardCenterX) * 0.01;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        });
    });

    // 添加打字機效果
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // 為標題添加打字機效果
    const titles = document.querySelectorAll('h2');
    titles.forEach(title => {
        const originalText = title.textContent;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter(entry.target, originalText);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(title);
    });

    // 添加滾動進度指示器
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    });

    // 優化數字動畫
    function animateNumber(element) {
        const final = parseInt(element.textContent);
        const duration = 2000;
        const start = 0;
        const increment = final / (duration / 16);
        let current = start;
        
        const easeOutQuad = t => t * (2 - t);
        
        const timer = setInterval(() => {
            const progress = current / final;
            const easedProgress = easeOutQuad(progress);
            
            current += increment;
            
            if (current >= final) {
                element.textContent = final.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(final * easedProgress).toLocaleString();
            }
        }, 16);
    }

    // 資訊卡片互動
    const infoCards = document.querySelectorAll('.info-card');
    const infoPopup = document.querySelector('.info-popup');
    const popupOverlay = document.querySelector('.popup-overlay');
    const popupClose = document.querySelector('.popup-close');
    const popupTitle = infoPopup.querySelector('h3');
    const popupContent = infoPopup.querySelector('p');
    let popupTimeout;

    infoCards.forEach(card => {
        // 桌面版的 hover 效果
        card.addEventListener('mouseenter', (e) => {
            if (!isMobile()) {
                clearTimeout(popupTimeout);
                showPopup(card, false, e);
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!isMobile()) {
                popupTimeout = setTimeout(() => {
                    infoPopup.classList.remove('active');
                }, 300);
            }
        });

        // 手機版的點擊展開功能
        card.addEventListener('click', function(e) {
            if (isMobile()) {
                // 阻止事件冒泡
                e.stopPropagation();
                
                // 關閉其他已展開的卡片
                infoCards.forEach(otherCard => {
                    if (otherCard !== this && otherCard.classList.contains('expanded')) {
                        otherCard.classList.remove('expanded');
                    }
                });
                
                // 切換當前卡片的展開狀態
                this.classList.toggle('expanded');
            }
        });
    });

    // 手機版點擊其他地方關閉展開的卡片
    if (isMobile()) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.info-card')) {
                infoCards.forEach(card => {
                    card.classList.remove('expanded');
                });
            }
        });
    }

    // 顯示彈出視窗函數
    function showPopup(card, isMobileView, event = null) {
        const title = card.dataset.title;
        const content = card.dataset.content;
        
        popupTitle.textContent = title;
        popupContent.textContent = content;
        
        if (isMobileView) {
            // 移動版彈出視窗置中顯示
            infoPopup.style.left = '50%';
            infoPopup.style.top = '50%';
            infoPopup.style.transform = 'translate(-50%, -50%)';
            infoPopup.classList.add('active', 'mobile');
            popupOverlay.classList.add('active');
        } else {
            // 桌面版跟隨滑鼠位置
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const popupWidth = 500;
            const popupHeight = infoPopup.offsetHeight;
            
            let left = mouseX + 20;
            let top = mouseY;
            
            if (left + popupWidth > windowWidth) {
                left = mouseX - popupWidth - 20;
            }
            
            if (top + popupHeight > windowHeight) {
                top = windowHeight - popupHeight - 20;
            }
            
            infoPopup.style.left = `${left}px`;
            infoPopup.style.top = `${top}px`;
            infoPopup.style.transform = 'none';
            infoPopup.classList.add('active');
            infoPopup.classList.remove('mobile');
        }
    }

    // 關閉彈出視窗函數
    function closePopup() {
        infoPopup.classList.remove('active', 'mobile');
        popupOverlay.classList.remove('active');
    }

    // 關閉按鈕件
    popupClose.addEventListener('click', closePopup);

    // 背景遮罩點擊關閉
    popupOverlay.addEventListener('click', closePopup);

    // 點擊其他地方關閉彈出視窗
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.info-card') && 
            !e.target.closest('.info-popup') && 
            infoPopup.classList.contains('active')) {
            closePopup();
        }
    });

    // 防止彈出視窗內部點擊關閉
    infoPopup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 監聽視窗大小變化
    window.addEventListener('resize', () => {
        if (infoPopup.classList.contains('active')) {
            infoPopup.classList.remove('active');
        }
    });

    // 在 DOMContentLoaded 事件處理程序中添加
    const imageViewer = document.querySelector('.fullscreen-image-viewer');
    const viewerImage = imageViewer.querySelector('img');
    const viewerClose = imageViewer.querySelector('.viewer-close');

    // 更新圖片查看器相關代碼
    document.querySelectorAll('.hover-image').forEach(container => {
        const img = container.querySelector('img');
        
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgSrc = img.src;
            
            // 預加載圖片
            const preloadImg = new Image();
            preloadImg.src = imgSrc;
            
            preloadImg.onload = () => {
                viewerImage.src = imgSrc;
                imageViewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            };
        });
    });

    // 更平滑的關閉動畫
    function closeImageViewer() {
        imageViewer.classList.remove('active');
        // 等待過渡動畫完成後再恢復滾動
        setTimeout(() => {
            document.body.style.overflow = '';
        }, 400); // 與 CSS 過渡時間相匹配
    }

    viewerClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeImageViewer();
    });

    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            closeImageViewer();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
            closeImageViewer();
        }
    });

    // 更新統計卡片的互動邏輯
    const statBoxes = document.querySelectorAll('.stat-box');

    function setupInteractions() {
        statBoxes.forEach(box => {
            const hoverCard = box.querySelector('.stat-hover-card');
            const content = box.querySelector('.stat-content');

            // 移除所有現有的事件監聽器
            box.removeEventListener('mouseenter', handleMouseEnter);
            box.removeEventListener('mouseleave', handleMouseLeave);
            box.removeEventListener('click', handleClick);

            if (isMobile()) {
                // 移動版：點擊事件
                box.addEventListener('click', handleClick);
            } else {
                // 桌面版：hover 事件
                box.addEventListener('mouseenter', handleMouseEnter);
                box.addEventListener('mouseleave', handleMouseLeave);
            }
        });
    }

    function handleClick(e) {
        e.stopPropagation();
        const hoverCard = this.querySelector('.stat-hover-card');
        const content = this.querySelector('.stat-content');
        const overlay = document.querySelector('.popup-overlay');

        // 關閉其他所有卡片
        statBoxes.forEach(otherBox => {
            if (otherBox !== this) {
                otherBox.classList.remove('expanded');
            }
        });

        // 切換當前卡片的展開狀態
        this.classList.toggle('expanded');
    }

    function handleMouseEnter() {
        const hoverCard = this.querySelector('.stat-hover-card');
        const content = this.querySelector('.stat-content');
        hoverCard.style.opacity = '1';
        hoverCard.style.visibility = 'visible';
        content.style.opacity = '0';
    }

    function handleMouseLeave() {
        const hoverCard = this.querySelector('.stat-hover-card');
        const content = this.querySelector('.stat-content');
        hoverCard.style.opacity = '0';
        hoverCard.style.visibility = 'hidden';
        content.style.opacity = '1';
    }

    // 初始設置
    setupInteractions();

    // 監聽視窗大小變化
    window.addEventListener('resize', setupInteractions);

    // 點擊其他地方關閉所有卡片
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.stat-box')) {
            statBoxes.forEach(box => {
                box.classList.remove('expanded');
            });
        }
    });

    // 點擊背景遮罩關閉所有卡片
    document.querySelector('.popup-overlay').addEventListener('click', () => {
        statBoxes.forEach(box => {
            box.classList.remove('expanded');
        });
        document.querySelector('.popup-overlay').style.opacity = '0';
        document.querySelector('.popup-overlay').style.visibility = 'hidden';
    });

    // SDGs 波光粼動效果

    // 更新波光粼粼畫
    const heroLead = document.querySelector('#hero .lead');
    if (heroLead) {
        heroLead.classList.add('shine-animation');
    }

    // 初始化 3D 場景
    function initGreenWall() {
        const canvas = document.getElementById('greenWallCanvas');
        if (!canvas) return;

        // 創建場景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f8f8);

        // 調整相機位置和視角
        const camera = new THREE.PerspectiveCamera(
            60,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        // 創建渲染器
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.shadowMap.enabled = true;

        // 建牆面組
        const wallGroup = new THREE.Group();

        // 修改牆體顏色
        const wallGeometry = new THREE.BoxGeometry(4, 3, 0.2);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x646867,  // 改為要求的顏色
            roughness: 0.8,
            metalness: 0.2
        });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wallGroup.add(wall);

        // 替換水池為花園區域
        const gardenArea = createGardenArea();
        wallGroup.add(gardenArea);

        // 增加網格密度
        const gridSize = { x: 15, y: 12 };  // 增加格數量
        const gridGap = { x: 0.25, y: 0.25 };  // 減少網格間距
        const startPos = {
            x: -(gridSize.x * gridGap.x) / 2 + gridGap.x / 2,
            y: -(gridSize.y * gridGap.y) / 2 + gridGap.y / 2
        };

        // 創網格和植物
        for (let i = 0; i < gridSize.x; i++) {
            for (let j = 0; j < gridSize.y; j++) {
                // 創建更細的網格框架
                const frameGeometry = new THREE.BoxGeometry(0.03, 0.03, 0.08);
                const frameMaterial = new THREE.MeshPhongMaterial({
                    color: 0x666666,
                    metalness: 0.8,
                    roughness: 0.2
                });
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                
                frame.position.set(
                    startPos.x + i * gridGap.x,
                    startPos.y + j * gridGap.y,
                    0.1  // 調整網格突出的距離
                );
                wallGroup.add(frame);

                // 增加植物生成機率
                if (Math.random() > 0.2) {  // 提高到 80% 的生成機率
                    const plantGeometry = new THREE.SphereGeometry(0.06, 8, 8);
                    const plantMaterial = new THREE.MeshPhongMaterial({
                        color: new THREE.Color(
                            0.1 + Math.random() * 0.1,
                            0.4 + Math.random() * 0.3,
                            0.1 + Math.random() * 0.1
                        )
                    });
                    const plant = new THREE.Mesh(plantGeometry, plantMaterial);
                    
                    plant.position.set(
                        startPos.x + i * gridGap.x,
                        startPos.y + j * gridGap.y,
                        0.15  // 調整植物突出的距離
                    );
                    
                    // 調整植物大小範圍
                    const scale = 0.9 + Math.random() * 0.3;
                    plant.scale.set(scale, scale, scale * 0.7);
                    
                    wallGroup.add(plant);
                }
            }
        }

        scene.add(wallGroup);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // 自動旋轉和互動控制
        let autoRotate = true;
        const autoRotateSpeed = 0.002;
        let rotationDirection = 1;  // 控制旋轉方向：1 為正向，-1 為反向
        const maxRotationX = Math.PI / 4;
        const maxRotationY = Math.PI / 4;
        let rotationVelocity = { x: 0, y: 0 };
        const dampingFactor = 0.95;

        // 限制旋轉角度的函數
        function clampRotation() {
            wallGroup.rotation.x = Math.max(-maxRotationX, Math.min(maxRotationX, wallGroup.rotation.x));
            
            // 當達到最大旋轉角度時改變方向
            if (Math.abs(wallGroup.rotation.y) >= maxRotationY) {
                rotationDirection *= -1;
                
                // 確保不會超出範圍
                if (wallGroup.rotation.y > 0) {
                    wallGroup.rotation.y = maxRotationY;
                } else {
                    wallGroup.rotation.y = -maxRotationY;
                }
            }
        }

        // 滑鼠互動
        let isMouseDown = false;
        let previousMousePosition = { x: 0, y: 0 };

        canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            autoRotate = false;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;

            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            rotationVelocity = {
                x: deltaMove.y * 0.002,  // 降低滑鼠控制靈敏度
                y: deltaMove.x * 0.002
            };

            wallGroup.rotation.x += rotationVelocity.x;
            wallGroup.rotation.y += rotationVelocity.y;
            
            clampRotation();

            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });

        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
            // 延長回到自動旋轉的時間
            setTimeout(() => {
                autoRotate = true;
            }, 2500);  // 增加到 2.5 秒
        });

        function updateRotation() {
            if (!isMouseDown && !autoRotate) {
                rotationVelocity.x *= dampingFactor;
                rotationVelocity.y *= dampingFactor;
                
                wallGroup.rotation.x += rotationVelocity.x;
                wallGroup.rotation.y += rotationVelocity.y;
                
                clampRotation();
                
                if (Math.abs(rotationVelocity.x) < 0.001 && Math.abs(rotationVelocity.y) < 0.001) {
                    autoRotate = true;
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            updateRotation();
            
            if (autoRotate) {
                wallGroup.rotation.x *= 0.98;  // 垂直角度緩慢回正
                wallGroup.rotation.y += autoRotateSpeed * rotationDirection;  // 根據方向旋轉
                clampRotation();
            }

            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        }

        window.addEventListener('resize', onWindowResize);
        animate();
    }

    // 添加 createGardenArea 函數定義
    function createGardenArea() {
        const gardenGroup = new THREE.Group();
        
        // 創建草地基座
        const grassBaseGeometry = new THREE.BoxGeometry(3, 0.1, 1.2);
        const grassBaseMaterial = new THREE.MeshPhongMaterial({
            color: 0x355828,
            roughness: 1
        });
        const grassBase = new THREE.Mesh(grassBaseGeometry, grassBaseMaterial);
        grassBase.position.set(0, -1.6, 1.2);
        gardenGroup.add(grassBase);

        // 添加草紋理
        const grassCount = 200;
        for (let i = 0; i < grassCount; i++) {
            const grassBlade = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.08, 0.02),
                new THREE.MeshPhongMaterial({
                    color: new THREE.Color(
                        0.2 + Math.random() * 0.1,
                        0.5 + Math.random() * 0.3,
                        0.1 + Math.random() * 0.1
                    )
                })
            );
            
            grassBlade.position.set(
                (Math.random() - 0.5) * 2.8,
                -1.55,
                1.2 + (Math.random() - 0.5) * 1
            );
            
            grassBlade.rotation.x = (Math.random() - 0.5) * 0.2;
            grassBlade.rotation.z = (Math.random() - 0.5) * 0.2;
            
            gardenGroup.add(grassBlade);
        }

        // 添加小樹
        const treePositions = [
            { x: -1, z: 1.4 },
            { x: 0.8, z: 1.6 },
            { x: -0.3, z: 1.2 }
        ];

        treePositions.forEach(pos => {
            // 樹幹
            const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({
                color: 0x4d3319,
                roughness: 0.9
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, -1.4, pos.z);
            
            // 樹冠
            const createLeafLayer = (y, scale) => {
                const leafGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                const leafMaterial = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(
                        0.1 + Math.random() * 0.1,
                        0.4 + Math.random() * 0.2,
                        0.1 + Math.random() * 0.1
                    )
                });
                const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
                leaves.position.set(pos.x, y, pos.z);
                leaves.scale.set(scale, scale * 0.8, scale);
                return leaves;
            };

            gardenGroup.add(trunk);
            gardenGroup.add(createLeafLayer(-1.3, 0.8));
            gardenGroup.add(createLeafLayer(-1.2, 0.7));
            gardenGroup.add(createLeafLayer(-1.1, 0.6));
        });

        return gardenGroup;
    }

    // 調用初始化函數
    initGreenWall();

    // 輪播圖初始化
    function initCarousel() {
        const carousel = document.querySelector('.carousel-container');
        const track = document.querySelector('.carousel-track');
        const slides = track.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        
        let startX;
        let currentTranslate = 0;
        let isDragging = false;
        let currentIndex = 0;
        const slideCount = slides.length;
        let autoPlayInterval;

        // 切換到指定圖片
        function slideTo(index, transition = true) {
            currentIndex = index;
            
            // 處理循環邏輯
            if (currentIndex < 0) {
                currentIndex = slideCount - 1;
            } else if (currentIndex >= slideCount) {
                currentIndex = 0;
            }
            
            currentTranslate = -currentIndex * carousel.clientWidth;
            
            if (transition) {
                track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                track.style.transition = 'none';
            }
            
            track.style.transform = `translateX(${currentTranslate}px)`;
            updateDots();
        }

        // 更新導航點
        function updateDots() {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        // 自動播放控制
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                currentIndex++;
                if (currentIndex >= slideCount) {
                    currentIndex = 0;
                }
                slideTo(currentIndex);
            }, 5000);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
        }

        // 修改拖曳事件處理
        function handleDragStart(e) {
            e.preventDefault(); // 防止圖片被拖出
            if (e.type === "mousedown") {
                startX = e.clientX;
            } else {
                startX = e.touches[0].clientX;
            }
            isDragging = true;
            stopAutoPlay();
            track.style.transition = 'none';
        }

        function handleDragMove(e) {
            if (!isDragging) return;
            e.preventDefault();

            const currentX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
            const diff = currentX - startX;
            const translate = currentTranslate + diff;
            
            // 限制拖曳範圍
            const maxTranslate = 0;
            const minTranslate = -(slideCount - 1) * carousel.clientWidth;
            const boundedTranslate = Math.max(minTranslate, Math.min(maxTranslate, translate));
            
            track.style.transform = `translateX(${boundedTranslate}px)`;
        }

        function handleDragEnd(e) {
            if (!isDragging) return;
            
            isDragging = false;
            const currentX = e.type === "mouseup" ? e.clientX : 
                            (e.changedTouches ? e.changedTouches[0].clientX : startX);
            const diff = currentX - startX;
            const threshold = carousel.clientWidth * 0.1;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // 向右滑動
                    currentIndex--;
                    if (currentIndex < 0) {
                        currentIndex = slideCount - 1;  // 跳到最後一張
                    }
                } else {
                    // 向左滑動
                    currentIndex++;
                    if (currentIndex >= slideCount) {
                        currentIndex = 0;  // 跳第一張
                    }
                }
            }

            track.style.transition = 'transform 0.3s ease-out';
            slideTo(currentIndex);
            startAutoPlay();
        }

        // 修改事件監聽器
        carousel.addEventListener('mousedown', handleDragStart);
        carousel.addEventListener('touchstart', handleDragStart);

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove, { passive: false });

        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);

        // 添加圖的禁止拖曳
        carousel.querySelectorAll('img').forEach(img => {
            img.draggable = false;
            img.addEventListener('dragstart', e => e.preventDefault());
        });

        // 當滑鼠離開容器時立即結束拖曳
        carousel.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                track.style.transition = 'transform 0.3s ease-out';
                slideTo(currentIndex);
                startAutoPlay();
            }
        });

        // 點擊導航點
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                slideTo(index);
                stopAutoPlay();
                startAutoPlay();
            });
        });

        // 處理視窗大小變化
        window.addEventListener('resize', () => {
            slideTo(currentIndex, false);
        });

        // 初始化
        slideTo(0, false);
        startAutoPlay();
    }

    // 在 DOMContentLoaded 中調用
    initCarousel();

    // 在 DOMContentLoaded 事件中添加
    const infoCardObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px'
        }
    );

    infoCards.forEach(card => {
        infoCardObserver.observe(card);
    });

    // 在 DOMContentLoaded 事件中添加
    const modelContainer = document.querySelector('.image-container');
    const modelObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px'
        }
    );

    if (modelContainer) {
        modelObserver.observe(modelContainer);
    }

    // 在 DOMContentLoaded 事件中添加
    const treeForestElements = document.querySelectorAll('#tree-forest .display-4, #tree-forest .lead, #tree-forest .stat-box, #tree-forest .carousel-container');
    const treeForestObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px'
        }
    );

    treeForestElements.forEach(element => {
        treeForestObserver.observe(element);
    });

    // 在 DOMContentLoaded 事件中添加
    const ecoSystemElements = document.querySelectorAll('#eco-system .display-4, #eco-system .stat-card');
    const ecoSystemObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        {
            threshold: 0.2,
            rootMargin: '0px'
        }
    );

    ecoSystemElements.forEach(element => {
        ecoSystemObserver.observe(element);
    });

    // 在 DOMContentLoaded 事件中添加
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            const content = this.getAttribute('data-sdg-content');
            if (!content) return;
            
            const popup = document.querySelector('.sdg-popup');
            const popupContent = popup.querySelector('.popup-content p');
            const popupTitle = popup.querySelector('.popup-content h3');
            const popupOverlay = document.querySelector('.popup-overlay');
            
            popupTitle.textContent = this.querySelector('h4').textContent;
            popupContent.textContent = content;
            
            popup.classList.add('active');
            popupOverlay.classList.add('active');
        });
    });

    // 關閉按鈕事件
    document.querySelector('.popup-close').addEventListener('click', () => {
        const popup = document.querySelector('.sdg-popup');
        const popupOverlay = document.querySelector('.popup-overlay');
        
        popup.classList.remove('active');
        popupOverlay.classList.remove('active');
    });

    // 點擊遮罩關閉
    document.querySelector('.popup-overlay').addEventListener('click', () => {
        const popup = document.querySelector('.sdg-popup');
        const popupOverlay = document.querySelector('.popup-overlay');
        
        popup.classList.remove('active');
        popupOverlay.classList.remove('active');
    });

    // 在 DOMContentLoaded 中添加
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // 關閉其他已展開的卡
                document.querySelectorAll('.feature-card').forEach(otherCard => {
                    if (otherCard !== this && otherCard.classList.contains('expanded')) {
                        otherCard.classList.remove('expanded');
                    }
                });
                
                // 切換當前卡片的展開狀態
                this.classList.toggle('expanded');
            });
        });

        // 點擊其他地方關閉所有展開卡片
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.feature-card')) {
                document.querySelectorAll('.feature-card').forEach(card => {
                    card.classList.remove('expanded');
                });
            }
        });
    }

    // 修改 handleResponsiveLayout 函數
    function handleResponsiveLayout() {
        const isMobileView = window.innerWidth <= 768;
        
        // 處理 SDGs 卡片的響應式
        const featureCards = document.querySelectorAll('.feature-card');
        
        // 先移除所有現有的事件監聽器
        featureCards.forEach(card => {
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
        });

        // 重新獲取所有卡片
        const newFeatureCards = document.querySelectorAll('.feature-card');
        
        if (isMobileView) {
            // 手機版：點擊事件
            newFeatureCards.forEach(card => {
                card.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // 關閉其他已展開的卡片
                    newFeatureCards.forEach(otherCard => {
                        if (otherCard !== this && otherCard.classList.contains('expanded')) {
                            otherCard.classList.remove('expanded');
                        }
                    });
                    
                    // 切換當前卡片的展開狀態
                    this.classList.toggle('expanded');
                });
            });

            // 點擊其他地方關閉所有卡片
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.feature-card')) {
                    newFeatureCards.forEach(card => {
                        card.classList.remove('expanded');
                    });
                }
            });
        }
    }

    // 確保在視窗大小改變時重新綁定事件
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResponsiveLayout, 250);
    });

    // 在 DOMContentLoaded 中初始化
    document.addEventListener('DOMContentLoaded', () => {
        handleResponsiveLayout();
    });

    // AI 按鈕提示功能
    function setupAITooltip() {
        console.log('Setting up AI tooltip');

        const sdgsLink = document.querySelector('a[href="#sdgs"]');
        const gptButton = document.getElementById('gpt-button');
        const chatContainer = document.getElementById('chat-container');
        
        if (!sdgsLink || !gptButton || !chatContainer) {
            console.log('Elements not found:', { sdgsLink, gptButton, chatContainer });
            return;
        }

        // 創建提示元素
        const tooltip = document.createElement('div');
        tooltip.className = 'ai-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            right: 30px;
            bottom: 108px;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 
                0 4px 15px rgba(9, 139, 109, 0.1),
                0 0 0 1px rgba(9, 139, 109, 0.05);
            z-index: 1001;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            transform: translateY(10px);
        `;
        
        tooltip.innerHTML = `
            <div class="tooltip-content" style="
                color: var(--primary-color);
                font-size: 15px;
                font-weight: 500;
                white-space: nowrap;
                text-align: left;
                position: relative;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <i class="fas fa-robot" style="
                    font-size: 18px;
                    color: var(--primary-color);
                "></i>
                點擊此處開始 AI 對話
                <div style="
                    content: '';
                    position: absolute;
                    bottom: -22px;
                    right: 0px;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 10px solid rgba(255, 255, 255, 0.95);
                    filter: drop-shadow(0 2px 2px rgba(9, 139, 109, 0.1));
                "></div>
            </div>
        `;
        document.body.appendChild(tooltip);

        // 點擊 Ai x SDGs 連結時顯示提示
        sdgsLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('SDGs link clicked');
            
            // 檢查聊天室是否已經打開
            if (chatContainer.classList.contains('active')) {
                console.log('Chat is already active, ignoring click');
                return;
            }
            
            // 先移除所有動畫相關的樣式
            tooltip.style.transition = 'none';
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            tooltip.style.transform = 'translateY(10px)';
            gptButton.classList.remove('pulse');
            
            // 強制重繪
            void tooltip.offsetWidth;
            
            // 重新啟用過渡效果
            tooltip.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // 清除任何現有的計時器
            if (tooltip.hideTimeout) {
                clearTimeout(tooltip.hideTimeout);
            }
            
            // 顯示提示
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                tooltip.style.transform = 'translateY(0)';
                gptButton.classList.add('pulse');
                
                console.log('Tooltip activated');
                
                // 0.9秒後隱藏提示
                tooltip.hideTimeout = setTimeout(() => {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.transform = 'translateY(10px)';
                    gptButton.classList.remove('pulse');
                }, 900);
            });
        });

        console.log('AI tooltip setup complete');
    }

    // 確保在 DOM 完全加載後調用
    setupAITooltip();

    // 添加視窗大小改變時的重新檢查
    window.addEventListener('resize', () => {
        // 重新檢查所有卡片
        document.querySelectorAll('.feature-card').forEach(card => {
            if (isElementInViewport(card) && !card.classList.contains('visible')) {
                card.classList.add('visible');
            }
        });
    });

    // 輔助函數：檢查元素是否在視窗中
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -50 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 50 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}); 