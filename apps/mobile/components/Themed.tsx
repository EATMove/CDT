/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { className, lightColor, darkColor, style, ...otherProps } = props;
  const colorScheme = useColorScheme();
  
  // Build className based on theme
  let themeClass = 'text-black dark:text-white';
  
  if (lightColor || darkColor) {
    // If custom colors are provided, use style prop instead of className
    const color = colorScheme === 'dark' ? darkColor : lightColor;
    return <DefaultText style={[{ color }, style]} className={className} {...otherProps} />;
  }

  return <DefaultText style={style} className={`${themeClass} ${className || ''}`} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { className, lightColor, darkColor, style, ...otherProps } = props;
  const colorScheme = useColorScheme();
  
  // Build className based on theme
  let themeClass = 'bg-white dark:bg-black';
  
  if (lightColor || darkColor) {
    // If custom colors are provided, use style prop instead of className
    const backgroundColor = colorScheme === 'dark' ? darkColor : lightColor;
    return <DefaultView style={[{ backgroundColor }, style]} className={className} {...otherProps} />;
  }

  return <DefaultView style={style} className={`${themeClass} ${className || ''}`} {...otherProps} />;
}
