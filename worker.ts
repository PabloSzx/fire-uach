import ms from "ms";
import Shell from "shelljs";

const gitRemoteUrl = "git://github.com/PabloSzx/fire-uach";

const branch = "master";

console.log("Worker started!");

const gitRemoteStatus = () => {
  const { code, stdout } = Shell.exec(
    `git ls-remote --refs --exit-code ${gitRemoteUrl} ${branch}`,
    {
      silent: true,
    }
  );

  return {
    code,
    stdout,
  };
};

const gitRemoteOld = gitRemoteStatus();

const gitPolling = setInterval(async () => {
  const gitRemoteNew = gitRemoteStatus();
  if (gitRemoteNew.code === 0 && gitRemoteNew.stdout !== gitRemoteOld.stdout) {
    // If there is a change in the remote repository, fetch it and reset the local repository to it's head
    clearInterval(gitPolling);
    Shell.exec("git fetch");
    Shell.exec("git reset --hard origin/master");
    Shell.exec("yarn --frozen-lockfile --production=false && yarn build");
    Shell.exec("pm2 reload ecosystem.yaml", { async: true });
  }
}, ms("30 seconds"));
