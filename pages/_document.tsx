import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=ZCOOL+XiaoWei&family=Noto+Serif+SC:wght@400;600&family=Noto+Sans+SC:wght@300;400;500&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/style.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 