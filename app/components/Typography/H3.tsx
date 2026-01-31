import * as React from "react";
import { Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

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
          fontSize: RFValue(12),
          fontWeight: "800",
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
