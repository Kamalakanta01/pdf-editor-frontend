import React, { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom"
import { Box, Progress } from "@chakra-ui/react";
import './main.css'

const Main = () => {

  const nav = useNavigate();
  const [load,setLoad]=useState(false)
  const handleFileUpload = (event) => {
    setLoad(true)
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("pdfFile", file); // Use "pdfFile" as the field name
    axios
      .post("https://pdf-editor-backend.vercel.app/pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response);
        nav(`/pages/${response.data.pdfId}`)
        setLoad(false)
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // render a simple input element with an onChange event listener that calls the handleFileUpload function
  return (
    <Box alignItems={"center"}>
      <input type="file" accept=".pdf" name="pdfFile" onChange={handleFileUpload} />
      {load && <Progress size='xs' isIndeterminate/>}
    </Box>
  );
};
export default Main;