import { shuffle } from "lodash";
import { createContext, FC, useMemo } from "react";

import { useQuery } from "@apollo/react-hooks";

import { CATEGORIES_OPTIONS } from "../graphql/queries";

export const CategoriesContext = createContext<
  {
    _id: string;
    name: string;
  }[]
>([]);

export const CategoriesContextContainer: FC = ({ children }) => {
  const { data: dataCategories } = useQuery(CATEGORIES_OPTIONS);

  const shuffledCategories = useMemo(() => {
    return shuffle(dataCategories?.categories);
  }, [dataCategories]);
  return (
    <CategoriesContext.Provider value={shuffledCategories}>
      {children}
    </CategoriesContext.Provider>
  );
};
