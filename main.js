// main.js
// サイドバーを読み込む
document.addEventListener('DOMContentLoaded', () => {
    // sidebar.htmlを読み込む
    fetch('/sidebar.html')
        .then(response => response.text())
        .then(html => {
            const header = document.querySelector('header');
            if (header) {
                header.insertAdjacentHTML('afterend', html);
                initMenuToggle();
            }
        })
        .catch(error => console.error('Failed to load sidebar:', error));
});

// creation/AACS.htmlの場合は相対パスを調整
if (window.location.pathname.includes('/creation/')) {
    document.addEventListener('DOMContentLoaded', () => {
        fetch('../sidebar.html')
            .then(response => response.text())
            .then(html => {
                // 相対パスを修正
                html = html.replace(/href="([^/])/g, 'href="../$1');
                const header = document.querySelector('header');
                if (header) {
                    header.insertAdjacentHTML('afterend', html);
                    initMenuToggle();
                }
            })
            .catch(error => console.error('Failed to load sidebar:', error));
    });
}

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

// スクロールテキストアニメーション
document.addEventListener('DOMContentLoaded', () => {
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
});

// カードの浮き上がりアニメーション
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    
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
    
    cards.forEach(card => {
        cardObserver.observe(card);
    });
});


