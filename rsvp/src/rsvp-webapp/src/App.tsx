import RSVPForm from "./components/RSVPForm";
import { AbsoluteCenter, Flex } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Only one route that captures the invite ID */}
          <Route path=':inviteId' element={
            <Flex
              width="100vw"
              height="100vh"
              alignContent={"center"}
              justifyContent={"center"}
            >
              <AbsoluteCenter>
                <RSVPForm></RSVPForm>
              </AbsoluteCenter>
            </Flex>
            } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
