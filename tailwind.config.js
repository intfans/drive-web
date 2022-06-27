/* eslint-disable */
module.exports = {
  purge: {
    content: ['./src/**/*.tsx'],
    options: {
      safelist: ['dropdown-menu', 'dropdown-item', 'nav-item', 'nav-link', 'tab-content', 'tab-pane'],
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backdropInvert: {
        25: '25%',
        50: '50%',
        75: '75%',
      },
      brightness: {
        80: '.80',
      },
      dropShadow: {
        soft: '0 6px 12px rgba(0, 0, 0, 0.04)',
        tooltip: ['0px 12px 24px rgba(0,0,0,0.12)', '0px 0px 1px rgba(0,0,0,0.16)'],
      },
      opacity: {
        0: '0',
        1: '.01',
        2: '.02',
        3: '.03',
        4: '.04',
        5: '.05',
        6: '.06',
        7: '.07',
        8: '.08',
        9: '.09',
        10: '.1',
        15: '.15',
        20: '.2',
        25: '.25',
        30: '.3',
        35: '.35',
        40: '.4',
        45: '.45',
        50: '.5',
        55: '.55',
        60: '.6',
        65: '.65',
        70: '.7',
        75: '.75',
        80: '.8',
        85: '.85',
        90: '.9',
        95: '.95',
        100: '1',
      },
      rotate: {
        '10-': '-10deg',
        10: '10deg',
        20: '20deg',
        30: '30deg',
      },
      letterSpacing: {
        0.2: '0.2rem',
        0.3: '0.3rem',
        0.4: '0.4rem',
      },
      transitionProperty: {
        width: 'width',
      },
      transitionDuration: {
        50: '50ms',
        250: '250ms',
      },
      height: {
        footer: 'var(--footer-height)',
        fit: 'fit-content',
      },
      width: {
        sidenav: '210px',
        'sidenav-collapsed': '64px',
        activity: '296px',
        '0.5/12': '4.166667%',
      },
      margin: {
        '24px': '24px',
      },
      minWidth: {
        104: '26rem',
        activity: '296px',
      },
      padding: {
        '42px': '42px',
      },
      borderWidth: {
        3: '3px',
      },
      ringOpacity: (theme) => ({
        DEFAULT: '0.5',
        ...theme('opacity'),
      }),
      backgroundOpacity: (theme) => ({
        ...theme('opacity'),
      }),
      ringWidth: {
        DEFAULT: '3px',
        0: '0px',
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
        8: '8px',
      },
      borderRadius: {
        '1px': '1px',
        '2px': '2px',
        '4px': '4px',
        '6px': '6px',
        '12px': '12px',
        '1/2': '50%',
      },
      fontSize: {
        'supporting-1': ['0.5rem', { lineHeight: '0.625rem' }],
        'supporting-2': ['0.625rem', { lineHeight: '0.75rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '5xl-banner': ['3rem', { lineHeight: '0' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        50: '12.7rem',
        104: '26rem',
        112: '28rem',
        120: '30rem',
        156: '37.5rem',
      },
      scale: {
        0: '0',
        50: '.5',
        55: '.55',
        60: '.60',
        65: '.65',
        70: '.70',
        75: '.75',
        80: '.80',
        85: '.85',
        90: '.90',
        95: '.95',
        100: '1',
        105: '1.05',
        110: '1.1',
        125: '1.25',
        150: '1.5',
        200: '2',
        300: '3',
        400: '4',
        500: '5',
      },
      boxShadow: {
        b: '2px 1px 3px 0 rgba(0,0,0,0.1),2px 1px 2px 0 rgba(0,0,0,0.06)',
        'photo-select': '0px 12px 24px rgba(0, 0, 0, 0.16)',
        subtle: '0 32px 40px 0 rgba(18, 22, 25, 0.04)',
        'subtle-hard': '0 32px 40px 0 rgba(18, 22, 25, 0.08)',
      },
    },
    colors: {
      transparent: 'rgb(0,0,0,0)',
      transparentw: 'rgb(255,255,255,0)',
      current: 'currentColor',
      black: 'rgb(0,0,0)',
      'black-75': 'rgba(0,0,0,.75)',
      white: 'rgb(255,255,255)',
      // NEW DESIGN SYSTEM
      primary: 'rgb(0,102,255)',
      'primary-dark': 'rgb(0,88,219)',
      'red-std': 'rgb(255,13,0)',
      'red-dark': 'rgb(230,11,0)',
      orange: 'rgb(255,149,0)',
      'orange-dark': 'rgb(230,134,0)',
      yellow: 'rgb(255,204,0)',
      'yellow-dark': 'rgb(230,184,0)',
      green: 'rgb(50,195,86)',
      'green-dark': 'rgb(45,174,77)',
      pink: 'rgb(255,36,76)',
      'pink-dark': 'rgb(235,0,63)',
      indigo: 'rgb(81,78,212)',
      'indigo-dark': 'rgb(60,58,207)',
      teal: 'rgb(50,182,205)',
      'teal-dark': 'rgb(45,164,185)',
      mint: 'rgb(5,189,180)',
      'mint-dark': 'rgb(4,164,156)',
      gray: {
        1: 'rgb(249,249,252)',
        5: 'rgb(243,243,248)',
        10: 'rgb(229,229,235)',
        20: 'rgb(209,209,215)',
        30: 'rgb(199,199,205)',
        40: 'rgb(174,174,179)',
        50: 'rgb(142,142,148)',
        60: 'rgb(99,99,103)',
        70: 'rgb(72,72,75)',
        80: 'rgb(58,58,59)',
        90: 'rgb(44,44,48)',
        100: 'rgb(24,24,27)',
      },
      // OLD DESIGN SYSTEM
      'cool-gray': {
        5: 'rgb(249,250,252)',
        10: 'rgb(242,244,248)',
        20: 'rgb(221,225,230)',
        30: 'rgb(193,199,205)',
        40: 'rgb(162,169,176)',
        50: 'rgb(135,141,150)',
        60: 'rgb(105,112,119)',
        70: 'rgb(77,83,88)',
        80: 'rgb(52,58,63)',
        90: 'rgb(33,39,42)',
        100: 'rgb(18,22,25)',
      },
      blue: {
        10: 'rgb(237,245,255)',
        20: 'rgb(208,226,255)',
        30: 'rgb(166,200,255)',
        40: 'rgb(120,169,255)',
        50: 'rgb(69,137,255)',
        60: 'rgb(15,98,254)',
        70: 'rgb(0,67,206)',
        80: 'rgb(0,45,156)',
        90: 'rgb(0,29,108)',
        100: 'rgb(0,17,65)',
      },
      red: {
        10: 'rgb(255,241,241)',
        20: 'rgb(255,215,217)',
        30: 'rgb(255,179,184)',
        40: 'rgb(255,131,137)',
        50: 'rgb(250,77,86)',
        60: 'rgb(218,30,40)',
        70: 'rgb(162,25,31)',
        80: 'rgb(117,14,19)',
        90: 'rgb(82,4,8)',
        100: 'rgb(45,7,9)',
      },

      purple: {
        10: 'rgb(246,242,255)',
        20: 'rgb(232,218,255)',
        30: 'rgb(212,187,255)',
        40: 'rgb(190,149,255)',
        50: 'rgb(165,110,255)',
        60: 'rgb(138,63,252)',
        70: 'rgb(105,41,196)',
        80: 'rgb(73,29,139)',
        90: 'rgb(49,19,94)',
        100: 'rgb(28,15,48)',
      },
      cyan: {
        50: 'rgb(236,254,255)',
        100: 'rgb(207,250,254)',
        200: 'rgb(165,243,252)',
        300: 'rgb(103,232,249)',
        400: 'rgb(34,211,238)',
        500: 'rgb(6,182,212)',
        600: 'rgb(8,145,178)',
        700: 'rgb(14,116,144)',
        800: 'rgb(21,94,117)',
        900: 'rgb(22,78,99)',
      },
      fuchsia: {
        50: 'rgb(253,244,255)',
        100: 'rgb(250,232,255)',
        200: 'rgb(245,208,254)',
        300: 'rgb(240,171,252)',
        400: 'rgb(232,121,249)',
        500: 'rgb(217,70,239)',
        600: 'rgb(192,38,211)',
        700: 'rgb(162,28,175)',
        800: 'rgb(134,25,143)',
        900: 'rgb(112,26,117)',
      },
      neutral: {
        10: 'rgb(250,251,252)',
        20: 'rgb(244,245,247)',
        30: 'rgb(235,236,240)',
        40: 'rgb(223,225,230)',
        50: 'rgb(193,199,208)',
        60: 'rgb(179,186,197)',
        70: 'rgb(165,173,186)',
        80: 'rgb(151,160,175)',
        100: 'rgb(122,134,154)',
        200: 'rgb(107,119,140)',
        300: 'rgb(94,108,132)',
        400: 'rgb(80,95,121)',
        500: 'rgb(66,82,110)',
        600: 'rgb(52,69,99)',
        700: 'rgb(37,56,88)',
        800: 'rgb(23,43,77)',
        900: 'rgb(9,30,66)',
      },
    },
    transitionDuration: {
      DEFAULT: '150ms',
      0: '0ms',
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      250: '250ms',
      300: '300ms',
      350: '350ms',
      400: '400ms',
      450: '450ms',
      500: '500ms',
      550: '550ms',
      600: '600ms',
      650: '650ms',
      700: '700ms',
      750: '750ms',
      800: '800ms',
      850: '850ms',
      900: '900ms',
      950: '950ms',
      1000: '1000ms',
    },
  },
  variants: {
    extend: {
      scale: ['focus', 'active', 'hover'],
      translate: ['focus', 'active', 'hover'],
    },
    accessibility: ['responsive', 'focus-within', 'focus'],
    alignContent: ['responsive', 'group-hover'],
    alignItems: ['responsive', 'group-hover'],
    alignSelf: ['responsive', 'group-hover'],
    animation: ['responsive'],
    appearance: ['responsive'],
    backgroundAttachment: ['responsive', 'group-hover'],
    backgroundClip: ['responsive', 'group-hover'],
    backgroundColor: [
      'responsive',
      'dark',
      'group-hover',
      'focus-within',
      'focus-visible',
      'hover',
      'focus',
      'active',
      'disabled',
    ],
    backgroundImage: ['responsive', 'group-hover'],
    backgroundOpacity: [
      'responsive',
      'dark',
      'group-hover',
      'focus-within',
      'focus-visible',
      'hover',
      'active',
      'focus',
    ],
    backgroundPosition: ['responsive', 'group-hover'],
    backgroundRepeat: ['responsive', 'group-hover'],
    backgroundSize: ['responsive', 'group-hover'],
    borderCollapse: ['responsive', 'group-hover'],
    borderColor: [
      'responsive',
      'dark',
      'group-hover',
      'focus-within',
      'focus-visible',
      'hover',
      'focus',
      'active',
      'disabled',
    ],
    borderOpacity: ['responsive', 'dark', 'group-hover', 'focus-within', 'focus-visible', 'hover', 'focus'],
    borderRadius: ['responsive', 'group-hover'],
    borderStyle: ['responsive', 'group-hover'],
    borderWidth: ['responsive', 'group-hover'],
    boxShadow: ['responsive', 'group-hover', 'focus-within', 'hover', 'focus'],
    boxSizing: ['responsive', 'group-hover'],
    clear: ['responsive'],
    container: ['responsive'],
    cursor: ['responsive', 'group-hover'],
    display: ['responsive', 'group-hover'],
    divideColor: ['responsive', 'dark', 'group-hover'],
    divideOpacity: ['responsive', 'dark', 'group-hover'],
    divideStyle: ['responsive', 'group-hover'],
    divideWidth: ['responsive', 'group-hover'],
    fill: ['responsive', 'group-hover'],
    flex: ['responsive', 'group-hover'],
    flexDirection: ['responsive', 'group-hover'],
    flexGrow: ['responsive', 'group-hover'],
    flexShrink: ['responsive', 'group-hover'],
    flexWrap: ['responsive', 'group-hover'],
    float: ['responsive', 'group-hover'],
    fontFamily: ['responsive'],
    fontSize: ['responsive', 'group-hover', 'focus-visible'],
    fontSmoothing: ['responsive'],
    fontStyle: ['responsive', 'group-hover'],
    fontVariantNumeric: ['responsive'],
    fontWeight: ['responsive', 'group-hover', 'focus-visible'],
    gap: ['responsive', 'group-hover'],
    gradientColorStops: ['responsive', 'dark', 'hover', 'focus', 'group-hover'],
    gridAutoColumns: ['responsive', 'group-hover'],
    gridAutoFlow: ['responsive', 'group-hover'],
    gridAutoRows: ['responsive', 'group-hover'],
    gridColumn: ['responsive', 'group-hover'],
    gridColumnEnd: ['responsive', 'group-hover'],
    gridColumnStart: ['responsive', 'group-hover'],
    gridRow: ['responsive', 'group-hover'],
    gridRowEnd: ['responsive', 'group-hover'],
    gridRowStart: ['responsive', 'group-hover'],
    gridTemplateColumns: ['responsive', 'group-hover'],
    gridTemplateRows: ['responsive', 'group-hover'],
    height: ['responsive', 'group-hover', 'focus-visible'],
    inset: ['responsive', 'group-hover', 'focus-visible'],
    justifyContent: ['responsive', 'group-hover'],
    justifyItems: ['responsive', 'group-hover'],
    justifySelf: ['responsive', 'group-hover'],
    letterSpacing: ['responsive', 'group-hover'],
    lineHeight: ['responsive', 'group-hover'],
    listStylePosition: ['responsive', 'group-hover'],
    listStyleType: ['responsive', 'group-hover'],
    margin: ['responsive', 'group-hover', 'focus-visible'],
    maxHeight: ['responsive', 'group-hover', 'focus-visible'],
    maxWidth: ['responsive', 'group-hover', 'focus-visible'],
    minHeight: ['responsive', 'group-hover', 'focus-visible'],
    minWidth: ['responsive', 'group-hover', 'focus-visible'],
    objectFit: ['responsive', 'group-hover'],
    objectPosition: ['responsive', 'group-hover'],
    opacity: ['responsive', 'group-hover', 'focus-within', 'focus-visible', 'hover', 'focus', 'disabled'],
    order: ['responsive', 'group-hover'],
    outline: ['responsive', 'focus-within', 'focus-visible', 'focus', 'group-hover'],
    overflow: ['responsive', 'group-hover'],
    overscrollBehavior: ['responsive', 'group-hover'],
    padding: ['responsive', 'hover', 'active', 'focus', 'group-hover', 'focus-visible'],
    placeContent: ['responsive', 'group-hover'],
    placeItems: ['responsive', 'group-hover'],
    placeSelf: ['responsive', 'group-hover'],
    placeholderColor: ['responsive', 'dark', 'focus', 'group-hover', 'disabled'],
    placeholderOpacity: ['responsive', 'dark', 'focus', 'group-hover'],
    pointerEvents: ['responsive', 'group-hover'],
    position: ['responsive', 'group-hover'],
    resize: ['responsive', 'group-hover'],
    ringColor: ['responsive', 'dark', 'focus-within', 'focus-visible', 'focus', 'group-hover'],
    ringOffsetColor: ['responsive', 'dark', 'focus-within', 'focus-visible', 'focus', 'group-hover'],
    ringOffsetWidth: ['responsive', 'focus-within', 'focus-visible', 'focus', 'group-hover'],
    ringOpacity: ['responsive', 'dark', 'focus-within', 'focus-visible', 'focus', 'group-hover'],
    ringWidth: ['responsive', 'focus-within', 'focus-visible', 'focus', 'group-hover'],
    rotate: ['responsive', 'hover', 'focus', 'group-hover'],
    borderRadius: ['active'],
    scale: ['responsive', 'hover', 'focus', 'group-hover'],
    skew: ['responsive', 'hover', 'focus', 'group-hover'],
    space: ['responsive', 'group-hover'],
    stroke: ['responsive', 'group-hover'],
    strokeWidth: ['responsive', 'group-hover'],
    tableLayout: ['responsive', 'group-hover'],
    textAlign: ['responsive', 'group-hover'],
    textColor: ['responsive', 'dark', 'group-hover', 'focus-within', 'focus-visible', 'hover', 'focus', 'disabled'],
    textDecoration: ['responsive', 'group-hover', 'focus-within', 'focus-visible', 'hover', 'focus'],
    textOpacity: ['responsive', 'dark', 'group-hover', 'focus-within', 'focus-visible', 'hover', 'focus'],
    textOverflow: ['responsive', 'group-hover'],
    textTransform: ['responsive', 'group-hover', 'focus-visible'],
    transform: ['responsive', 'group-hover', 'focus-visible'],
    transformOrigin: ['responsive', 'group-hover'],
    transitionDelay: ['responsive', 'group-hover'],
    transitionDuration: ['responsive', 'group-hover'],
    transitionProperty: ['responsive', 'group-hover'],
    transitionTimingFunction: ['responsive', 'group-hover'],
    translate: ['responsive', 'hover', 'focus', 'group-hover', 'focus-visible'],
    userSelect: ['responsive', 'group-hover', 'focus-visible'],
    verticalAlign: ['responsive', 'group-hover'],
    visibility: ['responsive', 'group-hover'],
    whitespace: ['responsive', 'group-hover'],
    width: ['responsive', 'group-hover', 'focus-visible'],
    wordBreak: ['responsive', 'group-hover', 'focus-visible'],
    zIndex: ['responsive', 'focus-within', 'focus', 'group-hover', 'focus-visible'],
  },
  plugins: [
    function ({ addBase, theme }) {
      function extractColorVars(colorObj, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars =
            typeof value === 'string'
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    },
    require('@tailwindcss/line-clamp'),
  ],
};
