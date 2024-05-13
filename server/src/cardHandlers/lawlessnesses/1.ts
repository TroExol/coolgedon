import type { TPlayLawlessnessHandlerParams } from 'Type/events/playCard';

import { getLastElement } from 'Helpers';

exports.default = async function ({
  room,
}: TPlayLawlessnessHandlerParams) {
  const firstLegend = getLastElement(room.legends);
  if (firstLegend) {
    await firstLegend.play({ type: 'groupAttack' });
  }
};
