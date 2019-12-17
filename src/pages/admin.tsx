import { NextPage } from "next";
import dynamic from "next/dynamic";
import { FC } from "react";
import { useRememberState } from "use-remember-state";

import {
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/core";

import { useUser } from "../components/Auth";
import { LoadingPage } from "../components/LoadingPage";

const Images = dynamic(() => import("../components/admin/images"));
const Categories = dynamic(() => import("../components/admin/categories"));
const Tags = dynamic(() => import("../components/admin/tags"));

const AdminDashboard: FC = () => {
  const [index, setIndex] = useRememberState("admin_menu_index", 0);

  return (
    <Stack justify="center" align="center" mb="70px">
      <Tabs
        variant="soft-rounded"
        index={index}
        onChange={index => {
          setIndex(index);
        }}
      >
        <TabList justifyContent="center">
          <Tab>Imágenes</Tab>
          <Tab>Categorías</Tab>
          <Tab>Tags</Tab>
        </TabList>
        <TabPanels>
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
