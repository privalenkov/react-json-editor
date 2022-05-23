import './App.css';
import JsonEditor from './components/jsonEditor/jsonEditor';
import jsonFile from './payload/data.json';

function App() {
  return (
    <div className="App">
      <div className='container'>
        <JsonEditor jsonFile={jsonFile} />
      </div>
    </div>
  );
}

export default App;
