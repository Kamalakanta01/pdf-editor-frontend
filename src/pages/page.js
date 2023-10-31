import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Flex, Grid, Heading } from '@chakra-ui/react';
import axios from 'axios';
import { fromByteArray } from 'base64-js'
import { Spinner } from '@chakra-ui/react';
import { Buffer } from 'buffer'

function Pages() {
  const { id } = useParams();
  const [pdfPages, setPdfPages] = useState([]); // State to store the PDF pages
  const [selectedPages, setSelectedPages] = useState([]);
  const [result,setResult] = useState(null)

  const[load,setLoad] = useState(false)
  const[pageload,setPageload] = useState(false)
  function convert(array) {
    return array.map(uint8Array => {
      const base64String = fromByteArray(uint8Array);
      return base64String;
    });
  }

  useEffect(() => {
    // Define the URL to fetch the base64-encoded PDF pages
    const pdfPagesUrl = `https://pdf-editor-backend-kaj5.onrender.com/pdf/${id}`;

    // Use Axios to download the array of base64-encoded PDF pages
    setPageload(true)
    axios
      .get(pdfPagesUrl)
      .then((response) => {
        const pages = response.data.pages; // Assuming the response includes the base64-encoded pages
        setPdfPages(convert(pages));
        setPageload(false)
        console.log(convert(pages))
      })
      .catch((error) => {
        console.error('Error fetching PDF pages:', error);
      });
  }, [id]);

  function edit() {
    if (selectedPages.length > 0) {
      setLoad(true)
      const pages = { arr: selectedPages };
      axios.post(`https://pdf-editor-backend-kaj5.onrender.com/edit/${id}`, pages)
        .then((response) => {
          // Update the 'result' state with the response data
          console.log(response.data.buffer.data)
          const modifiedPdfBuffer = Buffer.from(response.data.buffer.data); // Assuming this is your PDF Buffer
          const b64 = fromByteArray(modifiedPdfBuffer);
          console.log(b64)
          setResult(b64);
          setLoad(false)
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      alert("No pages Selected");
    }
  }

  function downloadPdf(base64Data) {
    if (base64Data) {
      const binaryData = Buffer.from(base64Data, 'base64');
      const blob = new Blob([binaryData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'downloaded.pdf'; // Set the desired filename
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } else {
      alert("No PDF to download");
    }
  }

  const handlePageCheck = (index, checked) => {
    if (checked) {
      setSelectedPages([...selectedPages, index]);
    } else {
      const updatedSelectedPages = selectedPages.filter((page) => page !== index);
      setSelectedPages(updatedSelectedPages);
    }
  };

  return (
    <Box>
      <Flex mb={"1%"} justifyContent={"space-between"} alignItems={"center"}>
        <Button size={"md"} w={"20vw"} h={"3vw"} onClick={edit}>Download</Button><Heading size={"md"}>Order of Pages: {selectedPages.map((ele)=>{return ele+1+","})}</Heading>
      </Flex>
      {pageload && <Spinner color='black'/>}
      {!pageload && pdfPages && 
      <Grid templateColumns={["repeat(2, 1fr)","repeat(4, 1fr)"]} className="pdf-container">
        {pdfPages.length > 0 && pdfPages.map((base64String, index) => (
          <div key={index} style={{ position: 'relative' }}>
            <input
                  type="checkbox"
                  onChange={(e) => handlePageCheck(index, e.target.checked)}
                />
            <iframe
              src={`data:application/pdf;base64,${base64String}`}
              type="application/pdf"
              width="100%"
              height="300px" // Adjust the height as needed
            />
          </div>
        ))}
      </Grid>
      }
      <Box mt={"5%"}>
        {!load && result && <Heading mb={"3%"} size={"md"}>PDF Result ✅</Heading>}
        {
          load && (<div
            className="dimmer-overlay"
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Corrected background-color
              zIndex: 999, // Make sure it's above other content
              display: "flex",
              justifyContent: "center", // Corrected justify-content
              alignItems: "center"
            }}
          >
            <Spinner
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='xl'
            />
          </div>
          )
        }
        {
          !load && result && (
            <iframe
              src={`data:application/pdf;base64,${result}`}
              type="application/pdf"
              width="100%"
              height="600px"
              onError={(e) => {
                console.error("Error loading PDF:", e);
              }}
            />
            // <p>{result}</p>
          )
        }
      </Box>
    </Box>
  );
}

export default Pages;