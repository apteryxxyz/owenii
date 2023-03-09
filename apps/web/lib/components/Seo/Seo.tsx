import Head from 'next/head';

export function Seo(props: Seo.Props) {
    return <Head>
        {/* Basic */}
        <title>{`${props.title} | Qwaroo`}</title>
        <meta name="theme-color" content="#3884f8" />

        {/* Third party */}
        <meta name="darkreader-lock" />
        <meta name="robots" content={props.noIndex ? 'noindex' : 'index'} />

        {/* Branding */}
        <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png?v=2"
        />
        <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png?v=2"
        />
        <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png?v=2"
        />
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="manifest" href="/site.webmanifest" />

        {props.children}
    </Head>;
}

export namespace Seo {
    export interface Props {
        title: string;
        noIndex?: boolean;
        children?: React.ReactNode | React.ReactNode[];
    }
}
