import React, { useState, useEffect } from 'react';
import './App.css';
import JsonEditor from './components/jsonEditor/jsonEditor';
// import json from './payload/data.json';

function App() {
  const [json, setJson] = useState([{
    "name": "a",
    "email": null,
    "password": 123,
    "password2": true,
    "errors": {
        "name": "",
        "email": [
            "email", 
            {
                "message": "email",
                "path": "email",
                "type": "email",
                "context": {
                    "value": "email",
                    "key": "email"
                },
                "name": "email",
                "rule": "email",
                "scope": "email",
                "messages": ["email"],
                "code": "EMAIL",
                "isJoi": true
            }
        ],
        "password": "",
        "password2": ""
    }
    
}, 
{
  "name": "a",
  "email": null,
  "password": 123,
  "password2": true,
  "errors": {
      "name": "",
      "email": [
          "email", 
          {
              "message": "email",
              "path": "email",
              "type": "email",
              "context": {
                  "value": "email",
                  "key": "email"
              },
              "name": "email",
              "rule": "email",
              "scope": "email",
              "messages": ["email"],
              "code": "EMAIL",
              "isJoi": true
          }
      ],
      "password": "",
      "password2": ""
  }
  
}]);
  const jsonEditorHandler = (jsonFile) => {
    console.log(jsonFile)
  };

  useState(() => {
    setJson(json);
  }, [json])


  return (
    <div className="App">
      <div className='container'>
    
        <JsonEditor onSave={jsonEditorHandler} jsonFile={json} style={{'borderRadius': '35px'}}/>
      </div>
    </div>
  );  
}

export default App;
