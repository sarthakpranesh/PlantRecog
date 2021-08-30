import * as React from "react";
import { Text } from "react-native";

import { HTextFormatter } from ".";

export type H1Params = {
  text: string;
  style?: any;
};

const H1 = ({ text, style }: H1Params) => {
  return (
    <Text
      style={[
        {
          fontSize: 32,
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

export default H1;
