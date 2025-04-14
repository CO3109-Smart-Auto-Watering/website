export const defaultTheme = {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
        dark: '#115293',
        light: '#4791db'
      },
      secondary: {
        main: '#9c27b0',
        dark: '#7b1fa2',
        light: '#ba68c8'
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828'
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100'
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b'
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20'
      },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        disabled: 'rgba(0, 0, 0, 0.38)'
      },
      background: {
        paper: '#fff',
        default: '#f5f5f5'
      },
      action: {
        active: 'rgba(0, 0, 0, 0.54)',
        hover: 'rgba(0, 0, 0, 0.04)',
        selected: 'rgba(0, 0, 0, 0.08)',
        disabled: 'rgba(0, 0, 0, 0.26)',
        disabledBackground: 'rgba(0, 0, 0, 0.12)'
      },
      divider: 'rgba(0, 0, 0, 0.12)'
    }
  };
  
  export const createSafeTheme = (theme) => {
    // Provide a helper function to safely get theme values with fallbacks
    return theme || defaultTheme;
  };