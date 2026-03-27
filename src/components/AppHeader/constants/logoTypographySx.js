export const LOGO_TYPOGRAPHY_SX = {
  gridArea: 'logo',
  position: 'relative',
  display: 'inline-block',
  textDecoration: 'none',
  fontWeight: 700,
  fontFamily: '\'TagType\', \'Bahnschrift\', \'Roboto Condensed\', \'Arial Narrow\', sans-serif',
  fontSize: '2.5rem',
  lineHeight: 0.98,
  letterSpacing: '0.04em',
  fontStyle: 'italic',
  transform: 'skew(-7deg) rotate(-0.5deg)',
  color: '#5dff7a',
  textShadow: '0 1px 0 rgba(0, 0, 0, 0.85)',
  animation: 'logoCoreBurst 6.5s infinite steps(1, end)',
  '&::before, &::after': {
    content: 'attr(data-text)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    pointerEvents: 'none',
    opacity: 0.28,
  },
  '&::before': {
    color: '#88ff9d',
    transform: 'translate(1px, 0)',
    clipPath: 'polygon(0 0, 100% 0, 100% 13%, 0 13%, 0 24%, 100% 24%, 100% 37%, 0 37%, 0 49%, 100% 49%, 100% 59%, 0 59%)',
    animation: 'logoGlitchTop 6.5s infinite steps(1, end)',
  },
  '&::after': {
    color: '#15a83f',
    transform: 'translate(-1px, 0)',
    clipPath: 'polygon(0 62%, 100% 62%, 100% 73%, 0 73%, 0 83%, 100% 83%, 100% 91%, 0 91%, 0 100%, 100% 100%)',
    animation: 'logoGlitchBottom 6.5s infinite steps(1, end)',
  },
  '@keyframes logoCoreBurst': {
    '0%, 93%, 100%': {
      transform: 'skew(-7deg) rotate(-0.5deg)',
      filter: 'none',
    },
    '94%': {
      transform: 'skew(-9deg) rotate(-0.8deg) translateX(-1px)',
      filter: 'contrast(1.2)',
    },
    '95%': {
      transform: 'skew(-5deg) rotate(0deg) translateX(1px)',
      filter: 'contrast(1.35)',
    },
    '96%': {
      transform: 'skew(-7deg) rotate(-0.5deg)',
      filter: 'none',
    },
  },
  '@keyframes logoGlitchTop': {
    '0%, 93%, 100%': {
      transform: 'translate(1px, 0)',
      opacity: 0.28,
    },
    '94%': {
      transform: 'translate(-6px, -2px)',
      opacity: 0.55,
    },
    '95%': {
      transform: 'translate(5px, 2px)',
      opacity: 0.48,
    },
    '96%': {
      transform: 'translate(-2px, 1px)',
      opacity: 0.4,
    },
    '97%': {
      transform: 'translate(1px, 0)',
      opacity: 0.28,
    },
  },
  '@keyframes logoGlitchBottom': {
    '0%, 93%, 100%': {
      transform: 'translate(-1px, 0)',
      opacity: 0.28,
    },
    '94%': {
      transform: 'translate(6px, 2px)',
      opacity: 0.55,
    },
    '95%': {
      transform: 'translate(-5px, -2px)',
      opacity: 0.48,
    },
    '96%': {
      transform: 'translate(2px, -1px)',
      opacity: 0.4,
    },
    '97%': {
      transform: 'translate(-1px, 0)',
      opacity: 0.28,
    },
  },
}
