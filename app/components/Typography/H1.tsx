import * as React from 'react';
import {Text} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

import {colors} from '../../theme';

export const H1TextFormatter = (text: string) => {
  if (!text) {
    return '';
  }
  const spaced = text.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export type H1Params = {
  text: string;
  style?: any;
};

const H1 = ({text, style}: H1Params) => {
  return (
    <Text
      style={[
        {
          fontSize: RFValue(28),
          fontWeight: '700',
          color: colors.forest,
          letterSpacing: -0.6,
          lineHeight: RFValue(34),
        },
        style,
      ]}
    >
      {H1TextFormatter(text)}
    </Text>
  );
};

export default H1;
