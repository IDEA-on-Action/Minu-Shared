/**
 * Minu Tailwind CSS Preset
 *
 * 소비자 서비스(Find, Frame, Build, Keep)에서 사용할 Tailwind 프리셋
 *
 * @example
 * // tailwind.config.ts
 * import { minuPreset } from '@minu/ui/tailwind';
 *
 * export default {
 *   presets: [minuPreset],
 *   content: [
 *     './src/** /*.{js,ts,jsx,tsx}',
 *     './node_modules/@minu/ui/** /*.{js,ts,jsx,tsx}',
 *   ],
 * };
 */

import { colors, typography, spacing, borders, shadows, transitions, breakpoints, zIndex } from './tokens';

export const minuPreset = {
  theme: {
    extend: {
      // 컬러
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        gray: colors.gray,
        // 서비스별 브랜드 컬러
        find: colors.brand.find,
        frame: colors.brand.frame,
        build: colors.brand.build,
        keep: colors.brand.keep,
        // 시맨틱 컬러
        success: colors.semantic.success,
        warning: colors.semantic.warning,
        error: colors.semantic.error,
        info: colors.semantic.info,
      },

      // 폰트 패밀리
      fontFamily: {
        display: typography.fontFamily.display,
        body: typography.fontFamily.body,
        mono: typography.fontFamily.mono,
      },

      // 폰트 사이즈
      fontSize: typography.fontSize,

      // 보더 반경
      borderRadius: borders.radius,

      // 그림자
      boxShadow: shadows,

      // 스페이싱 (Tailwind 기본값 확장)
      spacing: {
        ...spacing,
      },

      // 트랜지션
      transitionDuration: transitions.duration,
      transitionTimingFunction: transitions.easing,

      // Z-Index
      zIndex: zIndex,

      // 스크린 브레이크포인트
      screens: breakpoints,

      // 애니메이션
      keyframes: {
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)', width: '30%' },
          '50%': { transform: 'translateX(200%)', width: '50%' },
          '100%': { transform: 'translateX(-100%)', width: '30%' },
        },
      },
      animation: {
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
      },
    },
  },

  plugins: [],
} as const;

export default minuPreset;
