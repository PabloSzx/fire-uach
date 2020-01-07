import "react-toastify/dist/ReactToastify.min.css";

import ApolloClient from "apollo-client";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import { ToastContainer } from "react-toastify";

import { ApolloProvider } from "@apollo/react-hooks";
import { Box, theme, ThemeProvider } from "@chakra-ui/core";

import { Navigation } from "../components/Navigation";
import { withApollo } from "../utils/withApollo";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

class MyApp extends App<{ apollo: ApolloClient<any> }> {
  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Head>
          <title>FireSeS</title>
        </Head>

        <ThemeProvider theme={theme}>
          <Box pos="relative" height="100%">
            <Box overflowY="auto" height="100%" m={1} pb="50px">
              <Component {...pageProps} />
            </Box>
            <Navigation />
          </Box>
          <ToastContainer autoClose={10000} />
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
