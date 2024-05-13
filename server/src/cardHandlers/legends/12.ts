import type { TPlayCardHandler } from 'Type/events/playCard';
import type { Prop } from 'Entity/prop';

import { getRandomElements } from 'Helpers';

const handler: TPlayCardHandler = async ({
  room,
  player,
  markAsPlayed,
}) => {
  const randomProp: Prop | undefined = getRandomElements(room.props, 1)[0];
  if (randomProp) {
    randomProp.temp = true;
    randomProp.ownerNickname = player.nickname;
    player.props.push(randomProp);
    room.props = room.props.filter(prop => prop.id !== randomProp.id);
    room.logEvent(`Игрок ${player.nickname} получил дополнительное временное свойство`);
  }
  markAsPlayed?.();
};

exports.default = handler;
