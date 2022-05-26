import React, { useState, useEffect, useRef } from 'react';
import ContextMenu from '../contextMenu/contextMenu';
import './jsonEditor.css';

export default function JsonEditor({jsonFile, onSave, style}) {
    const [editorTree, setEditorTree] = useState([]);
    const ref = useRef();
    const [data, setData] = useState(jsonFile);
    const [refMap, setRefMap] = useState(new Map());

    const type = (value) => {
        const regex = /^\[object (\S+?)\]$/;
        const matches = Object.prototype.toString.call(value).match(regex) || [];
        return (matches[1] || 'undefined').toLowerCase();
    }

    const insideCounter = (currentValue, type) => {
        switch (type) {
            case 'object':
                return Object.keys(currentValue);
            case 'array':
                return currentValue;
            default:
                return [];
        }
    }

    const depthElCreator = (depth) => {
        return Array.from({ length: depth }, (_, i) => {
            return <td className='json-editor__depth' key={i}></td>;
        });
    }

    const jsonIterator = (data, cb) => {
        let depth = 0;
        let depthCurrentKey = {};
        // let depthKeyList = [];
        (function iter (data, cb) {
            for (const key of Object.keys(data)) {
                const object = {
                    key,
                    value: (data[key] === null || type(data[key]) !== 'object') ? String(data[key]) : '',
                    type: type(data[key]),
                    children: insideCounter(data[key], type(data[key])),
                    parent: depthCurrentKey,
                    depth,
                    visible: true
                };
                cb.apply(this, [object]);  
                if (data[key] !== null && typeof(data[key]) === 'object') {
                    setRefMap((prevState) => prevState.set(key, data[key]));
                    depthCurrentKey = {key, type: type(data[key])};
                    depth++;
                    iter(data[depthCurrentKey.key], cb);
                }
            }
            depthCurrentKey = {};
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
                return '';
        }
    }

    const saveHandler = () => {
        // jsonFile['name'] = 'asaasasasa';
        onSave(jsonFile);
    }
    const changeOptionHandler = (e, parentAttr, value) => {
        // jsonFile['name'] = 'asaasasasa';
        // console.log(refMap)
        let ref = refMap.get(parentAttr);
            ref[parentAttr] = value;
    }

    useEffect(() => {
        jsonIterator(data, (obj) => {
            // if(obj.key === obj.parent.key) {
            // }
            
            setEditorTree(array => [...array, obj]);
        })
    }, []);

    const onClickDropdownHandler = (e) => {
        // const current = ref.current;
        // saveHandler();
        e.target.parentNode.classList.toggle('json-editor__dropdown-arrow--expanded');
        const depthAttr = e.target.parentNode.getAttribute('data-depth');
        const parentAttr = e.target.parentNode.getAttribute('data-parent');
        // const aa = editorTree.find((obj) => obj.key === parentAttr);
        if (!parentAttr || !depthAttr) return;
        setEditorTree(array => array.map((obj) => {
            if ((obj.depth > Number(depthAttr)) && (obj.parent.key === parentAttr)) {
                if (e.target.parentNode.classList.contains('json-editor__dropdown-arrow--expanded')) return {...obj, visible: false};
                else return {...obj, visible: true};
            } else if ((obj.depth > Number(depthAttr)) && (obj.parent.key !== parentAttr)){
                if (e.target.parentNode.classList.contains('json-editor__dropdown-arrow--expanded')) return {...obj, visible: false};
                else return {...obj, visible: true};
            }
            // if (obj.depth === Number(depthAttr) && parentAttr === obj.parent.key) {
            //     return {...obj, visible: !obj.visible};
            // } else 
            return obj;
            // ((obj.depth === depthAttr && parentAttr === obj.parent.key) || (obj.depth > depthAttr)) ? {...obj, visible: !obj.visible} : obj)
        }));
        // ref[parentAttr] = value;
        // const expandablesValues = current.querySelectorAll('.json-editor__json-editor-value');
        // console.log(e.target.parentNode);
        // expandablesValues.forEach(elValue => {
            // const valueAttr = elValue.getAttribute('data-expadable-parent');
            // if(parentAttr === valueAttr) {
                // const obj = editorTree.find((obj) => parentAttr === obj.key);
            // const children = editorTree.find((_, i) => i === Number(parentAttr)).children;
            // console.log(children)
            // let answer = editorTree.filter(item => {
            //     if(children.includes(item.parent.key)) return item
            // })
            // console.log(answer)
            // console.log(children)
            // console.log(answer)
                // elValue.parentNode.parentNode.classList.toggle('collapsed');
            // }
        // });
    }

    return (
        <>
            <ContextMenu changeOptionHandler={changeOptionHandler} elRef={ref} options={[{text: 'convert', list: [{text: 'to Array'}, {text: 'to Object'}, {text: 'to Number'}, {text: 'to Text'}, {text: 'to Boolean'}]}, {text: 'Remove'}, {text: 'Insert after'}]}/>
            <div id="json-editor" ref={ref} style={{...style}}>
                <header className='json-editor__header'>react-json-editor</header>
                {data && <table>
                    <tbody>
                        <tr>
                            <td className='json-editor__line-num'></td>
                            <td className='json-editor__first-type-title-arrow'>▼</td>
                            <td className='json-editor__first-type-title'>root: {type(data)}</td>
                        </tr>
                    </tbody>
                </table>}
                <div className="json-editor__json-editor-tree">
                    <table>
                        <tbody>
                            {editorTree && editorTree.map((obj, index) => {
                                // console.log(obj)
                                return <tr style={{'display': obj.visible ? 'table-row' : 'none'}} key={index} className={`json-editor__row ${getClassByType(obj.type)} ${obj.children.length ? 'json-editor__row--expandable' : ''}`}>
                                    <td className='json-editor__line-num'>{index + 1}</td>
                                    <td data-depth={obj.depth} data-parent={(obj.type === 'object' || obj.type === 'array') ? obj.key : obj.parent.key} onClick={onClickDropdownHandler} className='json-editor__dropdown-arrow'><button disabled={!obj.children.length}>{obj.children.length ? '▼' : ''}</button></td>
                                    <td>
                                        <table className='json-editor__json-editor-value'>
                                            <tbody>
                                                <tr data-expandable-name={obj.parent.key}>
                                                    {depthElCreator(obj.depth)}
                                                    <td><div className={`json-editor__field-key ${obj.parent.type === 'array' ? 'json-editor__field-key--array' : ''}`}>{obj.key}</div></td>
                                                    <td className='json-editor__separator'>{!obj.children.length ? ':' : ''}</td>
                                                    {
                                                        (obj.type === 'object' || obj.type === 'array')
                                                            ? <td><span className='json-editor__field-params-count-separator'>{ obj.type === 'object' ? '{' : '['}</span><span className='json-editor__field-params-count'>{obj.children.length}</span><span className='json-editor__field-params-count-separator'>{ obj.type === 'object' ? '}' : ']'}</span></td>
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