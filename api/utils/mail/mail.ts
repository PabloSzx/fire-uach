import { requireEnv } from "require-env-variable";

const { OFFICE365_USERNAME, DOMAIN } = requireEnv(
  "DOMAIN",
  "OFFICE365_USERNAME"
);

export const UnlockMail = ({
  email,
  unlockKey,
}: {
  email: string;
  unlockKey: string;
}): string => {
  const link = `${DOMAIN}/unlock/${email}/${unlockKey}`;

  return `
  <div>
      <h2>FireSeS e-ncendio</h2>
      <br />
      <h4>
      ¿Ha perdido su contraseña?
      </h4>
      <br />
      <p>
        Haga click${" "}
        <b>
          <a href=${link}>aquí</a>
        </b>${" "}
        para ingresar una contraseña nueva y recuperar su cuenta
      </p>
      <br />
      <p>
        O abra este link en su navegador: ${"   "}
        <b>${link}</b>
      </p>
      <br />
      <p>
        Si tiene algún problema o alguna pregunta, puede contactarnos al correo${" "}
        ${OFFICE365_USERNAME}
      </p>
    </div>
  `;
};
