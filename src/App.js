import './App.css';
import JsonEditor from './components/jsonEditor/jsonEditor';
import jsonFile from './payload/data.json';

function App() {
  const jsonEditorHandler = (jsonFile) => {

  };
  return (
    <div className="App">
      <div className='container'>
        <JsonEditor onSave={jsonEditorHandler} jsonFile={jsonFile} />
      </div>
    </div>
  );  
}

export default App;
