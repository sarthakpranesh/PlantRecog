import * as React from "react";
import { Text } from "react-native";

export type ParagraphParams = {
  text: string;
  style?: any;
};

const Paragraph = ({ text, style }: ParagraphParams) => {
  return (
    <Text
      style={[
        {
          fontSize: 14,
          fontWeight: "800",
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
