/* eslint-disable react-hooks/exhaustive-deps */
import './App.css';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { productMapping } from './products';
import * as XLSX from 'xlsx';

function App() {
  let composition = {};
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        // setData();
        processExcel(reader.result);
      };

      reader.readAsBinaryString(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const processExcel = (d) => {
    const wb = XLSX.read(d, { type: 'binary' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    /* Convert array of arrays */
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    data.map((d, index) => {
      if (index > 0) {
        trackPrdtComposition(d[0], d[1]);
      }
      return [];
    });
    writeToExcel();
  };

  const trackPrdtComposition = (prdtName) => {
    const formattedPrdtName = prdtName.replace(/\s/g, '_').toLowerCase();
    productMapping[formattedPrdtName].map((compItem) => {
      if (composition.hasOwnProperty(compItem.name)) {
        composition[compItem.name].push({
          product: formattedPrdtName,
          quantity: compItem.qty,
        });
      } else {
        composition[compItem.name] = [
          {
            product: formattedPrdtName,
            quantity: compItem.qty,
          },
        ];
      }
      return [];
    });
  };

  const writeToExcel = () => {
    const builder = jsonToSheetBuilder();
    const ws = XLSX.utils.json_to_sheet(builder, {
      header: ['A', 'B', 'C'],
      skipHeader: true,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doughman Comp Breakdown');
    XLSX.writeFile(wb, 'test.xlsx');
  };

  const jsonToSheetBuilder = () => {
    const compKeys = Object.keys(composition);
    let sheetArr = [{ A: 'Comp Item', B: 'Quantity Used', C: 'Break Down' }];
    compKeys.forEach((cKey) => {
      const sheetObj = {
        A: cKey,
        B: composition[cKey]
          .map((comp) => comp.quantity)
          .reduce((acc, val) => acc + val),
        C: composition[cKey]
          .map((comp) => `${comp.product}(${comp.quantity}) `)
          .join(' '),
      };
      sheetArr.push(sheetObj);
    });
    return sheetArr;
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <div>
          <h4>DOUGHMAN UTILS</h4>
          <p style={{ cursor: 'pointer' }}>Click to select SAMPLE_XLSX_FILE</p>
        </div>
      )}
    </div>
  );
}

export default App;
