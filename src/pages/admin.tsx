import { NextPage } from "next";
import { FC } from "react";

import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";

const AdminDashboard: FC = () => {
  return null;
};

const AdminPage: NextPage = () => {
  const { loading } = useUser("/admin", true);

  if (loading) {
    return <LoadingPage />;
  }

  return <AdminDashboard />;
};

export default AdminPage;
