import React, { useState, useEffect } from 'react';
import './jsonEditor.css';

export default function JsonEditor({jsonFile}) {
    const data = jsonFile;
    const [editorTree, setEditorTree] = useState([]);

    const type = (value) => {
        const regex = /^\[object (\S+?)\]$/;
        const matches = Object.prototype.toString.call(value).match(regex) || [];
        return (matches[1] || 'undefined').toLowerCase();
      }

    const jsonIterator = (data, cb) => {
        for (let i in data) {
            cb.apply(this, [i, String(data[i]), type(data[i])]);  
            if (data[i] !== null && typeof(data[i])=="object") {
                jsonIterator(data[i], cb);
            }
        }
    }

    useEffect(() => {
        jsonIterator(data, (key, value, type) => {
            setEditorTree(array => [...array, {key, value, type}]);
        })
    }, []);

    const getClassByType = (type) => {
        switch (type) {
            case 'boolean':
                return 'json-editor-tree__row--type-boolean';

            case 'string':
                return 'json-editor-tree__row--type-string';

            case 'number':
                return 'json-editor-tree__row--type-number';

            case 'null':
                return 'json-editor-tree__row--type-string';
            default:
                return null;
        }
    }

    return (
        <div id="json-editor">
            <header className='json-editor__header'>React-json-editor</header>
            <div className="json-editor__json-editor-tree">
                <table>
                    <tbody>
                        {editorTree && editorTree.map((obj, index) => {
                            console.log(obj.type, obj.value)
                           return <tr className={getClassByType(obj.type)}>
                                <td className='json-editor__line-num'>{index}</td>
                                <td className='json-editor__dropdown-arrow'>{(obj.type === 'object' || obj.type === 'array') && '▼'}</td>
                                <td>
                                    <table key={index} className='json-editor__json-editor-value'>
                                        <tbody>
                                            <tr>
                                                <td><div contentEditable="true" className='json-editor__field-key'>{obj.key}</div></td>
                                                <td className='json-editor__separator'>:</td>
                                                <td><div contentEditable="true" className={`json-editor__field-value ${getClassByType(obj.type)}`}>{obj.value}</div></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};