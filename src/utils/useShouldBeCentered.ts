import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";

export const useShouldBeCentered = (n = 450) => {
  const { height } = useWindowSize();

  const [shouldBeCentered, setShouldBeCentered] = useState(false);

  useEffect(() => {
    setShouldBeCentered(height >= n);
  }, [height]);

  return shouldBeCentered;
};
