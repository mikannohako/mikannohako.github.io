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


