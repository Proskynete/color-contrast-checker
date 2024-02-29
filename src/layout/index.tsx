import { PropsWithChildren } from "react";
import { Footer } from "./components/footer";
import { Header } from "./components/header";

const PrincipalLayout = ({ children }: PropsWithChildren) => {
  return (
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
  );
};

export { PrincipalLayout };
