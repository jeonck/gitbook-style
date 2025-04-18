document.addEventListener('DOMContentLoaded', () => {
    class GuideComponents {
        static initializePage() {
            this.generateToc();
            this.initializeNavigation();
        }

        static generateToc() {
            const content = document.querySelector('.md-content__inner');
            const toc = this.buildTocFromContent(content);
            this.renderToc(toc);
        }

        static buildTocFromContent(content) {
            const sections = [];
            const headings = content.querySelectorAll('h2, h3');
            let currentSection = null;

            headings.forEach(heading => {
                const id = heading.id || this.generateId(heading);
                heading.id = id;

                if (heading.tagName === 'H2') {
                    currentSection = {
                        id: id,
                        title: heading.textContent,
                        items: []
                    };
                    sections.push(currentSection);
                } else if (heading.tagName === 'H3' && currentSection) {
                    currentSection.items.push({
                        id: id,
                        title: heading.textContent
                    });
                }
            });

            return sections;
        }

        static generateId(element) {
            return element.textContent
                .toLowerCase()
                .replace(/[^a-z0-9가-힣\s]/g, '')
                .replace(/\s+/g, '-');
        }

        static renderToc(sections) {
            const container = document.querySelector('.md-sidebar--secondary .md-sidebar__inner');
            if (!container) return;

            const tocHtml = `
                <nav class="md-nav md-nav--secondary">
                    <ul class="md-nav__list">
                        ${sections.map(section => this.renderTocSection(section)).join('')}
                    </ul>
                </nav>
            `;
            container.innerHTML = tocHtml;
        }

        static renderTocSection(section) {
            const subItems = section.items ? `
                <ul class="md-nav__list">
                    ${section.items.map(item => `
                        <li class="md-nav__item">
                            <a href="#${item.id}" class="md-nav__link">${item.title}</a>
                        </li>
                    `).join('')}
                </ul>
            ` : '';

            return `
                <li class="md-nav__item">
                    <a href="#${section.id}" class="md-nav__link">${section.title}</a>
                    ${subItems}
                </li>
            `;
        }

        static initializeNavigation() {
            const navigation = new GuideNavigation();
            navigation.init();
        }
    }

    class GuideNavigation {
        constructor() {
            this.options = {
                sidebarSelector: '.md-nav--secondary',
                linkSelector: '.md-nav__link',
                activeClass: 'md-nav__link--active',
                scrollOffset: 80
            };
        }

        init() {
            this.setupEventListeners();
            this.setupScrollSpy();
        }

        setupEventListeners() {
            document.querySelectorAll(`${this.options.sidebarSelector} ${this.options.linkSelector}`).forEach(link => {
                link.addEventListener('click', (e) => this.handleLinkClick(e));
            });
        }

        handleLinkClick(e) {
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    this.removeActiveStates();
                    e.target.classList.add(this.options.activeClass);
                    
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }

        setupScrollSpy() {
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateActiveSection(window.pageYOffset);
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        }

        updateActiveSection(scrollPos) {
            const sections = document.querySelectorAll('section[id], h3[id]');
            let currentSection = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop - (this.options.scrollOffset + 20);
                if (scrollPos >= sectionTop) {
                    currentSection = '#' + section.getAttribute('id');
                }
            });

            if (currentSection) {
                this.removeActiveStates();
                const activeLink = document.querySelector(
                    `${this.options.sidebarSelector} ${this.options.linkSelector}[href="${currentSection}"]`
                );
                if (activeLink) {
                    activeLink.classList.add(this.options.activeClass);
                }
            }
        }

        removeActiveStates() {
            document.querySelectorAll(
                `${this.options.sidebarSelector} .${this.options.activeClass}`
            ).forEach(el => {
                el.classList.remove(this.options.activeClass);
            });
        }
    }

    // 페이지 초기화
    GuideComponents.initializePage();
});