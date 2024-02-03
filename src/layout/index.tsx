import { PropsWithChildren } from "react";
import { Footer } from "./components/footer";
import { Header } from "./components/header";

const PrincipalLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-screen h-screen flex flex-col justify-between">
      <Header />

      <main className="w-2/3 lg:w-4/5 max-w-4xl mx-auto flex flex-col gap-5">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export { PrincipalLayout };
