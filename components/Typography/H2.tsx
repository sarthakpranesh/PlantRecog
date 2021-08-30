import * as React from "react";
import { Text } from "react-native";

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
          fontWeight: "800",
          color: "#373D3F",
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
};

export default H2;
