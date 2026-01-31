import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const Folder = (props: SvgProps) => {
  return (
    <Svg width={22} height={20} viewBox="0 0 22 20" fill="none" {...props}>
      <Path
        d="M21 17a2 2 0 01-2 2H3a2 2 0 01-2-2V3a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"
        stroke="#000"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Folder;
