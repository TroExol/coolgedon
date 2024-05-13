import type { Room } from 'Entity/room';
import type { Prop } from 'Entity/prop';
import type { Card } from 'Entity/card';

interface TCancelSelectStartCardsParams {
  room: Room;
  familiars: Card[];
  props: Prop[];
}

export const cancelSelectStartCards = ({ room, familiars, props }: TCancelSelectStartCardsParams) => {
  if (familiars) {
    room.familiars.push(...familiars);
  }
  if (props) {
    room.props.push(...props);
  }
};
