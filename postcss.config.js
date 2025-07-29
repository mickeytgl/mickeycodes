export default {
  plugins: {
    "@tailwindcss/postcss": {
      content: [
        './src/**/*.{html,md,liquid,erb,serb,slim}',
        './src/_components/**/*.{js,jsx,js.rb}',
        './frontend/javascript/**/*.js'
      ]
    },
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3
    }
  }
}
