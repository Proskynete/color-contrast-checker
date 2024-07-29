import type { Metadata } from "next";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  title: "Color Contrast Checker",
  description:
    "Application that allows you to contrast two colors to know whether it complies with accessibility",
  keywords: "color, contrast, checker, accessibility, a11y",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="../assets/images/favicon.svg"
        />
        <link rel="canonical" href="https://c3.eduardoalvarez.dev" />

        <meta name="title" content="Color Contrast Checker" />

        <meta name="author" content="Eduardo Álvarez Castañeda" />
        <meta name="application-name" content="Color Contrast Checker" />

        <meta name="image" content="/color-contrast-checker.webp" />

        <meta property="og:url" content="https://c3.eduardoalvarez.dev" />
        <meta property="og:title" content="Color Contrast Checker" />
        <meta
          property="og:description"
          content="Application that allows you to contrast two colors to know whether it complies with accessibility"
        />
        <meta
          property="og:image"
          content="../assets/images/color-contrast-checker.webp"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://c3.eduardoalvarez.dev" />
        <meta property="twitter:title" content="Color Contrast Checker" />
        <meta
          property="twitter:description"
          content="Application that allows you to contrast two colors to know whether it complies with accessibility"
        />
        <meta
          property="twitter:image"
          content="../assets/images/color-contrast-checker.webp"
        />
      </head>

      <body>
        <div className="w-screen h-screen grid grid-rows-[auto,1fr,auto] overflow-x-hidden">
          <Header />

          <main className="w-full max-w-4xl flex flex-col gap-2 mx-auto px-10 mt-8 mb-24 lg:w-4/5 md:mb-0 md:mt-20">
            <hgroup className="flex flex-col my-5">
              <h1 className="text-4xl font-bold text-center">
                Color Contrast Checker
              </h1>

              <h2 className="text-center text-gray-500">
                Check the contrast ratio between text and background colors
              </h2>
            </hgroup>

            <div className="flex flex-col gap-2">{children}</div>
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
