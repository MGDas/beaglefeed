/* ============================================================
   БигльКорм — скрипт подстраниц («О породе», «Помоги другу»).
   Лёгкая версия main.js: бургер-меню, тень шапки, reveal,
   диалог правовых документов. Без внешних зависимостей.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. Мобильное меню
     ---------------------------------------------------------- */
  var header = $('.site-header');
  var burger = $('#burger');
  var nav    = $('#nav');

  function setNav(open) {
    header.classList.toggle('nav-open', open);
    document.body.classList.toggle('nav-lock', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', function () {
    setNav(!header.classList.contains('nav-open'));
  });

  $$('a', nav).forEach(function (link) {
    link.addEventListener('click', function () { setNav(false); });
  });

  document.addEventListener('click', function (e) {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) setNav(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) setNav(false);
  });

  /* ----------------------------------------------------------
     2. Тень шапки при скролле
     ---------------------------------------------------------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     3. Появление блоков
     ---------------------------------------------------------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('[data-reveal]').forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     4. Диалог правовых документов
     ---------------------------------------------------------- */
  var LEGAL = {
    privacy: {
      title: 'Политика конфиденциальности',
      body:
        '<p>Настоящая политика описывает, как бренд «БигльКорм» обращается с персональными данными посетителей сайта.</p>' +
        '<h3>1. Какие данные мы собираем</h3>' +
        '<p>Имя, телефон, e-mail и сведения о питомце, которые вы добровольно указываете в формах подбора, заказа и обратной связи.</p>' +
        '<h3>2. Зачем они нужны</h3>' +
        '<p>Только для трёх задач: подобрать рацион, оформить и доставить заказ, ответить на ваше обращение. Мы не передаём данные рекламным партнёрам и не продаём базы.</p>' +
        '<h3>3. Хранение и защита</h3>' +
        '<p>Данные хранятся на территории РФ в защищённой CRM и удаляются по вашему запросу в течение 30 дней. Доступ имеют только сотрудники, работающие с вашей заявкой.</p>' +
        '<h3>4. Ваши права</h3>' +
        '<p>Вы можете запросить копию данных, исправить их или отозвать согласие — напишите на hello@biglkorm.ru. Отказ от обработки не позволяет нам принять заявку, но не ограничивает доступ к информации на сайте.</p>' +
        '<h3>5. О демо-версии</h3>' +
        '<p>Этот сайт является демонстрационным. Данные из форм не отправляются на сервер и не сохраняются после закрытия страницы.</p>'
    },
    terms: {
      title: 'Пользовательское соглашение',
      body:
        '<p>Используя сайт «БигльКорм», вы принимаете условия этого соглашения.</p>' +
        '<h3>1. Информация о продукте</h3>' +
        '<p>Материалы сайта носят информационный характер. Подбор рациона по возрасту, весу и активности является рекомендацией и не заменяет очную консультацию ветеринарного врача.</p>' +
        '<h3>2. Перевод на новый корм</h3>' +
        '<p>Рекомендуем переводить собаку на новый рацион постепенно, в течение 7–10 дней. При хронических заболеваниях, аллергии или беременности схема кормления согласовывается с лечащим врачом.</p>' +
        '<h3>3. Оформление заказа</h3>' +
        '<p>Заявка не является публичной офертой. Стоимость, наличие и сроки доставки подтверждает консультант после звонка. Цена фиксируется на момент подтверждения заказа.</p>' +
        '<h3>4. Возврат</h3>' +
        '<p>Если корм не подошёл, мы вернём деньги за незакрытую упаковку в течение 30 дней с момента получения. Для этого достаточно сохранить чек и связаться с нами.</p>' +
        '<h3>5. Интеллектуальная собственность</h3>' +
        '<p>Тексты, иллюстрации и фирменный стиль принадлежат бренду «БигльКорм». Использование материалов без письменного разрешения не допускается.</p>' +
        '<h3>6. Контакты</h3>' +
        '<p>По всем вопросам: hello@biglkorm.ru, +7 (495) 120-45-67.</p>'
    }
  };

  function openDialog(dialog) {
    setNav(false);
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    var closeBtn = dialog.querySelector('[data-close], .dialog-close');
    if (closeBtn && !dialog.contains(document.activeElement)) closeBtn.focus();
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  $$('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dialog = btn.closest('dialog');
      if (dialog) closeDialog(dialog);
    });
  });

  $$('dialog').forEach(function (dialog) {
    dialog.addEventListener('click', function (e) {
      if (e.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      var outside = e.clientX < rect.left || e.clientX > rect.right ||
                    e.clientY < rect.top  || e.clientY > rect.bottom;
      if (outside) closeDialog(dialog);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    $$('dialog[open]').forEach(function (dialog) {
      if (typeof dialog.close !== 'function') dialog.removeAttribute('open');
    });
  });

  $$('[data-legal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var doc = LEGAL[btn.dataset.legal];
      if (!doc) return;
      $('#legalTitle').textContent = doc.title;
      $('#legalBody').innerHTML = doc.body;
      openDialog($('#legalDialog'));
    });
  });

})();