import * as React from 'react';
import { Text } from 'react-native';

export type H3Params = {
  text: string,
  style?: any,
}

const H3 = ({text, style}: H3Params) => {
  return (
    <Text style={[
      {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#373D3F',
      },
      style
    ]}>
      {text}
    </Text>
  )
}

export default H3;
