import { PropsWithChildren, createContext, useState } from "react";
import { CONSTANTS } from "../config/constants";

export interface Hex {
  [key: string]: string;
}

export const defaultContrast: Hex = {
  [CONSTANTS.ID.TEXT]: CONSTANTS.COLORS.TEXT,
  [CONSTANTS.ID.BACKGROUND]: CONSTANTS.COLORS.BACKGROUND,
};

interface ContrastProviderProps {
  values: Hex;
  setValues?: (values: Hex) => void;
}

const ContrastContext = createContext<ContrastProviderProps>({
  values: defaultContrast,
});

export const ContrastProvider = ({
  children,
  values,
}: PropsWithChildren<ContrastProviderProps>) => {
  const [state, setState] = useState(values);

  const setValuesHandler = (values: Hex) => {
    setState(values);
  };

  return (
    <ContrastContext.Provider
      value={{ values: state, setValues: setValuesHandler }}
    >
      {children}
    </ContrastContext.Provider>
  );
};

export default ContrastContext;
