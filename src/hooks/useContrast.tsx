"use client";

import { useContext } from "react";
import ContrastContext from "../contexts/contrast";

const useContrast = () => useContext(ContrastContext);

export { useContrast };
