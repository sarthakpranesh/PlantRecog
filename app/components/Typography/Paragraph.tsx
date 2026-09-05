import * as React from 'react';
import {Text} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

import {colors} from '../../theme';

export type ParagraphParams = {
  text: string;
  style?: any;
};

const Paragraph = ({text, style}: ParagraphParams) => {
  return (
    <Text
      style={[
        {
          fontSize: RFValue(14),
          fontWeight: '400',
          color: colors.body,
          lineHeight: RFValue(21),
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
};

export default Paragraph;
