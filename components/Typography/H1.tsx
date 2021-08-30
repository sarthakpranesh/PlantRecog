import * as React from "react";
import { Text } from "react-native";

export const H1TextFormatter = (text: string) => {
  const firstLetter = text.split("")[0].toUpperCase();
  const formatted = firstLetter + text.slice(1, text.length);
  return formatted;
};

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
      {H1TextFormatter(text)}
    </Text>
  );
};

export default H1;
