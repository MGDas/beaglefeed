/* ============================================================
   БигльКорм — скрипты сайта (без библиотек и внешних зависимостей)
   Файл выделен из index_qwen.html при рефакторинге.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = reduceMotion ? 'auto' : 'smooth';

  var money = function (n) {
    return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  };

  /* ----------------------------------------------------------
     1. Мобильное меню
     ---------------------------------------------------------- */
  var header = $('.site-header');
  var burger = $('#burger');
  var nav    = $('#nav');

  function setNav(open) {
    header.classList.toggle('nav-open', open);
    // Не даём странице скроллиться под открытым меню (CSS: body.nav-lock)
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
     3. Появление блоков + подсветка активного раздела
     ---------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    if (!reduceMotion) {
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

    var navLinks = $$('a[href^="#"]', nav);
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    $$('main section[id]').forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ----------------------------------------------------------
     4. Каталог: данные товаров
     ---------------------------------------------------------- */
  var PRODUCTS = {
    puppy:  { name: 'БигльКорм Puppy',           price: 1890, size: '2 кг',  age: '2–12 месяцев',       color: '#8BA888' },
    adult:  { name: 'БигльКорм Adult',           price: 2290, size: '3 кг',  age: '1–6 лет',            color: '#C67B4B' },
    active: { name: 'БигльКорм Adult Active',    price: 2590, size: '3 кг',  age: '1–6 лет · активные', color: '#A65D32' },
    light:  { name: 'БигльКорм Senior & Light',  price: 2490, size: '3 кг',  age: '7+ лет / контроль веса', color: '#A3B18A' },
    joints: { name: 'БигльКорм Mobility',        price: 1290, size: '300 г', age: 'Добавка для суставов', color: '#7E9B86' },
    treats: { name: 'БигльКорм Treats',          price: 690,  size: '150 г', age: 'Лакомство с 3 месяцев', color: '#D4A574' }
  };

  /* ----------------------------------------------------------
     5. Каталог: фильтр по возрасту
     ---------------------------------------------------------- */
  var filterButtons = $$('.filter-btn');
  var products = $$('.product');

  function plural(n) {
    if (n === 1) return n + ' позиция';
    if (n > 1 && n < 5) return n + ' позиции';
    return n + ' позиций';
  }

  function applyFilter(filter) {
    var count = 0;

    products.forEach(function (card) {
      var show = filter === 'all' || card.dataset.age === filter;
      card.hidden = !show;
      if (show) {
        count++;
        if (!reduceMotion) {
          card.classList.remove('pop');
          void card.offsetWidth;
          card.classList.add('pop');
        }
      }
    });

    $('#catalogCount').textContent = plural(count);
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      applyFilter(btn.dataset.filter);
    });
  });

  // Синхронизируем счётчик с фактическим состоянием при загрузке
  applyFilter('all');

  /* ----------------------------------------------------------
     6. Диалоги: универсальное открытие / закрытие
     ---------------------------------------------------------- */
  function openDialog(dialog) {
    setNav(false);
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    // Управление фокусом: после открытия фокусируем кнопку закрытия,
    // если фокус ещё не внутри диалога (нативные браузеры уже это делают).
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
    // Закрытие по клику на затемнение (не по контенту)
    dialog.addEventListener('click', function (e) {
      if (e.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      var outside = e.clientX < rect.left || e.clientX > rect.right ||
                    e.clientY < rect.top  || e.clientY > rect.bottom;
      if (outside) closeDialog(dialog);
    });
  });

  // Закрытие по Escape для браузеров без нативной поддержки <dialog>.
  // В нативных браузерах Escape обрабатывается самим диалогом.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    $$('dialog[open]').forEach(function (dialog) {
      if (typeof dialog.close !== 'function') dialog.removeAttribute('open');
    });
  });

  /* ----------------------------------------------------------
     7. Заказ товара
     ---------------------------------------------------------- */
  var orderDialog = $('#orderDialog');
  var orderState = { id: 'adult' };

  function updateTotal() {
    var input = $('#orderQty');
    var qty = parseInt(input.value, 10);
    if (!qty || qty < 1) qty = 1;
    if (qty > 20) qty = 20;
    input.value = qty;
    $('#orderTotal').textContent = money(PRODUCTS[orderState.id].price * qty);
  }

  function openOrder(id) {
    var product = PRODUCTS[id];
    if (!product) return;

    orderState.id = id;
    $('#orderName').textContent = product.name;
    $('#orderMeta').textContent = product.age + ' · ' + product.size;
    $('#orderPrice').textContent = money(product.price);
    $('#orderBag').style.color = product.color;
    $('#orderForm').reset();
    $('#orderQty').value = 1;
    updateTotal();

    $('#orderFormWrap').hidden = false;
    $('#orderSuccess').hidden = true;
    openDialog(orderDialog);
  }

  $$('[data-order]').forEach(function (btn) {
    btn.addEventListener('click', function () { openOrder(btn.dataset.order); });
  });

  $('#qtyMinus').addEventListener('click', function () {
    $('#orderQty').value = Math.max(1, (parseInt($('#orderQty').value, 10) || 1) - 1);
    updateTotal();
  });

  $('#qtyPlus').addEventListener('click', function () {
    $('#orderQty').value = Math.min(20, (parseInt($('#orderQty').value, 10) || 1) + 1);
    updateTotal();
  });

  // Санитизация ввода: только цифры, затем нормализация диапазона
  $('#orderQty').addEventListener('input', function () {
    this.value = (this.value || '').replace(/[^\d]/g, '');
    updateTotal();
  });

  $('#orderForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var product = PRODUCTS[orderState.id];
    var qty = parseInt($('#orderQty').value, 10) || 1;
    var name = $('#orderPerson').value.trim();

    $('#orderSuccessText').textContent =
      name + ', вы выбрали «' + product.name + '» в количестве ' + qty + ' — ' +
      money(product.price * qty) + '. Это демо-версия: заявка осталась в браузере. ' +
      'На боевом сайте менеджер позвонил бы вам для подтверждения доставки.';

    $('#orderFormWrap').hidden = true;
    $('#orderSuccess').hidden = false;
  });

  /* ----------------------------------------------------------
     8. Подбор рациона: логика рекомендации
     ---------------------------------------------------------- */
  var quizDialog = $('#quizDialog');
  var quizForm = $('#quizForm');
  var quizResult = $('#quizResult');
  var recommendationId = 'adult';

  $$('[data-quiz]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      quizForm.hidden = false;
      quizResult.hidden = true;
      openDialog(quizDialog);
    });
  });

  quizForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = new FormData(quizForm);
    var dogName = String(data.get('dogName') || '').trim();
    var age = String(data.get('age') || 'adult');
    var weight = parseFloat(data.get('weight')) || 12;
    var activity = String(data.get('activity') || 'moderate');
    var goal = String(data.get('goal') || 'none');

    var id;
    var reasons = [];

    if (age === 'puppy') {
      id = 'puppy';
      reasons.push('Растущему скелету нужны кальций, фосфор и DHA в правильной пропорции — они уже рассчитаны в формуле Puppy.');
      if (goal === 'allergy') reasons.push('Ягнёнок в составе — один источник животного белка, это снижает риск пищевой реакции.');
    } else if (age === 'senior') {
      id = 'light';
      reasons.push('После 7 лет обмен замедляется. Формула снижает калорийность на 18% и поддерживает суставы глюкозамином.');
    } else {
      if (goal === 'allergy' || activity === 'active') {
        id = 'active';
        reasons.push('Активному биглю нужно больше белка и жиров. Ягнёнок и гречка дают энергию и подходят чувствительным собакам.');
      } else if (goal === 'weight' || activity === 'calm') {
        id = 'light';
        reasons.push('При склонности к полноте или низком движении важна пониженная калорийность. При этом объём порции остаётся большим — бигль чувствует себя сытым.');
      } else {
        id = 'adult';
        reasons.push('Сбалансированная формула на индейке и рисе поддерживает вес, шерсть и пищеварение без перегруза.');
      }
    }

    if (goal === 'digest') {
      reasons.push('Пробиотики MOS/FOS и тыква в составе поддерживают микрофлору и стабильное пищеварение.');
    }
    if (goal === 'joints') {
      reasons.push('Дополнительно рекомендуем добавку Mobility: глюкозамин и МГК для суставов активного бигля.');
    }
    if (goal === 'weight' && id !== 'light') {
      reasons.push('Держите лакомства в пределах 10% суточной калорийности и взвешивайте порцию на кухонных весах.');
    }

    // Ориентировочная суточная норма, г на кг веса
    var factor;
    if (age === 'puppy')        factor = weight < 10 ? 28 : 25;
    else if (age === 'senior')  factor = 17;
    else if (id === 'active')   factor = 24;
    else if (id === 'light')    factor = 16;
    else                        factor = 20;

    var grams = Math.round(weight * factor / 10) * 10;
    var meals = age === 'puppy' ? 3 : 2;
    var perMeal = Math.round(grams / meals);

    recommendationId = id;

    $('#resultTitle').textContent = PRODUCTS[id].name;
    $('#resultTag').textContent = 'Для ' + (dogName || 'вашего бигля') + ' · ' + weight + ' кг';
    $('#resultReason').textContent = reasons.join(' ');
    $('#resultPortion').textContent = grams + ' г';
    $('#resultMeals').textContent = meals;
    $('#resultPerMeal').textContent = perMeal + ' г';
    $('#resultOrder').textContent = 'Заказать · ' + money(PRODUCTS[id].price);

    quizForm.hidden = true;
    quizResult.hidden = false;
    quizDialog.scrollTop = 0;
  });

  $('#quizReset').addEventListener('click', function () {
    quizResult.hidden = true;
    quizForm.hidden = false;
    quizDialog.scrollTop = 0;
    $('#dogName').focus();
  });

  $('#resultOrder').addEventListener('click', function () {
    closeDialog(quizDialog);
    openOrder(recommendationId);
  });

  $('#resultConsult').addEventListener('click', function () {
    var name = $('#dogName').value.trim();
    var weight = $('#dogWeight').value;
    var activityEl = quizForm.querySelector('input[name="activity"]:checked');
    var activityText = activityEl ? activityEl.parentElement.querySelector('span').childNodes[0].textContent.trim() : 'умеренная';

    closeDialog(quizDialog);

    $('#contactMessage').value =
      'Здравствуйте! Подберите, пожалуйста, рацион для бигля ' + (name || '') +
      ': вес ' + weight + ' кг, активность — ' + activityText.toLowerCase() +
      '. По подбору на сайте рекомендован «' + PRODUCTS[recommendationId].name + '». Подскажите точную порцию и как перевести на новый корм.';

    document.getElementById('contacts').scrollIntoView({ behavior: motion, block: 'start' });
    setTimeout(function () { $('#contactName').focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
  });

  /* ----------------------------------------------------------
     9. Карусель отзывов (scroll-snap + стрелки + точки)
     ---------------------------------------------------------- */
  var track = $('#reviewsTrack');
  var prevBtn = $('#reviewPrev');
  var nextBtn = $('#reviewNext');
  var dotsWrap = $('#reviewDots');
  var pages = 1;
  var currentPage = 0;

  function stepWidth() {
    var card = track.querySelector('.review');
    if (!card) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    return card.getBoundingClientRect().width + gap;
  }

  function buildDots() {
    var maxScroll = track.scrollWidth - track.clientWidth;
    pages = Math.max(1, Math.round(maxScroll / stepWidth()) + 1);
    dotsWrap.innerHTML = '';

    for (var i = 0; i < pages; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === currentPage ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Отзывы, страница ' + (i + 1));
      dot.setAttribute('aria-pressed', String(i === currentPage));
      dot.addEventListener('click', function (index) {
        return function () {
          track.scrollTo({ left: index * stepWidth(), behavior: motion });
        };
      }(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateCarousel() {
    var maxScroll = track.scrollWidth - track.clientWidth;
    currentPage = Math.max(0, Math.min(pages - 1, Math.round(track.scrollLeft / stepWidth())));

    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= maxScroll - 4;

    $$('.carousel-dot', dotsWrap).forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentPage);
      dot.setAttribute('aria-pressed', String(i === currentPage));
    });
  }

  prevBtn.addEventListener('click', function () {
    track.scrollBy({ left: -stepWidth(), behavior: motion });
  });

  nextBtn.addEventListener('click', function () {
    track.scrollBy({ left: stepWidth(), behavior: motion });
  });

  var scrollTimer;
  track.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateCarousel, 90);
  }, { passive: true });

  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: stepWidth(), behavior: motion }); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); track.scrollBy({ left: -stepWidth(), behavior: motion }); }
  });

  window.addEventListener('resize', function () {
    buildDots();
    updateCarousel();
  });

  buildDots();
  updateCarousel();

  /* ----------------------------------------------------------
     10. Форма обратной связи
     ---------------------------------------------------------- */
  var contactForm = $('#contactForm');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#contactName').value.trim();
    $('#contactSuccessName').textContent = name || 'друг';
    contactForm.hidden = true;
    $('#contactSuccess').hidden = false;
  });

  $('#contactAgain').addEventListener('click', function () {
    contactForm.reset();
    contactForm.hidden = false;
    $('#contactSuccess').hidden = true;
    $('#contactName').focus();
  });

  /* ----------------------------------------------------------
     11. Правовые документы в диалоге
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