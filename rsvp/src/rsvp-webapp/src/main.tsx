import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from "./App.tsx";

// Add a comfortable theme for colors
const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bg: "#0f1827",
        color: '#92b4d7'
      },

    }),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
