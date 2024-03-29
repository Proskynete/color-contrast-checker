import { PropsWithChildren } from "react";
import { Footer } from "./components/footer";
import { Header } from "./components/header";

const PrincipalLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-screen h-screen grid grid-rows-[auto,1fr,auto] overflow-x-hidden">
      <Header />

      <main className="w-full lg:w-4/5 max-w-4xl mx-auto px-10 flex flex-col gap-2 my-5 xl:mt-40">
        <div className="flex flex-col gap-2">{children}</div>
      </main>

      <Footer />
    </div>
  );
};

export { PrincipalLayout };
