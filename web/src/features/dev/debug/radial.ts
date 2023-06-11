import { debugData } from '../../../utils/debugData';
import type { MenuItem } from '../../../typings';

export const debugRadial = () => {
  debugData<{ items: MenuItem[]; sub?: boolean }>([
    {
      action: 'openRadialMenu',
      data: {
        items: [
          { icon: 'https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/12-vlc_media_player-512.png', label: 'Pet' },
          { icon: 'https://i.imgur.com/uO3oARr.png', label: 'Paint' },
          { icon: 'warehouse', label: 'Garage' },
          { icon: 'palette', label: 'Quite long  \ntext' },
          { icon: 'palette', label: 'Paint' },
          { icon: 'warehouse', label: 'Garage' },
        ],
      },
    },
  ]);
};
