import { cardMap } from 'AvailableCards';
import {
  ECardTypes,
  EEventTypes,
  type TPlayer,
  type TVariant,
} from '@coolgedon/shared';

import type {
  TDamageParams,
  TGuardParams,
  TSelectCardsParams,
  TSelectCardsResult,
  TSelectGuardCardParams,
  TSelectGuardCardResult,
  TSelectLeftUniqueCardTypesParams,
  TSelectSkullsParams,
  TSelectSkullsResult,
  TSelectTargetParams,
  TSelectVariantParams,
  TSelectVariantResult,
} from 'Type/entities/player';
import type { Room } from 'Entity/room';

import {
  getCardIn,
  getCardInFromClient,
  getCardsIn,
  getCardsInFromClient,
  getCountCardsIn,
  getSkullsInFromClient,
  shuffleArray,
  toPlayerVariant,
} from 'Helpers';

import type { Skull } from './skull';
import type { Prop } from './prop';

import { Card } from './card';

interface TPlayerConstructorParams {
  nickname: string;
  familiarToBuy: Card;
  prop: Prop;
  room: Room;
}

export class Player {
  private readonly room: Room;
  activePermanent: Card[] = [];
  deck: Card[];
  discard: Card[] = [];
  familiarToBuy: Card | null;
  hand: Card[] = [];
  hasTower = false;
  hp = 20;
  nickname: string;
  props: Prop[];
  skulls: Skull[] = [];

  constructor({
    nickname, familiarToBuy, prop, room,
  }: TPlayerConstructorParams) {
    let startCardId = 1;
    const cardFactory = (params: Omit<ConstructorParameters<typeof Card>[0], 'id' | 'room'>) => new Card({
      ...params,
      id: `${nickname}_${startCardId++}`,
      room,
    });
    const startDeck: Card[] = [
      ...Array.from({ length: 6 }, () => cardFactory(cardMap[ECardTypes.seeds][1])),
      ...Array.from({ length: 3 }, () => cardFactory(cardMap[ECardTypes.seeds][3])),
      cardFactory(cardMap[ECardTypes.seeds][2]),
    ];

    startDeck.forEach(card => {
      card.ownerNickname = nickname;
    });
    prop.ownerNickname = nickname;
    familiarToBuy.ownerNickname = nickname;

    this.room = room;
    this.nickname = nickname;
    this.familiarToBuy = familiarToBuy;
    this.props = [prop];
    this.deck = shuffleArray(startDeck);

    this.fillHand();
  }

  activatePermanents() {
    if (!this.theSame(this.room.activePlayer)) {
      return;
    }

    // Идем с конца
    for (let i = this.hand.length - 1; i >= 0; i -= 1) {
      const card = this.hand[i];
      if (!card.permanent) {
        continue;
      }
      this.room.onCurrentTurn.activatedPermanents.push(card);
      if (!this.room.onCurrentTurn.playedCards[card.type]) {
        this.room.onCurrentTurn.playedCards[card.type] = [];
      }
      this.room.onCurrentTurn.playedCards[card.type]?.push(card);
      card.activate();
    }
  }

  canGuard(byLawlessness?: boolean): boolean {
    return !!this.guardCards.length && (!byLawlessness || !this.getSkull(17));
  }

  /**
   * @return boolean true - умер, false - остался жив
   */
  damage({
    attacker, damage, giveSkull = true,
  }: TDamageParams): boolean {
    this.hp -= damage;

    if (this.hp > 0) {
      this.room.logEvent(!attacker
        ? `Игроку ${this.nickname} нанесли ${damage} урона`
        : `Игрок ${attacker.nickname} нанес ${damage} урона игроку ${this.nickname}`);
      this.room.sendInfo();
      return false;
    }

    this.hp = 20;

    if (giveSkull) {
      const skull = this.room.skulls.slice(-1)[0];
      this.takeSkull(skull, this.room.skulls);
      void skull.play({ attacker });
    }

    if (!attacker) {
      this.room.logEvent(`Игрок ${this.nickname} умер`);
      this.room.sendInfo();
      return true;
    }

    this.room.logEvent(`Игрок ${attacker.nickname} убил игрока ${this.nickname}`);

    const otherPlayers = this.room.getPlayersExceptPlayer(attacker);

    attacker.hasTower = true;
    otherPlayers.forEach(p => {
      p.hasTower = false;
    });

    const place6 = attacker.getCards('activePermanent', ECardTypes.places, 6);
    if (place6.length) {
      attacker.discardCards(place6, 'activePermanent');
    }
    this.room.sendInfo();
    return true;
  }

  discardCards(cards: Card[], from: 'hand' | 'activePermanent' | 'deck') {
    if (!cards.length) {
      return;
    }

    const discarded = this[from].reduceRight<Card[]>((acc, card, index) => {
      if (cards.some(c => card.theSame(c))) {
        acc.push(...this[from].splice(index, 1));
      }
      return acc;
    }, []);
    this.discard.push(...discarded);
    this.room.logEvent(`Игрок ${this.nickname} сбросил карт: ${discarded.length} шт.`);
    this.room.sendInfo();
  }

  fillHand() {
    if (this.hand.length >= 5) {
      return;
    }

    if (this.deck.length < 5) {
      this.shuffleDiscardToDeck();
    }
    this.hand.push(...this.deck.splice((5 - this.hand.length) * -1));

    if (this.room.activePlayer && this.theSame(this.room.activePlayer)) {
      this.activatePermanents();
    }
  }

  format(forPlayer: Player): TPlayer {
    return {
      activePermanent: this.activePermanent.map(card => card.format()),
      countDeck: this.deck.length,
      discard: this.discard.map(card => card.format()),
      familiarToBuy: this.familiarToBuy?.format(this),
      hand: this.theSame(forPlayer) || this.theSame(this.room.activePlayer)
        ? this.hand.map(card => card.format())
        : undefined,
      countHand: this.hand.length,
      hasTower: this.hasTower,
      hasTowerC: this.hasTowerC,
      hp: this.hp,
      nickname: this.nickname,
      totalPower: this.theSame(this.room.activePlayer)
        ? this.totalPower
        : undefined,
      props: this.props.map(prop => prop.format()),
      skulls: this.skulls.map(skull => skull.format()),
      victoryPoints: this.theSame(forPlayer) ? this.victoryPoints : undefined,
      isOnline: !!this.room.getSocketClient(this.nickname),
    };
  }

  getCard(where: 'hand' | 'discard' | 'deck' | 'activePermanent', type: ECardTypes, cardNumber?: number) {
    return getCardIn(this[where], type, cardNumber);
  }

  getCards(where: 'hand' | 'discard' | 'deck' | 'activePermanent', type: ECardTypes, cardNumber?: number) {
    return getCardsIn(this[where], type, cardNumber);
  }

  getCountCards(where: 'hand' | 'discard' | 'deck' | 'activePermanent', type: ECardTypes, cardNumber?: number): number {
    return getCountCardsIn(this[where], type, cardNumber);
  }

  getProp(id: number) {
    return this.props.find(prop => prop.id === id);
  }

  getSkull(id: number) {
    return this.skulls.find(skull => skull.id === id);
  }

  /**
   * @return boolean true - можно атаковать, false - нельзя (защитился)
   */
  async guard({
    attacker,
    cardAttack,
    cardsToShow,
    title,
    damage,
    byLawlessness,
  }: TGuardParams) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.canGuard(byLawlessness)) {
        return true;
      }
      const selectedCard = await this.selectGuardCard({
        cardAttack,
        cardsToShow,
        title,
      });

      if (!selectedCard) {
        return true;
      }
      if (![...this.hand, ...this.activePermanent].some(card => selectedCard.theSame(card))) {
        continue;
      }
      this.room.logEvent(`Игрок ${this.nickname} защитился${attacker ? ` от игрока ${attacker.nickname}` : ''}`);
      void selectedCard.playGuard({
        attacker,
        cardAttack,
        damage,
      });
      return false;
    }
  }

  heal(count: number) {
    const wasHp = this.hp;
    const place5 = this.getCountCards('activePermanent', ECardTypes.places, 5);
    const totalCount = place5
      ? count * (2 * place5)
      : count;

    this.hp = this.hp + totalCount <= 25
      ? this.hp + totalCount
      : 25;
    if (wasHp !== this.hp) {
      this.room.logEvent(`Игрок ${this.nickname} восполнил здоровье на ${this.hp - wasHp}`);
      this.room.sendInfo();
    }
  }

  async removeCards(cards: Card[], from: 'hand' | 'deck' | 'discard' | 'activePermanent') {
    let countRemovedCards = 0;
    if (!this.hasTowerC) {
      for (let i = this[from].length - 1; i >= 0; i--) {
        const card = this[from][i];
        if (!cards.some(c => card.theSame(c))) {
          continue;
        }
        const removedCard = this[from].splice(i, 1)[0];
        removedCard.ownerNickname = undefined;
        if (removedCard.theSameType(ECardTypes.sluggishStick)) {
          this.room.sluggishStick.push(removedCard);
        } else if (removedCard.theSameType(ECardTypes.crazyMagic)) {
          this.room.crazyMagic.push(removedCard);
        } else {
          this.room.removed.cards.push(removedCard);
        }
        countRemovedCards++;
      }
      this.room.logEvent(`Игрок ${this.nickname} удалил карт: ${countRemovedCards} шт.`);
      this.room.sendInfo();
      return;
    }

    const selected = await this.selectCards({
      cards,
      count: 0,
      variants: this.room.getPlayersExceptPlayer(this).map(toPlayerVariant),
      title: `Кому передашь уничтоженн${cards.length > 1 ? 'ые' : 'ую'} карт${cards.length > 1 ? 'ы' : 'у'}?`,
      canClose: false,
    });

    const playerToTransfer = this.room.getPlayer(selected.variant as string);
    playerToTransfer.takeCardsTo('discard', cards, this[from]);
  }

  removeSkulls(skulls: Skull[]) {
    let countRemovedSkulls = 0;
    for (let i = this.skulls.length - 1; i >= 0; i--) {
      const skull = this.skulls[i];
      if (!skulls.some(s => skull.theSame(s))) {
        continue;
      }
      this.room.skulls.push(this.skulls.splice(i, 1)[0]);
      countRemovedSkulls++;
    }
    if (!countRemovedSkulls) {
      return;
    }
    this.room.logEvent(`Игрок ${this.nickname} уничтожил жетонов дохлых колдунов из своей коллекции: ${countRemovedSkulls} шт.`);
    this.room.sendInfo();
  }

  async selectCards({
    cards,
    variants,
    title,
    count = 1,
    canClose = true,
  }: TSelectCardsParams): Promise<TSelectCardsResult> {
    if (!cards.length) {
      return { cards: [] };
    }
    const totalCount = count < cards.length
      ? count
      : 0;
    const data = await this.room.emitWithAck(this.nickname, EEventTypes.showModalSelectCards, {
      cards: cards.map(card => card.format()),
      count: totalCount,
      variants,
      title,
      canClose,
    });

    if (data.closed) {
      return { cards: [] };
    }

    const variant = data.variant;
    if (totalCount === 0) {
      return { cards, variant };
    }

    return {
      cards: getCardsInFromClient(data.selectedCards, cards),
      variant,
    };
  }

  async selectGuardCard({
    cardAttack,
    cardsToShow,
    title,
  }: TSelectGuardCardParams): Promise<TSelectGuardCardResult> {
    const guardCards = this.guardCards;
    if (!guardCards.length) {
      return;
    }
    const data = await this.room.emitWithAck(this.nickname, EEventTypes.showModalSuggestGuard, {
      cardAttack: cardAttack.format(),
      cardsToShow: cardsToShow?.map(card => card.format()),
      cards: guardCards.map(card => card.format()),
      title,
    });

    if (data.closed) {
      return;
    }

    return getCardInFromClient(data.selectedCard, guardCards);
  }

  async selectLeftUniqueCardTypes({
    cards,
    canClose,
  }: TSelectLeftUniqueCardTypesParams): Promise<Card[] | undefined> {
    const data = await this.room.emitWithAck(this.nickname, EEventTypes.showModalLeftUniqueCardTypes, {
      cards: cards.map(handCard => handCard.format()),
      canClose,
    });

    if (data.closed) {
      return undefined;
    }

    return getCardsInFromClient(data.selectedCards, cards);
  }

  async selectSkulls({
    skulls,
    variants,
    title,
    count = 1,
    canClose = true,
  }: TSelectSkullsParams): Promise<TSelectSkullsResult> {
    if (!skulls.length) {
      return { skulls: [] };
    }
    const totalCount = count < skulls.length
      ? count
      : 0;
    const data = await this.room.emitWithAck(this.nickname, EEventTypes.showModalSelectSkulls, {
      skulls: skulls.map(skull => skull.format()),
      count: totalCount,
      variants,
      title,
      canClose,
    });

    if (data.closed) {
      return { skulls: [] };
    }

    const variant = data.variant;
    if (totalCount === 0) {
      return { skulls, variant };
    }

    return {
      skulls: getSkullsInFromClient(data.selectedSkulls, skulls),
      variant,
    };
  }

  async selectTarget({
    targetsToSelect,
    target,
    title,
    canClose,
  }: TSelectTargetParams = {}): Promise<Player | undefined> {
    if (target) {
      return target;
    }
    const variants = (targetsToSelect || this.room.getPlayersExceptPlayer(this)).map(toPlayerVariant);
    if (!variants.length) {
      return;
    }
    const selectedTarget = await this.selectVariant<string>({
      variants,
      title: title ?? 'Выбери игрока для атаки',
      canClose,
    });
    if (!selectedTarget) {
      return;
    }
    return this.room.getPlayer(selectedTarget);
  }

  async selectVariant<T extends TVariant['id']>({
    variants,
    title,
    canClose = true,
  }: TSelectVariantParams): Promise<TSelectVariantResult<T>> {
    const data = await this.room.emitWithAck(this.nickname, EEventTypes.showModalSelectVariant, {
      variants,
      title,
      canClose,
    });

    if (data.closed || data.variant === undefined) {
      return;
    }

    return data.variant as T;
  }

  shuffleDiscardToDeck() {
    if (!this.discard.length) {
      return;
    }
    this.deck.unshift(...shuffleArray(this.discard));
    this.discard = [];
    this.room.logEvent(`Игрок ${this.nickname} замешал сброс в колоду`);
    this.room.sendInfo();
  }

  takeCardsTo(target: 'hand' | 'deck' | 'discard', cardsOrCount: Card[] | number, from: Card[]) {
    const cardsToTake: Card[] = [];

    if (typeof cardsOrCount === 'number') {
      const count = cardsOrCount;
      if (!count) {
        return;
      }
      // Если берем из своей колоды
      if (from === this.deck && count > this.deck.length) {
        this.shuffleDiscardToDeck();
      }
      while (cardsToTake.length < count) {
        if (!from.length) {
          break;
        }
        const card = from.splice(-1)[0];
        if (card.theSameType(ECardTypes.lawlessnesses)) {
          this.room.removed.lawlessnesses.push(card);
          continue;
        }
        cardsToTake.push(card);
      }
    } else {
      const cards = cardsOrCount;

      if (!cards.length) {
        return;
      }
      for (let i = from.length - 1; i >= 0; i--) {
        const card = from[i];
        if (!cards.some(c => card.theSame(c))) {
          continue;
        }
        cardsToTake.push(from.splice(i, 1)[0]);
      }
    }

    if (!cardsToTake.length) {
      if (!this.room.deck.length) {
        this.room.endGame();
      }
      return;
    }

    let countTookCards = 0;

    cardsToTake.forEach(card => {
      if (card.tempOwnerNickname) {
        card.tempOwnerNickname = this.nickname;
      } else {
        card.ownerNickname = this.nickname;
      }
      card.played = false;
      card.playing = false;
      // Получаем чужую или покупаем карту для активного игрока
      if (this.theSame(this.room.activePlayer)
          && from !== this.deck
          && from !== this.discard
          && from !== this.hand
          && from !== this.activePermanent) {
        if (!this.room.onCurrentTurn.boughtOrReceivedCards[card.type]) {
          this.room.onCurrentTurn.boughtOrReceivedCards[card.type] = [];
        }
        this.room.onCurrentTurn.boughtOrReceivedCards[card.type]!.push(card);

        const spells1 = this.room.getPlayedCards(ECardTypes.spells, 1);
        const notUsedSpell1 = spells1
          .find(c => c.played && !this.room.onCurrentTurn.usedCards[ECardTypes.spells]?.some(s => s.theSame(c)));
        if (notUsedSpell1) {
          if (!this.room.onCurrentTurn.usedCards[ECardTypes.spells]) {
            this.room.onCurrentTurn.usedCards[ECardTypes.spells] = [];
          }
          this.room.onCurrentTurn.usedCards[ECardTypes.spells].push(notUsedSpell1);
          this.deck.push(card);
        } else {
          this[target].push(card);
        }
      } else {
        this[target].push(card);
      }
      countTookCards += 1;
    });

    if (target === 'hand') {
      this.activatePermanents();
    }

    let targetText = '';
    switch (target) {
      case 'hand':
        targetText = 'руку';
        break;
      case 'deck':
        targetText = 'колоду';
        break;
      case 'discard':
        targetText = 'сброс';
        break;
      default: {
        // noinspection UnnecessaryLocalVariableJS
        const non: never = target;
        console.log(`Неизвестный параметр ${non}`);
      }
    }
    this.room.logEvent(`Игрок ${this.nickname} взял карт в ${targetText}: ${countTookCards} шт.`);
    this.room.sendInfo();
    if (!this.room.deck.length) {
      this.room.endGame();
    }
  }

  takeSkull(skull: Skull, from: Skull[]) {
    const indexSkull = from.indexOf(skull);
    skull.ownerNickname = this.nickname;
    this.skulls.push(skull);
    if (indexSkull !== -1) {
      from.splice(indexSkull, 1);
    }
    this.room.logEvent(`Игрок ${this.nickname} получил жетон дохлого колдуна`);
    this.room.sendInfo();
  }

  theSame(player: Player) {
    return this.nickname === player.nickname;
  }

  get allCards() {
    return [
      ...this.hand,
      ...this.deck,
      ...this.discard,
      ...this.activePermanent,
    ];
  }

  get countActivePermanents() {
    return this.activePermanent.length
      + +this.hasTower
      + +this.hasTowerC
      + this.skulls.filter(skull => [16, 17, 18, 19, 20].some(id => skull.id === id)).length;
  }

  get countSkulls() {
    return this.getCountCards('activePermanent', ECardTypes.treasures, 13) + this.skulls.length;
  }

  get guardCards() {
    return [
      ...this.hand.filter(card => card.canGuard && !card.permanent && !card.tempOwnerNickname),
      ...this.activePermanent.filter(card => card.canGuard),
    ];
  }

  get hasTowerC() {
    return this.allCards
      .some(card => card.theSameType(ECardTypes.creatures, 13) && card.ownerNickname === this.nickname);
  }

  get totalPower(): number {
    let power = Object.values(this.room.onCurrentTurn.playedCards).flat()
      .filter(card => card.played)
      .reduce((sum, card) => sum + card.power, 0);
    power += this.room.onCurrentTurn.additionalPower;

    if (this.getProp(6)) {
      if (Object.keys(this.room.onCurrentTurn.playedCards).length >= 4) {
        power += 1;
      }
    }

    if (this.getProp(7)) {
      const getCountUniqueCards = (type: ECardTypes) => this.room.onCurrentTurn.playedCards[type]
        ?.reduce((cards: Card[], card) => {
          if (!cards.some(c => card.theSame(c))) {
            cards.push(card);
          }
          return cards;
        }, []).length || 0;

      if (getCountUniqueCards(ECardTypes.wizards) >= 2) {
        power += 2;
      }
      if (getCountUniqueCards(ECardTypes.creatures) >= 2) {
        power += 2;
      }
    }

    const countCreatures11 = this.room.getPlayedCards(ECardTypes.creatures, 11).length;
    if (countCreatures11) {
      power += this.countSkulls * countCreatures11;
    }

    if (this.room.getPlayedCards(ECardTypes.familiars, 2).length
        && this.getCountCards('discard', ECardTypes.treasures) >= 3
    ) {
      power += 3;
    }
    if (this.room.getPlayedCards(ECardTypes.familiars, 6).length
        && this.getCountCards('discard', ECardTypes.spells) >= 3
    ) {
      power += 3;
    }
    if (this.room.getPlayedCards(ECardTypes.familiars, 8).length) {
      power += this.countSkulls * 2;
    }
    const countWizards13 = this.room.getPlayedCards(ECardTypes.wizards, 13).length;
    if (countWizards13) {
      power -= this.countSkulls * countWizards13;
    }

    if (this.room.getPlayedCards(ECardTypes.legends, 11).length) {
      power *= 2;
    }

    power -= this.room.onCurrentTurn.powerWasted;
    return power;
  }

  get victoryPoints() {
    let victoryPoints = this.allCards.reduce((sum, card) => sum + card.getTotalVictoryPoints(this), 0);

    victoryPoints -= this.skulls.length * 3;

    if (this.getSkull(14)) {
      victoryPoints -= 2;
    }
    if (this.getSkull(15)) {
      victoryPoints -= 4;
    }

    return victoryPoints;
  }
}
