import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const Camera = (props: SvgProps) => {
  return (
    <Svg width={24} height={20} viewBox="0 0 24 20" fill="none" {...props}>
      <Path
        d="M23 17a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
        stroke="#000"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a4 4 0 100-8 4 4 0 000 8z"
        stroke="#000"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Camera;
