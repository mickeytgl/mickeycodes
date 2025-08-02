import "$styles/index.css"
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import ruby from 'highlight.js/lib/languages/ruby';
import pgsql from 'highlight.js/lib/languages/pgsql';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('pgsql', pgsql);
hljs.highlightAll();

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('code').forEach((el) => {
        hljs.highlightElement(el);
    });
});

// Import all JavaScript & CSS files from src/_components
import components from "$components/**/*.{js,jsx,js.rb,css}"

