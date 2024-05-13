import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';
import type { Player } from 'Entity/player';

import { getMaxHpPlayers, getMinHpPlayers } from 'Helpers';

exports.default = async function ({
  room,
}: TPlayLawlessnessHandlerParams) {
  const maxHpPlayer: Player | undefined = getMaxHpPlayers(room.playersArray)[0];
  const minHpPlayer: Player | undefined = getMinHpPlayers(room.playersArray)[0];

  if (!maxHpPlayer || !minHpPlayer || maxHpPlayer.hp === minHpPlayer.hp) {
    return;
  }
  const tempMaxHp = maxHpPlayer.hp;
  maxHpPlayer.hp = minHpPlayer.hp;
  minHpPlayer.hp = tempMaxHp;
  room.sendInfo();
  room.logEvent(`Игрок ${minHpPlayer.nickname} обменялся здоровьем с игроком ${maxHpPlayer.nickname}`);
};
