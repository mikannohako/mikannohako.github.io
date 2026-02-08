// main.js
// サイドバーを読み込む関数
function loadSidebar() {
    // ページの場所に基づいて相対パスを決定
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    let sidebarPath = '/sidebar.html';
    let linkPathPrefix = '';
    
    // creation/フォルダ内のページの場合
    if (pathSegments.includes('creation')) {
        sidebarPath = '../sidebar.html';
        linkPathPrefix = '../';
    }
    
    fetch(sidebarPath)
        .then(response => response.text())
        .then(html => {
            // リンクのパスを調整
            if (linkPathPrefix) {
                html = html.replace(/href="(?!\.\.\/|#|https?:\/\/)([^/])/g, `href="${linkPathPrefix}$1`);
            }
            const header = document.querySelector('header');
            if (header) {
                header.insertAdjacentHTML('afterend', html);
                initMenuToggle();
            }
        })
        .catch(error => console.error('Failed to load sidebar:', error));
}

// DOMContentLoadedで実行
document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    initScrollTextAnimation();
    initCardAnimation();
});

function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // メニュー外をクリックしたら閉じる
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                if (sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });

        // メニュー内のリンククリックで閉じる
        const menuLinks = sidebar.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}


// スクロールテキストアニメーション関数
function initScrollTextAnimation() {
    const scrollTexts = document.querySelectorAll('.scroll-text');
    
    // 各テキストの文字を個別のspanで囲む
    scrollTexts.forEach(text => {
        const dataText = text.getAttribute('data-text');
        if (dataText) {
            // HTMLエンティティをデコード
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = dataText;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            
            // 文字ごとにspanで囲む
            let html = '';
            let charIndex = 0;
            for (let i = 0; i < plainText.length; i++) {
                const char = plainText[i];
                if (char === '\n') {
                    html += '<br>';
                } else {
                    html += `<span class="char" style="animation-delay: ${charIndex * 0.05}s;">${char}</span>`;
                    charIndex++;
                }
            }
            text.innerHTML = html;
        }
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // 全ての文字要素にアニメーションクラスを追加
                const chars = entry.target.querySelectorAll('.char');
                chars.forEach(char => {
                    char.classList.add('char-animate');
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-50px'
    });
    
    scrollTexts.forEach(text => {
        observer.observe(text);
    });
}

// カードの浮き上がりアニメーション関数
function initCardAnimation() {
    // アニメーション対象の要素を取得
    const elements = document.querySelectorAll('.card, .project-card, .intro-card, .timeline-node, .feature-card, .detail-section, .process-step, .roadmap-item');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 遅延を追加して順番に表示
                setTimeout(() => {
                    entry.target.classList.add('card-animate');
                }, index * 150);
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });
    
    elements.forEach(element => {
        cardObserver.observe(element);
    });
}

// スクロールインジケータの表示/非表示
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const scrollTextSection = document.querySelector('.scroll-text-section');
    if (!scrollIndicator || !scrollTextSection) return;

    window.addEventListener('scroll', () => {
        // ポエムセクションの開始と終了位置を取得
        const sectionStart = scrollTextSection.offsetTop;
        const sectionEnd = scrollTextSection.offsetTop + scrollTextSection.offsetHeight;
        const currentScroll = window.scrollY + window.innerHeight;
        
        // ポエムセクション内では非表示、それ以外では表示
        if (currentScroll > sectionStart + 100) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.pointerEvents = 'auto';
        }
    });
}

// DOMContentLoadedで実行
document.addEventListener('DOMContentLoaded', () => {
    loadSidebar();
    initScrollTextAnimation();
    initCardAnimation();
    initScrollIndicator();
});
