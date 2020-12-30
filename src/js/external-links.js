const shell = require('electron').shell;

const externalLinks = document.querySelectorAll('[data-link]');

externalLinks.forEach(externalLink => {
    externalLink.addEventListener('click', () => {
        const link = externalLink.getAttribute('data-link');
        shell.openExternal(link);
    });
});