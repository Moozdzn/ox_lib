import { Box, createStyles } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useNuiEvent } from '../../../hooks/useNuiEvent';
import { fetchNui } from '../../../utils/fetchNui';
import ScaleFade from '../../../transitions/ScaleFade';
import type { RadialMenuItem } from '../../../typings';
import { useLocales } from '../../../providers/LocaleProvider';
import Icon from '../../../providers/IconProvider';
import { theme } from '../../../theme';

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  sector: {
    fill: theme.colors.dark[9],
    fillOpacity: 0.0,
    color: '#fff',

    '&:hover': {
      fill: theme.fn.primaryColor(),
      fillOpacity: 0.8,
      /* fillOpacity: 0.6, */
      '> g > text, > g > svg > path': {
        fill: '#fff',
      },
    },
    '> g > text': {
    },
  },
  content: {
    fill: '#fff',
    fillOpacity: 1
  },
  backgroundCircle: {
    fill: theme.colors.dark[9],
    fillOpacity: 0.2,
  },
  centerCircle: {
    fill: theme.fn.primaryColor(),
    color: '#fff',
    stroke: theme.colors.dark[9],
    strokeOpacity: 0.0,
    strokeWidth: 4,
    '&:hover': {
      fill: theme.colors[theme.primaryColor][theme.fn.primaryShade() - 1],
    },
  },
  centerIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  centerIcon: {
    color: '#fff',
  },
}));

// includes More... button
const PAGE_ITEMS = 5;
const RADIAL_SIZE = 250

const calculateSize = (value: number) => (value * RADIAL_SIZE) / 175

const degToRad = (deg: number) => deg * (Math.PI / 180);

const RadialMenu: React.FC = () => {
  const { classes } = useStyles();
  const { locale } = useLocales();
  const [visible, setVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<RadialMenuItem[]>([]);
  const [menu, setMenu] = useState<{ items: RadialMenuItem[]; sub?: boolean; page: number }>({
    items: [],
    sub: false,
    page: 1,
  });

  const changePage = async (increment?: boolean) => {
    setVisible(false);

    const didTransition: boolean = await fetchNui('radialTransition');

    if (!didTransition) return;

    setVisible(true);
    setMenu({ ...menu, page: increment ? menu.page + 1 : menu.page - 1 });
  };

  useEffect(() => {
    if (menu.items.length <= PAGE_ITEMS) return setMenuItems(menu.items);
    const items = menu.items.slice(PAGE_ITEMS * (menu.page - 1) - (menu.page - 1), PAGE_ITEMS * menu.page - menu.page + 1);
    if (PAGE_ITEMS * menu.page - menu.page + 1 < menu.items.length) {
      items[items.length - 1] = { icon: 'ellipsis-h', label: locale.ui.more, isMore: true };
    }
    setMenuItems(items);
  }, [menu.items, menu.page]);

  useNuiEvent('openRadialMenu', async (data: { items: RadialMenuItem[]; sub?: boolean, option?: string } | false) => {
    if (!data) return setVisible(false);
    let initialPage = 1;
    if (data.option) {
      data.items.findIndex((item, index) => item.menu == data.option && (initialPage = Math.floor(index / PAGE_ITEMS) + 1));
    }
    setMenu({ ...data, page: initialPage });
    setVisible(true);
  });

  useNuiEvent('refreshItems', (data: RadialMenuItem[]) => {
    setMenu({ ...menu, items: data });
  });

  return (
    <>
      <Box
        className={classes.wrapper}
        onContextMenu={async () => {
          if (menu.page > 1) await changePage();
          else if (menu.sub) fetchNui('radialBack');
        }}
      >
        <ScaleFade visible={visible}>
          <svg width={RADIAL_SIZE * 2} height={RADIAL_SIZE * 2} transform="rotate(90)">
            {/*Fixed issues with background circle extending the circle when there's less than 3 items*/}
            <g transform={`translate(${RADIAL_SIZE}, ${RADIAL_SIZE})`}>
              <circle r={RADIAL_SIZE} className={classes.backgroundCircle} />
            </g>
            {menuItems.map((item, index) => {
              // Always draw full circle to avoid elipse circles with 2 or less items
              const pieAngle = 360 / (menuItems.length < 3 ? 3 : menuItems.length);
              const angle = degToRad(pieAngle / 2 + 90);
              const gap = 0;
              const radius = RADIAL_SIZE * 0.65 - gap;
              const sinAngle = Math.sin(angle);
              const cosAngle = Math.cos(angle);
              const iconX = RADIAL_SIZE + sinAngle * radius;
              const iconY = RADIAL_SIZE + cosAngle * radius;

              return (
                <>
                  <g
                    transform={`rotate(-${index * pieAngle} ${RADIAL_SIZE} ${RADIAL_SIZE}) translate(${sinAngle * gap}, ${cosAngle * gap})`}
                    className={classes.sector}
                    onClick={async () => {
                      const clickIndex = menu.page === 1 ? index : PAGE_ITEMS * (menu.page - 1) - (menu.page - 1) + index;
                      if (!item.isMore) fetchNui('radialClick', clickIndex);
                      else {
                        await changePage(true);
                      }
                    }}
                  >
                    <path
                      d={`M${RADIAL_SIZE}.01,${RADIAL_SIZE}.01 l${RADIAL_SIZE - gap},0 A${RADIAL_SIZE}.01,${RADIAL_SIZE}.01 0 0,0 ${
                        RADIAL_SIZE + (RADIAL_SIZE - gap) * Math.cos(-degToRad(pieAngle))
                      }, ${RADIAL_SIZE + (RADIAL_SIZE - gap) * Math.sin(-degToRad(pieAngle))} z`}
                    />
                    <g transform={`rotate(${index * pieAngle - 90} ${iconX} ${iconY})`} pointerEvents="none">
                      <Icon 
                        icon={item.icon} 
                        x={iconX - calculateSize(12.5)} 
                        y={iconY - calculateSize(17.5)} 
                        width={calculateSize(25)} 
                        height={calculateSize(25)} 
                        // @ts-ignore
                        iconClass={classes.content}
                        color="#fff"
                        insideSVG={true} 
                      />
                      <text x={iconX} y={iconY + (item.label.includes("  \n") ? 7 : 25)} fill="#fff" textAnchor="middle" pointerEvents="none" className={classes.content}>
                        {item.label.includes("  \n")
                          ? item.label.split("  \n").map((value) => <tspan x={iconX} dy="1.2em">{value}</tspan>)
                          : item.label
                        }
                      </text>
                    </g>
                  </g>
                </>
              );
            })}
            <g
              transform={`translate(${RADIAL_SIZE}, ${RADIAL_SIZE})`}
              onClick={async () => {
                if (menu.page > 1) await changePage();
                else {
                  if (menu.sub) fetchNui('radialBack');
                  else {
                    setVisible(false);
                    fetchNui('radialClose');
                  }
                }
              }}
            >
              <circle r={calculateSize(32)} className={classes.centerCircle} />
            </g>
          </svg>
          <div className={classes.centerIconContainer}>
            <FontAwesomeIcon
              icon={!menu.sub && menu.page < 2 ? 'xmark' : 'arrow-rotate-left'}
              fixedWidth
              className={classes.centerIcon}
              color="#fff"
              size="2x"
            />
          </div>
        </ScaleFade>
      </Box>
    </>
  );
};

export default RadialMenu;
