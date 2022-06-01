module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary:'#16222A',
        secondary: '#3A6073',
        fainted: 'rgb(0,0,0,0.8)'

      },
      maxWidth:{
        '2/5' : '40%',
        '1/2': '50%'
   
      },
      maxHeight:{
        '5/6': '83.333333%'
      },
      width:{
        '1000': '1000px'
      },
      fontFamily: {
        'main': "font-family: 'Merriweather Sans', sans-serif;"
      },
      screens:{
        'md': {'min': '1000px'}
      }
    },
  },
  plugins: [],
}
