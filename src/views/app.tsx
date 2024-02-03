import { FormSection } from "./sections/form";
import { ResultSection } from "./sections/result";
import { PrincipalLayout } from "../layout";

const App = () => {
  return (
    <PrincipalLayout>
      <FormSection />
      <ResultSection />
    </PrincipalLayout>
  );
};

export { App };
