"use client";

import {
  PropsWithChildren,
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CONSTANTS } from "../config/constants";
import { transformHexToRgb } from "../helpers/transform";
import { verifyLuminance } from "../helpers/verify-luminance";
import { contrastChecker } from "../helpers/contrast-checker";

export interface Hex {
  [key: string]: string;
}

export const defaultContrast: Hex = {
  [CONSTANTS.ID.TEXT]: CONSTANTS.COLORS.TEXT,
  [CONSTANTS.ID.BACKGROUND]: CONSTANTS.COLORS.BACKGROUND,
};

interface ContrastProviderProps {
  values: Hex;
  result?: number;
  setValues?: (values: Hex) => void;
}

const ContrastContext = createContext<ContrastProviderProps>({
  values: defaultContrast,
});

export const ContrastProvider = ({
  values,
  children,
}: PropsWithChildren<ContrastProviderProps>) => {
  const [state, setState] = useState(values);
  const [contrast, setContrast] = useState(0);

  useEffect(() => {
    setValuesHandler(values);
  }, [values]);

  const setValuesHandler = (values: Hex) => {
    const textColorRGB = transformHexToRgb(values[CONSTANTS.ID.TEXT]);
    const backgroundColorRGB = transformHexToRgb(
      values[CONSTANTS.ID.BACKGROUND]
    );

    const textLuminance = verifyLuminance(
      textColorRGB?.r ?? 0,
      textColorRGB?.g ?? 0,
      textColorRGB?.b ?? 0
    );
    const bgLuminance = verifyLuminance(
      backgroundColorRGB?.r ?? 0,
      backgroundColorRGB?.g ?? 0,
      backgroundColorRGB?.b ?? 0
    );

    setContrast(
      contrastChecker({ firstColor: textLuminance, secondColor: bgLuminance })
    );
    setState(values);
  };

  const _values = useMemo(
    () => ({
      values: state,
      result: contrast,
      setValues: setValuesHandler,
    }),
    [state, contrast]
  );

  return (
    <ContrastContext.Provider value={_values}>
      {children}
    </ContrastContext.Provider>
  );
};

export default ContrastContext;
