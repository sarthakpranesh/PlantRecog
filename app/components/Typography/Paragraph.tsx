import * as React from "react";
import { Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export type ParagraphParams = {
  text: string;
  style?: any;
};

const Paragraph = ({ text, style }: ParagraphParams) => {
  return (
    <Text
      style={[
        {
          fontSize: RFValue(14),
          fontWeight: "600",
          color: "#373D3F",
          textAlign: "justify",
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
};

export default Paragraph;
