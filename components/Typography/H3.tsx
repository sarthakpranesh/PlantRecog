import * as React from "react";
import { Text } from "react-native";

export const H3TextFormatter = (text: string) => {
  return text.toUpperCase();
};

export type H3Params = {
  text: string;
  style?: any;
};

const H3 = ({ text, style }: H3Params) => {
  return (
    <Text
      style={[
        {
          fontSize: 12,
          fontWeight: "bold",
          color: "#373D3F",
          marginTop: 8,
        },
        style,
      ]}
    >
      {H3TextFormatter(text)}
    </Text>
  );
};

export default H3;
