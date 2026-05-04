

(function () {
    'use strict';

    // ===== DATA & CONFIG =====
    const PRICING = {
        card1: { color: { хром: 19990, черный: 23990 } },
        card2: { color: { хром: 23990, черный: 25990 } },
        card3: {
            одно_зеркало: {
                на_себя:  { хром: 31990, черный: 32990 },
                от_себя:  { хром: 33990, черный: 35990 }
            },
            два_зеркала: {
                на_себя:  { хром: 41990, черный: 42990 },
                от_себя:  { хром: 43990, черный: 45990 }
            }
        }
    };

    const DOM = {
        galleries: document.querySelectorAll('.gallery'),
        configBlocks: document.querySelectorAll('.card-config'),
        orderBtns: document.querySelectorAll('.btn-order'),
        modalOverlay: document.getElementById('modalOverlay'),
        modalClose: document.getElementById('modalClose'),
        modalProduct: document.getElementById('modalProduct'),
        orderForm: document.getElementById('orderForm'),
        nameInput: document.getElementById('name'),
        phoneInput: document.getElementById('phone'),
        submitBtn: document.getElementById('submitBtn'),
        formView: document.getElementById('formView'),
        successView: document.getElementById('successView'),
        burger: document.getElementById('burger'),
        mobileMenu: document.getElementById('mobileMenu'),
        closeMenu: document.getElementById('closeMenu'),
        reveals: document.querySelectorAll('.reveal')
    };

    // ===== UTILS =====
    function formatPrice(value) {        return value.toLocaleString('ru-RU') + ' ₽';
    }

    function debounce(fn, delay = 10) {
        let timer;
        return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
    }

    // ===== GALLERIES =====
    function initGalleries() {
        DOM.galleries.forEach(gallery => {
            const images = gallery.querySelectorAll('.gallery-main img');
            const dotsContainer = gallery.querySelector('.gallery-dots');
            const counter = gallery.querySelector('.gallery-counter');
            const prevBtn = gallery.querySelector('.prev');
            const nextBtn = gallery.querySelector('.next');
            let current = 0;

            // Создаём точки навигации
            images.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = `gallery-dot${i === 0 ? ' active' : ''}`;
                dot.setAttribute('aria-label', `Фото ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });

            const dots = dotsContainer.querySelectorAll('.gallery-dot');

            function goTo(index) {
                images[current].classList.remove('active');
                dots[current].classList.remove('active');
                current = (index + images.length) % images.length;
                images[current].classList.add('active');
                dots[current].classList.add('active');
                counter.textContent = `${current + 1} / ${images.length}`;
            }

            prevBtn.addEventListener('click', () => goTo(current - 1));
            nextBtn.addEventListener('click', () => goTo(current + 1));
        });
    }

    // ===== CONFIGURATOR & PRICING =====
    function getActiveValue(configBlock, option) {
        const btn = configBlock.querySelector(`.config-btn.active[data-option="${option}"]`);
        return btn ? btn.dataset.value : null;
    }
    function updateConfig(configBlock) {
        const card = configBlock.closest('.card');
        const cardId = configBlock.dataset.card;
        const priceEl = card.querySelector('.dynamic-price');
        const noteEl = card.querySelector('.price-note');
        const orderBtn = card.querySelector('.btn-order');
        const cardTitle = card.querySelector('h3').textContent;

        const color = getActiveValue(configBlock, 'color');
        const size = getActiveValue(configBlock, 'size');
        const opening = getActiveValue(configBlock, 'opening');
        const type = getActiveValue(configBlock, 'type');

        let priceText = '';
        let note = 'за комплект стандартных размеров';
        let configParts = [];

        if (color) configParts.push(`Цвет: ${color}`);
        if (opening) configParts.push(`Открывание: ${opening.replace('_', ' ')}`);
        if (type) configParts.push(`Тип: ${type.replace('_', ' ')}`);
        configParts.push(`Размер: ${size === 'нестандарт' ? 'Нестандарт' : 'Стандарт'}`);

        if (size === 'нестандарт') {
            priceText = 'Рассчитаем индивидуально';
            note = '';
        } else {
            let val = 0;
            if (cardId === '1') val = PRICING.card1.color[color] || 0;
            else if (cardId === '2') val = PRICING.card2.color[color] || 0;
            else if (cardId === '3') val = PRICING.card3[type]?.[opening]?.[color] || 0;
            
            priceText = formatPrice(val);
            configParts.push(`Итого: ${priceText}`);
        }

        // Анимация обновления цены
        priceEl.style.opacity = '0.6';
        priceEl.style.transform = 'translateY(-2px)';
        setTimeout(() => {
            priceEl.textContent = priceText;
            priceEl.style.opacity = '1';
            priceEl.style.transform = 'translateY(0)';
        }, 150);

        noteEl.textContent = note;
        orderBtn.dataset.config = `${cardTitle} | ${configParts.join(', ')}`;
    }

    function initConfigurator() {
        // Инициализация начальных цен        DOM.configBlocks.forEach(updateConfig);

        // Делегирование событий на кнопки конфигурации
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.config-btn');
            if (!btn) return;
            
            const group = btn.closest('.config-options');
            group.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const configBlock = btn.closest('.card-config');
            updateConfig(configBlock);
        });
    }

    // ===== MODAL =====
    function openModal(configText) {
        DOM.modalProduct.textContent = configText;
        DOM.formView.style.display = 'block';
        DOM.successView.classList.remove('show');
        DOM.modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // Фокус на первое поле с небольшой задержкой для плавности
        setTimeout(() => DOM.nameInput.focus(), 100);
    }

    function closeModal() {
        DOM.modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function initModal() {
        // Кнопки заказа
        DOM.orderBtns.forEach(btn => {
            btn.addEventListener('click', () => openModal(btn.dataset.config));
        });

        // Закрытие
        DOM.modalClose.addEventListener('click', closeModal);
        DOM.modalOverlay.addEventListener('click', (e) => e.target === DOM.modalOverlay && closeModal());
        document.addEventListener('keydown', (e) => e.key === 'Escape' && DOM.modalOverlay.classList.contains('open') && closeModal());
        
        // Экспортируем для совместимости с инлайн-обработчиками (если они останутся)
        window.openModal = openModal;
    }

    // ===== FORM =====
    function initForm() {        // Маска телефона
        DOM.phoneInput.addEventListener('input', debounce((e) => {
            let digits = e.target.value.replace(/\D/g, '');
            if (!digits.length) { e.target.value = ''; return; }
            
            if (['7', '8'].includes(digits[0])) digits = digits.substring(1);
            
            let formatted = '+7';
            if (digits.length) formatted += ' (' + digits.substring(0, 3);
            if (digits.length >= 3) formatted += ') ' + digits.substring(3, 6);
            if (digits.length >= 6) formatted += '-' + digits.substring(6, 8);
            if (digits.length >= 8) formatted += '-' + digits.substring(8, 10);
            
            e.target.value = formatted;
        }));

        // Валидация
        function validate() {
            const name = DOM.nameInput.value.trim();
            const phone = DOM.phoneInput.value.replace(/\D/g, '');
            let valid = true;

            if (name.length < 2) {
                DOM.nameInput.classList.add('error');
                valid = false;
            } else {
                DOM.nameInput.classList.remove('error');
            }

            if (phone.length < 11) {
                DOM.phoneInput.classList.add('error');
                valid = false;
            } else {
                DOM.phoneInput.classList.remove('error');
            }

            return valid;
        }

        // Отправка формы
        DOM.orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validate()) return;

            DOM.submitBtn.disabled = true;
            DOM.submitBtn.textContent = 'Отправляем...';

            // Имитация запроса к серверу
            setTimeout(() => {
                DOM.formView.style.display = 'none';                DOM.successView.classList.add('show');
                DOM.submitBtn.disabled = false;
                DOM.submitBtn.textContent = 'Отправить заявку';
                DOM.orderForm.reset();
                
                // Сброс ошибок
                DOM.nameInput.classList.remove('error');
                DOM.phoneInput.classList.remove('error');
            }, 800);
        });

        // Убираем подсветку ошибки при вводе
        DOM.nameInput.addEventListener('input', () => DOM.nameInput.classList.remove('error'));
        DOM.phoneInput.addEventListener('input', () => DOM.phoneInput.classList.remove('error'));
    }

    // ===== MOBILE MENU =====
    function initMobileMenu() {
        const toggle = (open) => {
            DOM.mobileMenu.classList.toggle('open', open);
            document.body.style.overflow = open ? 'hidden' : '';
        };

        DOM.burger.addEventListener('click', () => toggle(true));
        DOM.closeMenu.addEventListener('click', () => toggle(false));
        
        DOM.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggle(false));
        });
    }

    // ===== SCROLL ANIMATIONS =====
    function initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        DOM.reveals.forEach(el => observer.observe(el));
    }

    // ===== SMOOTH SCROLL FOR NAV =====
    function initNav() {
        document.querySelectorAll('.nav a, .mobile-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', () => {
        initGalleries();
        initConfigurator();
        initModal();
        initForm();
        initMobileMenu();
        initAnimations();
        initNav();
    });

})();