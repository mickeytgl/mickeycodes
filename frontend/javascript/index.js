import "$styles/index.css"
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import ruby from 'highlight.js/lib/languages/ruby';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('ruby', ruby);
hljs.highlightAll();

// Import all JavaScript & CSS files from src/_components
import components from "$components/**/*.{js,jsx,js.rb,css}"

