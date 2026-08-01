// components/SearchIcon.tsx
/**
 * components/SearchIcon.tsx
 *
 * Magnifying-glass icon, matching the Kårappen graphic profile's
 * "Sök" icon concept (hand-authored - the profile PDF is a raster
 * mockup screenshot, not exported vector source).
 */
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

export interface SearchIconProps {
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}

const SearchIcon: React.FC<SearchIconProps> = ({ size = 20, color, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="10" cy="10" r="6" stroke={color} strokeWidth={2} />
    <Line x1="14.5" y1="14.5" x2="20" y2="20" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export default SearchIcon;
