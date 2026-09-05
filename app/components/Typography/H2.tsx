import * as React from 'react';
import {Text} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

import {colors} from '../../theme';

export const H2TextFormatter = (text: string) => {
  if (!text) {
    return '';
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export type H2Params = {
  text: string;
  style?: any;
};

const H2 = ({text, style}: H2Params) => {
  return (
    <Text
      style={[
        {
          fontSize: RFValue(17),
          fontWeight: '700',
          color: colors.forest,
          letterSpacing: -0.2,
        },
        style,
      ]}
    >
      {H2TextFormatter(text)}
    </Text>
  );
};

export default H2;
