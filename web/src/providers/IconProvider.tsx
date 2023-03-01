import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isIconUrl } from '../utils/isIconUrl';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { createStyles } from '@mantine/core';

const useStyles = createStyles((theme, params: { iconColor?: string, svg?: boolean }) => ({
    icon: {
      color: params.iconColor || theme.colors.dark[params.svg ? 0 : 2],
    },
  }));

const Icon: React.FC<{
    icon: IconProp | string;
    color?: string;
    size?: SizeProp;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    insideSVG?: boolean;
    iconClass?: string;
    imageClass?: string;
}> = (props) => {

    const { classes } = useStyles({ iconColor: props.color, svg: props.insideSVG });

    const isUrl = typeof props.icon === 'string' && isIconUrl(props.icon)

    if (!isUrl) {
        return (
            <FontAwesomeIcon
                x = {props.x}
                y = {props.y}
                width = {props.width}
                height = {props.height}
                icon={props.icon as IconProp}
                size = {props.size && props.size as SizeProp}
                className={`${classes.icon} ${props.iconClass}`}
                fixedWidth
            />
        )
    }

    return (
        props.insideSVG ? (
            <image 
                xlinkHref={props.icon as string} 
                className={props.imageClass}
                width={props.width} 
                height={props.height} 
                x={props.x} 
                y={props.y}  
            />
        ) : (
            <img 
                src={props.icon as string} 
                className={props.imageClass} 
                alt={"Missing image"}  
            />
            )
    )
};

export default Icon;