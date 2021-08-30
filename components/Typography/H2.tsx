import * as React from "react";
import { Text } from "react-native";

import { HTextFormatter } from ".";

export type H2Params = {
  text: string;
  style?: any;
};

const H2 = ({ text, style }: H2Params) => {
  return (
    <Text
      style={[
        {
          fontSize: 18,
          fontWeight: "bold",
          color: "#373D3F",
        },
        style,
      ]}
    >
      {HTextFormatter(text)}
    </Text>
  );
};

export default H2;
