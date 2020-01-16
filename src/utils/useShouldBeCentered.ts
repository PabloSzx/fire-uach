import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";

export const useShouldBeCentered = (nHeight = 300, nWidth = 300) => {
  const { height, width } = useWindowSize();

  const [shouldBeCentered, setShouldBeCentered] = useState(false);

  useEffect(() => {
    setShouldBeCentered(height >= nHeight && width >= nWidth);
  }, [height]);

  return shouldBeCentered;
};
