import { PropsWithChildren } from "react";
import { Footer } from "./components/footer";
import { Header } from "./components/header";

const PrincipalLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-screen h-screen grid grid-rows-[auto,1fr,auto]">
      <Header />

      <main className="w-full lg:w-4/5 max-w-4xl mx-auto px-10 flex flex-col gap-2">
        <hgroup className="flex flex-col my-5 xl:mt-20">
          <h1 className="text-5xl xl:text-4xl font-bold text-center">
            Color Contrast Checker
          </h1>

          <h2 className="text-center text-gray-500">
            Check the contrast ratio between text and background colors
          </h2>
        </hgroup>

        {children}
      </main>

      <Footer />
    </div>
  );
};

export { PrincipalLayout };
