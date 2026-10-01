import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>FootballGPT — Ask anything about football</title>
                <meta
                    name="description"
                    content="FootballGPT answers your football questions using live data from Wikipedia, FIFA and the biggest football sites."
                />
                <meta name="theme-color" content="#020617" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
