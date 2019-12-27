import ApolloClient from "apollo-client";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";

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
          <title>Fire SES</title>
        </Head>

        <ThemeProvider theme={theme}>
          <Navigation />
          <Box pos="relative" pb="70px">
            <Component {...pageProps} />
          </Box>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
