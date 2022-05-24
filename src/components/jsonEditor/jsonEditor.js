import React, { useState, useEffect, useRef } from 'react';
import ContextMenu from '../contextMenu/contextMenu';
import './jsonEditor.css';

export default function JsonEditor({jsonFile}) {
    const [editorTree, setEditorTree] = useState([]);
    const ref = useRef();
    
    const data = jsonFile;

    const type = (value) => {
        const regex = /^\[object (\S+?)\]$/;
        const matches = Object.prototype.toString.call(value).match(regex) || [];
        return (matches[1] || 'undefined').toLowerCase();
    }

    const insideCounter = (currentValue, type) => {
        switch (type) {
            case 'object':
                return Object.keys(currentValue).length;;
            case 'array':
                return currentValue.length;
            default:
                return null;
        }
    }

    const depthElCreator = (depth) => {
        return Array.from({ length: depth }, (_, i) => {
            return <td className='json-editor__depth' key={i}></td>;
        });
    }

    const jsonIterator = (data, cb) => {
        let depth = 0;
        let depthCurrentKey = [];
        (function iter (data, cb) {
            for (let key in data) {
                const object = {
                    key,
                    value: String(data[key]),
                    type: type(data[key]),
                    paramsInside: insideCounter(data[key], type(data[key])),
                    parent: depthCurrentKey.length ? depthCurrentKey : [],
                    depth,
                };
                cb.apply(this, [object]);  
                if (data[key] !== null && typeof(data[key]) === 'object') {
                    depthCurrentKey = [key, type(data[key])];
                    depth++;
                    iter(data[key], cb);
                }
            }
            depthCurrentKey = [];
            depth--;
        })(data, cb)
    }

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

    useEffect(() => {
        jsonIterator(data, (obj) => {
            setEditorTree(array => [...array, obj]);
        })
    }, []);

    const onClickDropdownHandler = (e) => {
        console.log(e)
    }

    return (
        <>
            <ContextMenu elRef={ref} options={[{text: 'True'}, {text: 'False'}]}/>
            <div id="json-editor" ref={ref}>
                <header className='json-editor__header'>React-json-editor</header>
                <div className="json-editor__json-editor-tree">
                    <table>
                        <tbody>
                            {editorTree && editorTree.map((obj, index) => {
                            return <tr key={index} className={getClassByType(obj.type)}>
                                    <td className='json-editor__line-num'>{index + 1}</td>
                                    <td onClick={onClickDropdownHandler} className='json-editor__dropdown-arrow'>{obj.paramsInside && '▼'}</td>
                                    <td>
                                        <table className='json-editor__json-editor-value'>
                                            <tbody>
                                                <tr>
                                                    {depthElCreator(obj.depth)}
                                                    <td><div className={`json-editor__field-key ${obj.parent[1] === 'array' && 'json-editor__field-key--array'}`}>{obj.key}</div></td>
                                                    <td className='json-editor__separator'>{!obj.paramsInside && ':'}</td>
                                                    {
                                                        (obj.type === 'object' || obj.type === 'array')
                                                            ? <td><span className='json-editor__field-params-count-separator'>{ obj.type === 'object' ? '{' : '['}</span><span className='json-editor__field-params-count'>{obj.paramsInside}</span><span className='json-editor__field-params-count-separator'>{ obj.type === 'object' ? '}' : ']'}</span></td>
                                                            : <td><div className={`json-editor__field-value ${getClassByType(obj.type)}`}>{obj.value}</div></td>
                                                    }
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
        </>
    );
};