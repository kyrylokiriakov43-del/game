// «Семь минут». В обычную выдачу входит только разговор с Рутгером.
const sevenMinutesCards = [
  eventCard('late-bell', 'guard',
    'Казна кормит нас после звона. Мы поели на семь минут раньше. С нас возьмёшь?',
    choice('Сегодня за мой счёт.', {gold:-1, reputation:1}, null, {returnVisit:'bell-bowls'}),
    choice('Платите. Я выпишу счёт.', {gold:1, reputation:-1}, null, {returnVisit:'bell-receipt'}),
    {illustration:'faces/late-bell.webp', illustrationAlt:'Рутгер предъявляет пустую миску и счёт.',
      story:'seven-minutes', once:true, seals:['cup','quill']}),

  eventCard('bell-bowls', 'baker',
    'Восемь мисок под окном, а в карауле трое. У меня полкотла. Всем понемногу?',
    choice('Наливай всем. Хлеба нарежу.', {gold:-1, reputation:1},
      'Семь мисок разобрали. Восьмая поползла вверх. Башенный звонарь тянул за верёвку. Хлеб ему привязали отдельно.'),
    choice('Сначала тем, кто дежурит.', {safety:1},
      'Караульные поели и ушли на обход. Звонарь втянул свою пустую миску обратно. В башне звякнуло на один удар больше.'),
    {illustration:'faces/bell-bowls.webp', illustrationAlt:'Агата с половником смотрит на подставленные миски.',
      story:'seven-minutes', room:'bakery', arrivalSound:'bowl_tap', seals:['loaf','shield']}),

  eventCard('bell-receipt', 'courier',
    'Казначей вернёт деньги. Просит часы, по которым суп наливали. Снимать или сам к нему сходишь?',
    choice('Снимай. Я подержу табурет.', {},
      'Феня унесла часы в наволочке. Из коридора ещё слышно было, как они тикают.', {flag:'clock-at-treasury', passageSound:'clock_hook'}),
    choice('Я схожу. Часы нужны Агате.', {reputation:1},
      'Вы расписались за семь минут. Казначей выдал караульным деньги и спросил, будете ли вы расписываться за остальные пятьдесят три.'),
    {illustration:'faces/bell-receipt.webp', illustrationAlt:'Феня держит наволочку под кухонными часами.',
      story:'seven-minutes', room:'bakery', seals:['hourglass','boots']})
];
