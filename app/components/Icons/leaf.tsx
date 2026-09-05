import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const Leaf = ({color = '#1F5C3D', ...props}: SvgProps) => {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M5 19c8-1 13-7 14-15-8 1-14 7-14 15z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 19c3-6 8-10 14-12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Leaf;
