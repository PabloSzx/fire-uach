import { NextPage } from "next";

import { useUser } from "../../components/Auth";

const ProfilePage: NextPage = ({}) => {
  const { user, loading } = useUser("profile");
  if (loading || !user) {
    return null;
  }

  return <div>profile {user.email}</div>;
};

export default ProfilePage;
