import { createGlobalStyle } from 'styled-components';

export const ResetCSS = createGlobalStyle`
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, button, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
    }

    *, *:before, *:after {
        box-sizing:border-box;
    }

    blockquote, q { quotes: none;}

    blockquote:before, blockquote:after,
    q:before, q:after {
        content: '';
        content: none;
    }

    table {
        border-collapse: collapse;
        border-spacing: 0;
    }

    ul, ol {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    h1,h2,h3,h4,h5,h6 {
      font-size: 16px;
      font-weight: 400;
      max-width: 100%;
    }

    a {
      color:inherit;
      text-decoration:none;
    }

    img {
      display: inline-block;
      max-width: 100%;
      vertical-align: middle;
    }
`;
