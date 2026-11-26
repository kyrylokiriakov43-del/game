// Load after old-gods.js and before chapter.js once the five WebP assets are present.
Object.assign(guests, {
  "mara": [
    "Мара",
    "Ночная нечисть"
  ],
  "nokk": [
    "Нёкк",
    "Водяной дух"
  ],
  "huldra": [
    "Хульдра",
    "Хозяйка лесной тропы"
  ],
  "haugbui": [
    "Эймунд",
    "Жилец кургана"
  ],
  "darkelf": [
    "Вельран",
    "Тёмный альв"
  ]
});

const folkloreCards = [
  eventCard("old-gods-mara", "mara",
    "Вдова послала меня к человеку, который спит у тебя наверху. Вот его подушка. Дашь мне подняться к нему или разбудишь его?",
    choice("Поднимайся. Не стану вмешиваться.", {"curse":1,"reputation":-1}, "Постоялец проснулся с криком. Наутро он покинул город, так и не дав показаний.", {}),
    choice("Разбудим его. Пусть объяснится.", {"safety":-1,"reputation":1}, "Мара положила подушку на стол. Вы позвали постояльца.", {"flag":"old-gods-mara-awake","visitNow":"old-gods-mara-witness"}),
    {"story":"old-gods","illustration":"fantasy/mara.webp","illustrationAlt":"Мара с тёмной косой держит подушку.","once":true,"seals":["key","shield"]}),

  eventCard("old-gods-mara-witness", "mara",
    "Он видел убийство, но не держал нож. Теперь я знаю настоящее имя. Сказать его вдове или сначала позвать стражу?",
    choice("Пусть вдова узнает правду.", {"curse":1,"reputation":1}, "Мара ушла к вдове. Та потребовала суда, а не новой мести.", {"flag":"old-gods-mara-truth"}),
    choice("Передай имя Рутгеру.", {"safety":1,"curse":-1}, "Рутгер выслушал свидетеля. Мара вернула подушку и исчезла.", {"flag":"old-gods-mara-guard"}),
    {"story":"old-gods","illustration":"fantasy/mara.webp","illustrationAlt":"Мара с тёмной косой держит подушку.","once":true,"seals":["quill","shield"],"requires":"old-gods-mara-awake"}),

  eventCard("old-gods-nokk", "nokk",
    "Под северным мостом ребёнок держится за корень. Я могу вывести его музыкой, но другие пойдут за звуком. Доверишься мне или отправишь людей с верёвкой?",
    choice("Играй. Стража закроет берег.", {"gold":-1,"safety":1}, "Нёкк сыграл у моста. Ребёнок вышел к берегу; стража не подпустила никого к воде.", {"flag":"old-gods-nokk-song","visitNow":"old-gods-nokk-echo"}),
    choice("Пусть люди спасут его сами.", {"gold":-1,"reputation":1}, "Рутгер с лодочниками добрался до ребёнка. К рассвету тот был дома.", {}),
    {"story":"old-gods","illustration":"fantasy/nokk.webp","illustrationAlt":"Нёкк держит мокрую лютню с водорослями.","once":true,"seals":["cup","shield"]}),

  eventCard("old-gods-nokk-echo", "nokk",
    "Мальчик всё ещё слышит мою мелодию. Он просится обратно к реке. Оборвать струны или мне унести лютню далеко отсюда?",
    choice("Оборви струны.", {"curse":-1,"reputation":1}, "Нёкк оборвал струны. Мальчик перестал слышать зов.", {"flag":"old-gods-nokk-silence"}),
    choice("Унеси лютню за пределы города.", {"safety":-1,"curse":1}, "Нёкк ушёл вниз по течению. Рутгер оставался с мальчиком, пока мелодия не стихла.", {"flag":"old-gods-nokk-depart"}),
    {"story":"old-gods","illustration":"fantasy/nokk.webp","illustrationAlt":"Нёкк держит мокрую лютню с водорослями.","once":true,"seals":["branch","key"],"requires":"old-gods-nokk-song"}),

  eventCard("old-gods-huldra", "huldra",
    "Охотник забрал ребёнка из нашей рощи. Его спутники теперь не могут найти дорогу домой. Эта ветка выведет их. Поможешь вернуть ребёнка?",
    choice("Обменяем ребёнка на свободу охотников.", {"reputation":1,"safety":-1}, "Охотник вернул ребёнка, а Хульдра вывела его спутников к опушке.", {"flag":"old-gods-huldra-exchange","visitNow":"old-gods-huldra-return"}),
    choice("Отпусти людей. Остальное решит стража.", {"safety":1,"reputation":-1}, "Хульдра вывела охотников к стене. Рутгер принялся разыскивать похитителя.", {}),
    {"story":"old-gods","illustration":"fantasy/huldra.webp","illustrationAlt":"Хульдра с лисьим хвостом держит ветвь с красными ягодами.","once":true,"seals":["branch","shield"]}),

  eventCard("old-gods-huldra-return", "huldra",
    "Ребёнок дома. Но один из охотников просит оставить ему ветку, чтобы снова увидеть нашу рощу. Доверить ему последний проход?",
    choice("Забери ветку. Пусть не возвращается.", {"curse":-1,"safety":1}, "Хульдра унесла ветку. Лесная тропа закрылась.", {"flag":"old-gods-huldra-closed"}),
    choice("Пусть сам попросит у тебя разрешения.", {"reputation":1,"curse":1}, "Охотник пришёл без оружия. Хульдра согласилась провести его один раз и вернуть к стене.", {"flag":"old-gods-huldra-trust"}),
    {"story":"old-gods","illustration":"fantasy/huldra.webp","illustrationAlt":"Хульдра с лисьим хвостом держит ветвь с красными ягодами.","once":true,"seals":["key","branch"],"requires":"old-gods-huldra-exchange"}),

  eventCard("old-gods-haugbui", "haugbui",
    "Пока моя чаша над землёй, раненый у кургана не может умереть. Он хочет увидеть сына. Оставить её здесь до рассвета или вернуть под землю?",
    choice("Дай ему попрощаться.", {"curse":1,"reputation":1}, "Эймунд остался у порога с чашей. Стража привела сына к раненому.", {"flag":"old-gods-haugbui-wait","visitNow":"old-gods-haugbui-farewell"}),
    choice("Верни чашу. Пусть он найдёт покой.", {"curse":-1,"reputation":-1}, "Эймунд унёс чашу в курган. Раненый умер, и его тело передали семье.", {}),
    {"story":"old-gods","illustration":"fantasy/haugbui.webp","illustrationAlt":"Седой мертвец Эймунд с золотой погребальной чашей.","once":true,"seals":["cup","branch"]}),

  eventCard("old-gods-haugbui-farewell", "haugbui",
    "Отец простился с сыном. Теперь сын просит ещё одну ночь, хотя отец уже хочет покоя. Мне пора возвращаться. Что скажешь?",
    choice("Уважим волю отца.", {"curse":-1,"reputation":1}, "Эймунд вернулся в курган. Сын остался рядом с отцом до конца.", {"flag":"old-gods-haugbui-release"}),
    choice("Дай сыну ещё немного времени.", {"curse":1,"safety":-1}, "Эймунд остался до утра. Чаша удерживала раненого, пока сын не отпустил его руку.", {"flag":"old-gods-haugbui-delay"}),
    {"story":"old-gods","illustration":"fantasy/haugbui.webp","illustrationAlt":"Седой мертвец Эймунд с золотой погребальной чашей.","once":true,"seals":["branch","cup"],"requires":"old-gods-haugbui-wait"}),

  eventCard("old-gods-dark-elf", "darkelf",
    "Я вернул немому голос на семь дней. Срок истекает сегодня, а он видел, кто грабил курганы. Заплатишь за ещё один день его речи?",
    choice("Заплачу. Пусть даст показания.", {"gold":-1,"reputation":1}, "Вельран принял монету. Свидетель назвал место, где спрятали другие погребальные дары.", {"flag":"old-gods-dark-elf-paid","visitNow":"old-gods-dark-elf-witness"}),
    choice("Договор окончен. Я не плачу.", {"reputation":-1,"safety":1}, "Вельран свернул договор. Свидетель потерял голос; Рутгер принёс ему бумагу для письменного показания.", {}),
    {"story":"old-gods","illustration":"fantasy/dark-elf.webp","illustrationAlt":"Вельран держит монету и запечатанный договор.","once":true,"seals":["coins","quill"]}),

  eventCard("old-gods-dark-elf-witness", "darkelf",
    "Свидетель указал тайник с погребальными дарами. Я знаю ход под ним. Вернуть вещи владельцам через меня или сообщить о тайнике страже?",
    choice("Верни дары мёртвым.", {"curse":-1,"gold":-1}, "Вельран взял плату и вернул дары в курганы. Ни один предмет не остался у него.", {"flag":"old-gods-dark-elf-return"}),
    choice("Рутгер займётся тайником.", {"safety":1,"reputation":1}, "Рутгер опознал вещи. Город отправил их обратно к курганам.", {"flag":"old-gods-dark-elf-watch"}),
    {"story":"old-gods","illustration":"fantasy/dark-elf.webp","illustrationAlt":"Вельран держит монету и запечатанный договор.","once":true,"seals":["coins","shield"],"requires":"old-gods-dark-elf-paid"})
];
oldGodsWalkIns.push(...folkloreCards);
