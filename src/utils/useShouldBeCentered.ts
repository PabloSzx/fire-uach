import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";

export const useShouldBeCentered = (nHeight = 300, nWidth = 300) => {
  const { height, width } = useWindowSize();

  const [shouldBeCentered, setShouldBeCentered] = useState(false);

  useEffect(() => {
    setShouldBeCentered(
      (() => {
        if (height < 900 && width < 900) {
          // if small size window
          if (width > height) {
            //if landscape on a small size window, it should not be centered
            return false;
          }
        }

        return height >= nHeight && width >= nWidth;
      })()
    );
  }, [height, width]);

  return shouldBeCentered;
};
