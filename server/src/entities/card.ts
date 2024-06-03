import type { TCard } from '@coolgedon/shared';

import { ECardTypes } from '@coolgedon/shared';

import type {
  TCanPlayAttackParams,
  TCanPlayParams,
  TGetFinalDamageParams,
  TPlayParams,
} from 'Type/entities/card';
import type { Room } from 'Entity/room';
import type { Player } from 'Entity/player';

import { getCountCardsIn, getTotalDamage } from 'Helpers';
import { playGuard } from 'Event/playGuard';
import {
  playCardByLawlessness,
  playGroupAttack,
  playLawlessness, playPermanent,
  simplePlayCard,
} from 'Event/playCard';

interface TCardConstructorParams {
  room: Room;
  id: number | string;
  type: ECardTypes;
  number: number | null;
  victoryPoints: number;
  power: number;
  cost: number;
  playable: boolean;
  canGuard: boolean;
  permanent: boolean;
}

export class Card {
  // Базовая стоимость карты
  private readonly cost: number;
  private readonly playable: boolean;
  private readonly room: Room;
  private readonly victoryPoints: number;
  readonly canGuard: boolean;
  // Дополнительная информация
  data?: unknown;
  readonly id: number | string;
  readonly number: number | null;
  ownerNickname?: string;
  readonly permanent: boolean;
  played = false;
  // В процессе разыгрывания
  playing = false;
  readonly power: number;
  // Ник владельца карты, если карта взята на время
  tempOwnerNickname?: string;
  readonly type: ECardTypes;

  constructor({
    room,
    id,
    type,
    number,
    victoryPoints,
    power,
    cost,
    playable,
    canGuard,
    permanent,
  }: TCardConstructorParams) {
    this.room = room;
    this.id = id;
    this.type = type;
    this.number = number;
    this.victoryPoints = victoryPoints;
    this.power = power;
    this.cost = cost;
    this.playable = playable;
    this.canGuard = canGuard;
    this.permanent = permanent;
  }

  activate() {
    if (!this.permanent) {
      console.error('Невозможно активировать не постоянку');
      return;
    }
    if (!this.owner) {
      console.error('Невозможно активировать постоянку: нет владельца');
      return;
    }
    if (!this.owner.theSame(this.room.activePlayer)) {
      console.error('Невозможно активировать постоянку: владелец не активный игрок');
      return;
    }
    if (this.tempOwnerNickname) {
      this.ownerNickname = this.tempOwnerNickname;
      this.tempOwnerNickname = undefined;
    }
    const owner = this.owner!;
    void this.play({ type: 'permanent', params: { initPermanent: true } });
    const cardIndex = owner.hand.findIndex(card => card.theSame(this));
    owner.activePermanent.push(owner.hand.splice(cardIndex, 1)[0]);
    this.room.logEvent(`Игрок ${owner.nickname} активировал постоянку`);
    this.room.sendInfo();
  }

  canPlay({
    player,
    target,
  }: TCanPlayParams = {}): boolean {
    if (this.room.playersArray.length < 2 || !this.playable) {
      return false;
    }

    const finalPlayer = player || this.room.activePlayer;
    const rightPlayer = this.room.getPlayerByPos(finalPlayer, 'right');
    const finalTargetsForLawlessness = target
      ? [target]
      : this.room.playersArray;
    const finalTargets = target
      ? [target]
      : this.room.getPlayersExceptPlayer(finalPlayer);

    switch (this.type) {
      case ECardTypes.lawlessnesses:
        switch (this.number) {
          case 1:
            return !!this.room.legends.length;
          case 2:
            return finalTargetsForLawlessness.some(p => p.hp >= 10);
          case 3:
            return this.room.shop.some(shopCard => shopCard.canPlayAttack({ target }));
          case 4:
            return true;
          case 5:
            return !!this.room.deck.length;
          case 6:
            return true;
          case 7:
            return finalTargetsForLawlessness.some(p => p.deck.length || p.discard.length);
          case 8:
            return !!rightPlayer?.hand.length || !!rightPlayer?.discard.length;
          case 9:
            return true;
          case 10:
            return true;
          case 11:
            return true;
          case 12:
            return finalTargetsForLawlessness.some(p => p.hand.some(handCard => handCard.canPlayAttack({ target: p })));
          case 13:
            return finalTargetsForLawlessness.some(p => p.hp <= 10);
          case 14:
            return finalTargetsForLawlessness.some(p => p.activePermanent.length);
          case 15:
            return true;
          case 16:
            return true;
          case 17:
            return finalTargetsForLawlessness.reduce((count, p) => count + +!!p.skulls.length, 0) > 1;
          case 18:
            return !!this.room.sluggishStick.length;
          case 19:
            return true;
          case 20:
            return this.room.removed.lawlessnesses.length > 1;
          case 21:
            return finalTargetsForLawlessness.some(p => p.hand.length) && !!this.room.sluggishStick.length;
          case 22:
            return true;
          case 23:
            return finalTargetsForLawlessness.some(p => p.hand.length || p.discard.length);
          case 24:
            return finalTargetsForLawlessness.some(p => p.hand.length);
          case 25:
            return finalTargetsForLawlessness.some(p => p.getCard('discard', ECardTypes.seeds, 1));
          case 26:
            return !!this.room.deck.length;
          default:
            return false;
        }
      case ECardTypes.creatures:
        switch (this.number) {
          case 1:
            return this.canPlayAttack({ target, player });
          case 2:
            return true;
          case 3:
            return true;
          case 4:
            return true;
          case 5:
            return true;
          case 6:
            return this.canPlayAttack({ target, player });
          case 10:
            return this.canPlayAttack({ target, player });
          case 12:
            return this.canPlayAttack({ target, player });
          case 13:
            return finalTargets.some(p => p.hand.length);
          default:
            return false;
        }
      case ECardTypes.familiars:
        switch (this.number) {
          case 1:
            return true;
          case 3:
            return true;
          case 4:
            return this.canPlayAttack({ target, player });
          case 9:
            return this.canPlayAttack({ target, player });
          case 10:
            return this.canPlayAttack({ target, player });
          case 11:
            return !!this.room.shop.length;
          case 12:
            return this.canPlayAttack({ target, player });
          default:
            return false;
        }
      case ECardTypes.legends:
        switch (this.number) {
          case 1:
            return true;
          case 2:
            return !!this.room.sluggishStick.length;
          case 3:
            return !!getCountCardsIn(
              [...finalPlayer.deck, ...finalPlayer.discard, ...finalPlayer.discard],
              ECardTypes.seeds,
            );
          case 4:
            return this.canPlayAttack({ target, player });
          case 5:
            return true;
          case 7:
            return true;
          case 8:
            return true;
          case 9:
            return true;
          case 10:
            return true;
          case 12:
            return !!this.room.props.length;
          default:
            return false;
        }
      case ECardTypes.spells:
        switch (this.number) {
          case 4:
            return this.canPlayAttack({ target, player });
          case 5:
            return true;
          case 6:
            return true;
          case 8:
            return true;
          case 9:
            return true;
          case 10:
            return this.canPlayAttack({ target, player });
          case 12:
            return !!finalPlayer.discard.length;
          case 13:
            return this.canPlayAttack({ target, player });
          default:
            return false;
        }
      case ECardTypes.treasures:
        switch (this.number) {
          case 1:
            return true;
          case 2:
            return true;
          case 4:
            return this.canPlayAttack({ target, player });
          case 6:
            return true;
          case 7:
            return this.canPlayAttack({ target, player });
          case 9:
            return true;
          case 10:
            return true;
          default:
            return false;
        }
      case ECardTypes.wizards:
        switch (this.number) {
          case 1:
            return true;
          case 3:
            return true;
          case 4:
            return true;
          case 5:
            return this.canPlayAttack({ target, player });
          case 6:
            return this.canPlayAttack({ target, player });
          case 7:
            return true;
          case 8:
            return finalPlayer.hand.reduce((count, handCard) => count + +handCard.played, 0) <= 0;
          case 9:
            return true;
          case 10:
            return true;
          case 11:
            return this.canPlayAttack({ target, player });
          case 12:
            return true;
          default:
            return false;
        }
      case ECardTypes.seeds:
        switch (this.number) {
          case 2:
            return true;
          default:
            return false;
        }
      case ECardTypes.crazyMagic:
        return true;
      default:
        return false;
    }
  }

  canPlayAttack({
    target,
    player,
  }: TCanPlayAttackParams): boolean {
    if (this.room.playersArray.length < 2) {
      return false;
    }

    const totalPlayer = player || this.room.activePlayer;
    const totalTargets = target
      ? [target]
      : this.room.getPlayersExceptPlayer(totalPlayer);

    switch (this.type) {
      case ECardTypes.creatures:
        switch (this.number) {
          case 1:
            return totalTargets.some(p => p.hand.length);
          case 2:
            return !!getCountCardsIn([...totalPlayer.hand, ...totalPlayer.discard], ECardTypes.sluggishStick);
          case 6:
            return true;
          case 10:
            return !!this.room.sluggishStick.length;
          case 12:
            return !!totalPlayer.countActivePermanents;
          default:
            return false;
        }
      case ECardTypes.familiars:
        switch (this.number) {
          case 4:
            return true;
          case 9:
            return !!this.room.sluggishStick.length;
          case 10:
            return !!getCountCardsIn([...totalPlayer.hand, ...totalPlayer.discard], ECardTypes.creatures);
          case 12:
            return !!getCountCardsIn([...totalPlayer.hand, ...totalPlayer.discard], ECardTypes.wizards);
          default:
            return false;
        }
      case ECardTypes.legends:
        switch (this.number) {
          case 4:
            return true;
          default:
            return false;
        }
      case ECardTypes.spells:
        switch (this.number) {
          case 4:
            return true;
          case 8:
            return true;
          case 10:
            return totalTargets.some(p => p.discard.some(({ canGuard }) => canGuard));
          case 13:
            return true;
          default:
            return false;
        }
      case ECardTypes.treasures:
        switch (this.number) {
          case 1:
            return totalTargets.some(p => p.getCard('discard', ECardTypes.legends));
          case 4:
            return true;
          case 6:
            return [...totalPlayer.hand, ...totalPlayer.discard]
              .some(card => card.getTotalCost(totalPlayer) === 0);
          case 7:
            return true;
          default:
            return false;
        }
      case ECardTypes.wizards:
        switch (this.number) {
          case 1:
            return true;
          case 3:
            return totalTargets.some(p => p.hp < totalPlayer.hp);
          case 5:
            return totalTargets.some(p => p.hand.length);
          case 6:
            return true;
          case 11:
            return totalTargets.some(p => p.hand.length);
          default:
            return false;
        }
      default:
        return false;
    }
  }

  canPlayGroupAttack(target: Player): boolean {
    switch (this.number) {
      case 2: {
        const cardTypesInHand = target.hand.reduce((types: ECardTypes[], c) => {
          if (!types.includes(c.type)) {
            types.push(c.type);
          }
          return types;
        }, []);
        // noinspection UnnecessaryLocalVariableJS
        const hasNotClearedTypes = cardTypesInHand.length !== target.hand.length;
        return hasNotClearedTypes;
      }
      case 3:
        return true;
      case 4:
        return !!this.room.sluggishStick.length && !!target.hand
          .filter(handCard => handCard.getTotalCost(target) >= 4).length;
      case 5:
        return !!target.hand.length
            && !!target.hand.filter(handCard => handCard.getTotalVictoryPoints(target) > 0).length;
      case 7:
        return true;
      case 8:
        return true;
      case 10:
        return !!this.room.sluggishStick.length
            && this.room.shop.some(shopCard => shopCard.theSameType(ECardTypes.creatures));
      case 11:
        return target.hand.some(handCard => handCard.getTotalCost(target));
      case 12:
        return true;
      default:
        return false;
    }
  }

  format(forPlayer?: Player): TCard {
    return {
      number: this.number,
      ownerNickname: this.ownerNickname,
      totalCost: forPlayer ? this.getTotalCost(forPlayer) : undefined,
      id: this.id,
      canPlay: !this.played && !this.playing,
      type: this.type,
      data: this.data,
    };
  }

  getFinalDamage({ concreteDamage, target, attacker }: TGetFinalDamageParams) {
    if (concreteDamage !== undefined) {
      return concreteDamage;
    }
    switch (this.type) {
      case ECardTypes.seeds:
        switch (this.number) {
          case 2:
            return getTotalDamage(1, attacker) + (+!!target.getSkull(16) * 3);
          default:
            return 0;
        }
      case ECardTypes.creatures:
        switch (this.number) {
          case 1:
            return getTotalDamage(
              target.hand
                .reduce((max, handCard) => max < handCard.getTotalCost(target)
                  ? handCard.getTotalCost(target)
                  : max, 0),
              attacker,
            );
          case 2: {
            if (!attacker) {
              return 0;
            }
            const countSticks = attacker.getCountCards('hand', ECardTypes.sluggishStick)
                + attacker.getCountCards('discard', ECardTypes.sluggishStick);
            return getTotalDamage(countSticks * 2, attacker);
          }
          case 6:
            return getTotalDamage(4, attacker);
          case 12:
            if (!attacker) {
              return 0;
            }
            return getTotalDamage(attacker.countActivePermanents * 3, attacker);
          default:
            return 0;
        }
      case ECardTypes.familiars:
        switch (this.number) {
          case 4:
            return getTotalDamage(7, attacker);
          case 10:
            if (!attacker) {
              return 0;
            }
            return getTotalDamage(
              getCountCardsIn([...attacker.hand, ...attacker.discard], ECardTypes.creatures) * 2,
              attacker,
            );
          case 12:
            if (!attacker) {
              return 0;
            }
            return getTotalDamage(
              getCountCardsIn([...attacker.hand, ...attacker.discard], ECardTypes.wizards) * 2,
              attacker,
            );
          default:
            return 0;
        }
      case ECardTypes.legends:
        switch (this.number) {
          case 4:
            return getTotalDamage(4, attacker);
          default:
            return 0;
        }
      case ECardTypes.spells:
        switch (this.number) {
          case 4:
            return getTotalDamage(5, attacker);
          case 8:
            return getTotalDamage(6, attacker);
          case 10:
            return getTotalDamage(
              target.discard.filter(discardCard => discardCard.canGuard).length * 2,
              attacker,
            );
          case 13:
            return getTotalDamage(7, attacker);
          default:
            return 0;
        }
      case ECardTypes.treasures:
        switch (this.number) {
          case 1:
            return getTotalDamage(
              target.getCountCards('discard', ECardTypes.legends) * 4,
              attacker,
            );
          case 4:
            return getTotalDamage(5, attacker);
          case 7:
            return getTotalDamage(3, attacker);
          default:
            return 0;
        }
      case ECardTypes.wizards:
        switch (this.number) {
          case 1:
            return getTotalDamage(10, attacker);
          case 3:
            return getTotalDamage(5, attacker);
          case 6: {
            const topDeckCard = target.deck.slice(-1)[0];
            if (!topDeckCard) {
              return 0;
            }
            return getTotalDamage(topDeckCard.getTotalCost(target), attacker);
          }
          case 11:
            return getTotalDamage(5, attacker);
          default:
            return 0;
        }
      default:
        return 0;
    }
  }

  getTotalCost(forPlayer: Player) {
    if (forPlayer.getSkull(18)
      && (this.theSameType(ECardTypes.legends) || this.theSameType(ECardTypes.crazyMagic))) {
      return this.cost + 1;
    }
    if (forPlayer.getSkull(19)
      && (this.theSameType(ECardTypes.creatures) || this.theSameType(ECardTypes.treasures))) {
      return this.cost + 1;
    }
    if (forPlayer.getSkull(20)
      && (this.theSameType(ECardTypes.wizards) || this.theSameType(ECardTypes.spells))) {
      return this.cost + 1;
    }
    return this.cost;
  }

  getTotalVictoryPoints(forPlayer: Player) {
    if (this.theSameType(ECardTypes.treasures, 2)
      && getCountCardsIn(forPlayer.allCards, ECardTypes.treasures, 2) >= 2) {
      return 5;
    }
    if (this.room.gameEnded) {
      const countTreasures13 = forPlayer.getCountCards('activePermanent', ECardTypes.treasures, 13);
      if (countTreasures13) {
        return countTreasures13 * forPlayer.skulls.length;
      }
    }

    return this.victoryPoints;
  }

  markAsPlayed() {
    if (this.played || this.room.onCurrentTurn.playedCards[this.type]?.find(c => this.theSame(c))) {
      throw new Error('Невозможно пометить карту разыгранной: карта была уже разыграна');
    }
    const owner = this.owner;
    if (!owner) {
      throw new Error('Невозможно пометить карту разыгранной: нет владельца');
    }
    if (!owner.theSame(this.room.activePlayer)) {
      throw new Error('Невозможно пометить карту разыгранной: владелец не активный игрок');
    }
    if (this.theSameType(ECardTypes.lawlessnesses)) {
      throw new Error('Невозможно пометить карту разыгранной: это беспредел');
    }

    const newType = !this.room.onCurrentTurn.playedCards[this.type];

    this.played = true;
    if (!this.room.onCurrentTurn.playedCards[this.type]) {
      this.room.onCurrentTurn.playedCards[this.type] = [];
    }
    this.room.onCurrentTurn.playedCards[this.type]!.push(this);

    // Места
    const place1 = owner.getCard('activePermanent', ECardTypes.places, 1);
    if (
      place1
        && this.theSameType(ECardTypes.wizards)
        && this.room.onCurrentTurn.playedCards[ECardTypes.wizards]?.length === 1
    ) {
      void place1.play({ type: 'permanent' });
    }

    const place2 = owner.getCard('activePermanent', ECardTypes.places, 2);
    if (
      place2
        && this.theSameType(ECardTypes.creatures)
        && this.room.onCurrentTurn.playedCards[ECardTypes.creatures]?.length === 1
    ) {
      void place2.play({ type: 'permanent' });
    }

    const place3 = owner.getCard('activePermanent', ECardTypes.places, 3);
    if (
      place3
        && this.theSameType(ECardTypes.spells)
        && this.room.onCurrentTurn.playedCards[ECardTypes.spells]?.length === 1
    ) {
      void place3.play({ type: 'permanent' });
    }

    const place4 = owner.getCard('activePermanent', ECardTypes.places, 4);
    if (
      place4
        && this.theSameType(ECardTypes.treasures)
        && this.room.onCurrentTurn.playedCards[ECardTypes.treasures]?.length === 1
    ) {
      void place4.play({ type: 'permanent' });
    }

    // Свойства
    const prop1 = owner.getProp(1);
    if (prop1
        && this.theSameType(ECardTypes.treasures)
        && this.room.onCurrentTurn.playedCards[ECardTypes.treasures]?.length === 2
    ) {
      void prop1.play();
    }

    const prop2 = owner.getProp(2);
    if (prop2 && this.theSameType(ECardTypes.creatures)) {
      void prop2.play({ card: this });
    }

    const prop5 = owner.getProp(5);
    if (prop5 && this.theSameType(ECardTypes.spells)) {
      void prop5.play();
    }

    const prop6 = owner.getProp(6);
    if (prop6 && newType && Object.keys(this.room.onCurrentTurn.playedCards).length === 4) {
      void prop6.play();
    }

    this.room.logEvent(`Игрок ${owner.nickname} разыграл карту`);
    this.room.sendInfo();
  }

  async play(data: TPlayParams) {
    switch (data.type) {
      case 'simple':
        return simplePlayCard({ ...(data.params || {}), room: this.room, card: this });
      case 'lawlessness':
        return playLawlessness({ room: this.room, card: this });
      case 'groupAttack':
        return playGroupAttack({ ...(data.params || {}), room: this.room, card: this });
      case 'byLawlessness':
        return playCardByLawlessness({ ...(data.params || {}), room: this.room, card: this });
      case 'permanent':
        return playPermanent({ ...(data.params || {}), room: this.room, card: this });
      default:
    }
  }

  async playGuard(params: Omit<Parameters<typeof playGuard>[0], 'card' | 'target' | 'room'>) {
    if (!this.owner) {
      console.error('Невозможно разыграть защиту: нет владельца');
      return;
    }
    return playGuard({
      ...params,
      target: this.owner,
      room: this.room,
      card: this,
    });
  }

  theSame(card: Card) {
    return this.id === card.id;
  }

  theSameType(type: ECardTypes, number?: number) {
    return this.type === type && (!number || this.number === number);
  }

  get owner() {
    if (!this.tempOwnerNickname && !this.ownerNickname) {
      return;
    }
    return this.room.getPlayer((this.tempOwnerNickname ?? this.ownerNickname)!);
  }
}
