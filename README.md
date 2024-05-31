<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

</div>

<br />
<div align="center">
<h3 align="center">Эпичные схватки боевых магов: Крутагидон</h3>

  <p align="center">
    <a href="https://hobbygames.ru/jepichnie-shvatki-boevih-magov-krutagidon">Настольная игра</a>, перенесенная в онлайн формат
    <br />
    <a href="https://troexol.ru"><strong>Попробуй с друзьями »</strong></a>
    <br />
    <br />
    <a href="https://hobbygames.ru/download/rules/ESW_DeckBuilding_rulebook.pdf">Правила игры</a>
    ·
    <a href="https://github.com/TroExol/coolgedon/issues/new?labels=bug&template=bug-report---.md">Сообщить ошибку</a>
    ·
    <a href="https://github.com/TroExol/coolgedon/issues/new?labels=enhancement&template=feature-request---.md">Предложить идею</a>
  </p>
</div>

## Как играть

1. Введите с друзьями одинаковый номер комнаты, введите свой никнейм
2. Кто первый войдет в комнату, тот становится первым активным игроком и считается админом (может исключать игроков и удалять комнату)
3. Дождитесь остальных игроков (если в комнате только 1 игрок, то ничего разыгрывать нельзя)
4. Активный игрок может разыгрывать карты, находящиеся у него в руке (по центру экрана), нажав по карте и нажав "Разыграть", также активный игрок может разыграть все карты сразу, нажав "Разыграть"
5. Активный игрок покупает карты, если у него хватает мощи, нажав по нужной карте в списке "Покупка карт" (легенды, шальные магии, барахолка) или по своему фамильяру (под значком здоровья)
6. Если активный игрок больше ничего сделать не может, то нажимает "Закончить ход", тогда ход передается следующему игроку
7. Число справа от звездочки рядом с количеством здоровья означает победные очки. В конце игры, у кого больше победных очков, тот побеждает

- Победные очки может видеть только их владелец
- Сброс любого игрока может видеть любой игрок
- Колоду игрока никто не может видеть, даже владелец
- Руку неактивного игрока может видеть только владелец
- Руку активного игрока могут видеть все
- Жетоны дохлых колдунов видят все
- Свойства видят все
- Фамильяра для покупки видят все


## Contributing

### Установка

1. Склонируйте репозиторий
   ```sh
   git clone https://github.com/TroExol/coolgedon.git
   ```
2. Установите зависимости из корня, тогда также установятся зависимости для всех модулей
   ```sh
   cd coolgedon && yarn install
   ```

### Запуск

#### С отслеживанием изменений

Запустите проект
```sh
coolgedon> yarn start:dev
```
Клиент будет запущен по адесу http://localhost:3000, сервер - http://localhost:4001.

#### Без отслеживания изменений

Соберите клиент
```sh
coolgedon\client> yarn build
```
Сборка будет находиться в папке dist

Запустите сервер
```sh
coolgedon\server> yarn start
```

### Линтеры

Для запуска проверки кода всех модулей
```sh
coolgedon> yarn lint
```

В каждом модуле есть свой скрипт для запуска проверки кода
```sh
coolgedon\server> yarn lint
```

#### Git хуки

Перед пушом срабатывает git хук, который проверяет качество кода всех модулей

### Ограничения разработки

- Здоровье игрока МАКСИМУМ 25
- Здоровье игрока МИНИМУМ 0
- Кол-во шальных магий - 16
- Кол-во вялых пялочек - 16
- Если сущность (карта, свойство, жетон) находится у игрока, то обязательно у нее должен быть ownerNickname
- Если заканчивается основная колода - конец игры
- Если заканчиваются жетоны дохлых колдунов - конец игры
- Если заканчиваются легенды - конец игры
- Разыгрывать карты может ТОЛЬКО активный игрок (защиту может любой)
- Карты без действий тоже можно разыгрывать


## Roadmap

- [ ] Добавить обработчики оставшихся карт
- [ ] Кол-во легенд зависит от кол-ва игроков
- [ ] Рефакторинг Jest тестов
- [ ] Переести фамильяра для покупки в центр экрана рядом с шальной магией (для наглядности)





<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/TroExol/coolgedon.svg?style=for-the-badge
[contributors-url]: https://github.com/TroExol/coolgedon/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/TroExol/coolgedon.svg?style=for-the-badge
[forks-url]: https://github.com/TroExol/coolgedon/network/members
[stars-shield]: https://img.shields.io/github/stars/TroExol/coolgedon.svg?style=for-the-badge
[stars-url]: https://github.com/TroExol/coolgedon/stargazers
[issues-shield]: https://img.shields.io/github/issues/TroExol/coolgedon.svg?style=for-the-badge
[issues-url]: https://github.com/TroExol/coolgedon/issues
