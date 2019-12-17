import { FC } from "react";

export const FakeHref: FC<{ href: string }> = ({ href, children }) => {
  return (
    <a href={href} onClick={ev => ev.preventDefault()}>
      {children}
    </a>
  );
};
