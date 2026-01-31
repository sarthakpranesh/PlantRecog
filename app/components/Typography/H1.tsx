import * as React from "react";
import { Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

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
          fontSize: RFValue(32),
          fontWeight: "bold",
          color: "#373D3F",
          marginTop: 12,
        },
        style,
      ]}
    >
      {H1TextFormatter(text)}
    </Text>
  );
};

export default H1;
