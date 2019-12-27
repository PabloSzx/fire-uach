import { NextPage } from "next";
import dynamic from "next/dynamic";
import { FC } from "react";
import { useRememberState } from "use-remember-state";

import {
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/core";

import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";
import { Logout } from "../components/Logout";

const Users = dynamic(() => import("../components/admin/users"));
const Images = dynamic(() => import("../components/admin/images"));
const Categories = dynamic(() => import("../components/admin/categories"));
const Tags = dynamic(() => import("../components/admin/tags"));

const AdminDashboard: FC = () => {
  const [index, setIndex] = useRememberState("admin_menu_index", 0);

  return (
    <Stack pt="2em" pl={1} pr={1} justify="center" align="center" mb="70px">
      <Tabs
        variant="soft-rounded"
        index={index}
        onChange={index => {
          setIndex(index);
        }}
      >
        <TabList justifyContent="center" wrap="wrap">
          <Tab m={1}>Usuarios</Tab>
          <Tab m={1}>Imágenes</Tab>
          <Tab m={1}>Categorías</Tab>
          <Tab m={1}>Etiquetas</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Users />
          </TabPanel>
          <TabPanel>
            <Images />
          </TabPanel>
          <TabPanel>
            <Categories />
          </TabPanel>
          <TabPanel>
            <Tags />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Logout />
    </Stack>
  );
};

const AdminPage: NextPage = () => {
  const { loading } = useUser("/admin", true);

  if (loading) {
    return <LoadingPage />;
  }

  return <AdminDashboard />;
};

export default AdminPage;
