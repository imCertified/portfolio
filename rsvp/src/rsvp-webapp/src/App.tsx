import RSVPForm from "./components/RSVPForm";
import { Center, Flex } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path=':inviteId' element={
            <Flex
              width={"100vw"}
              height={"100vh"}
              alignContent={"center"}
              justifyContent={"center"}
            >
              <Center>
                <RSVPForm></RSVPForm>
              </Center>
            </Flex>
            } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
