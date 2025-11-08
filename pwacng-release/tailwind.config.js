// TODO @TW:
// Node path should be committed, but it makes preset dev impossible.
// Local path is the only way to develop "tailwind.preset.js".
const venia = require('@magento/pwa-theme-venia');
// const venia = require('../pwa-theme-venia');

const config = {
    mode: 'jit',
    // Include your custom theme here.
    presets: [venia],
    // Configure how Tailwind statically analyzes your code here.
    // Note that the Tailwind's `jit` mode doesn't actually use PurgeCSS.
    content: {
        files: [
            './node_modules/@magento/venia-ui/lib/**/*.module.css',
            '../venia-ui/lib/**/*.module.css',
            './src/**/*.module.css',
            './src/**/*.module.scss',
            './template.html'
        ],
        // Extract Tailwind classnames from source files.
        // Our default matcher only matches targets of CSS Modules' `composes`,
        // not classnames included directly in HTML or JS!
        extract: {
            css: content => content.match(matcher) || []
        }
    },
    // Set the character Tailwind uses when prefixing classnames with variants.
    // CSS Modules doesn't like Tailwind's default `:`, so we use `_`.
    separator: '_',
    theme: {
        extend: {
            screens: {
                md: '769px',
                '-md': {
                    max: '768px'
                },
            },
            maxWidth: {
                site: '1482px'
            },
            fontFamily: {
                roboto: ['"Roboto"', "sans-serif"]
            },
            fontSize: {
                base: ['14px', '1.42857']
            },
            zIndex: {
                'dialog': 61, // Đặt giá trị z-index mới cho .z-dialog
                'menu': 20, // Đặt giá trị z-index mới cho .z-menu
            }
        }
    }
};

module.exports = config;

/**
 * Matches declarations that contain tailwind classnames.
 * Only classnames matched by this expression will be included in the build.
 *
 * @example
 * .foo {
 *   composes: mx-auto from global;
 * }
 */
const matcher = /(?<=composes:.*)(\S+)(?=.*from global;)/g;
