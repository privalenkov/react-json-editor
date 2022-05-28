import React, { useState, useEffect, useRef, useMemo } from 'react';
import ContextMenu from '../contextMenu/contextMenu';
import './jsonEditor.css';

const type = (value) => {
    const regex = /^\[object (\S+?)\]$/;
    const matches = Object.prototype.toString.call(value).match(regex) || [];
    return (matches[1] || 'undefined').toLowerCase();
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
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

function resizable (el, factor) {
    var int = Number(factor) || 7.7;
    function resize() {el.style.width = ((el.value.length+1) * int) + 'px'}
    var e = 'keyup,keypress,focus,blur,change'.split(',');
    for (var i in e) el.addEventListener(e[i],resize,false);
    resize();
}

export default function JsonEditor({jsonData, onChange, style}) {
    const [editorTree, setEditorTree] = useState([]);
    const [refMap, setRefMap] = useState(new Map());
    const jsonEditorRef = useRef();
    const liRef = useMemo(() => editorTree.map(() => React.createRef()), [editorTree.join(',')]);

    const depthCreator = (depth) => {
        return Array.from({ length: depth }, (_, i) => {
            return <td className='json-editor__depth' key={i}></td>;
        });
    }

    const jsonIterator = (data, cb) => {
        let depth = 0;
        let depthCurrentKey = {};
        (function iter (data, cb) {
            for (const key of Object.keys(data)) {
                const object = {
                    id: uuidv4(),
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

    

    const saveHandler = () => {
        onChange(jsonData);
    }
    const changeOptionHandler = (e, parentAttr, value) => {
        let ref = refMap.get(parentAttr);
            ref[parentAttr] = value;
    }

    useEffect(() => {
        jsonIterator(jsonData, (obj) => {
            setEditorTree(array => [...array, obj]);
        })
    }, [jsonData]);

    useEffect(() => {
        if(!liRef.length) return;
        liRef.forEach((ref, index) => {
            if(!ref.current) return;
            const inputs = ref.current.querySelectorAll('input');
            if (!inputs.length) return;
            inputs.forEach(input => resizable(input, 7));
        })
    }, [liRef]);

    const onClickDropdownHandler = (e) => {
        e.target.parentNode.classList.toggle('json-editor__dropdown-arrow--expanded');
        const depthAttr = e.target.parentNode.getAttribute('data-depth');
        if (!depthAttr) return;
        setEditorTree(array => array.map((obj) => {
            if ((obj.depth > Number(depthAttr))) {
                if (e.target.parentNode.classList.contains('json-editor__dropdown-arrow--expanded')) return {...obj, visible: false};
                else return {...obj, visible: true};
            }
            return obj;
        }));
    }

    const onChangeHandler = (keyOrValue, e) => {
        resizable(e.target, 7);
        setEditorTree((prevState) => prevState.map((obj) => {
            switch (keyOrValue) {
                case 'value':
                    if (obj.id === e.target.getAttribute('data-id')) {
                        return {...obj, value: e.target.value};
                    }
                    break;
            
                default:
                    if (obj.id === e.target.getAttribute('data-id')) {
                        return {...obj, key: e.target.value};
                    }
                    break;
            }
            return obj;
        }));
    }

    return (
        <>
            <ContextMenu changeOptionHandler={changeOptionHandler} elRef={jsonEditorRef} options={[{text: 'convert', list: [{text: 'to Array'}, {text: 'to Object'}, {text: 'to Number'}, {text: 'to Text'}, {text: 'to Boolean'}]}, {text: 'Remove'}, {text: 'Insert after'}]}/>
            <div id="json-editor" ref={jsonEditorRef} style={{...style}}>
                <header className='json-editor__header'>react-json-editor</header>
                {jsonData && <table>
                    <tbody>
                        <tr>
                            <td className='json-editor__line-num'></td>
                            <td className='json-editor__first-type-title-arrow'>▼</td>
                            <td className='json-editor__first-type-title'>root: {type(jsonData)}</td>
                        </tr>
                    </tbody>
                </table>}
                <div className="json-editor__json-editor-tree">
                    <table>
                        <tbody>
                            {editorTree && editorTree.map((obj, index) => {
                                // console.log(obj)
                                return <tr style={{'display': obj.visible ? 'table-row' : 'none'}} key={obj.id} className={`json-editor__row ${getClassByType(obj.type)} ${obj.children.length ? 'json-editor__row--expandable' : ''}`}>
                                    <td className='json-editor__line-num'>{index + 1}</td>
                                    <td data-depth={obj.depth} data-parent-id={obj.id} onClick={onClickDropdownHandler} className='json-editor__dropdown-arrow'><button disabled={!obj.children.length}>{obj.children.length ? '▼' : ''}</button></td>
                                    <td>
                                        <table className='json-editor__json-editor-value'>
                                            <tbody>
                                                <tr ref={liRef[index]} data-expandable-name={obj.parent.key}>
                                                    {depthCreator(obj.depth)}
                                                    <td><input data-id={obj.id} onChange={onChangeHandler.bind(this, 'key')} className={`json-editor__field-key ${obj.parent.type === 'array' ? 'json-editor__field-key--array' : ''}`} value={obj.key} /></td>
                                                    <td className='json-editor__separator'>{!obj.children.length ? ':' : ''}</td>
                                                    {
                                                        (obj.type === 'object' || obj.type === 'array')
                                                            ? <td><span className='json-editor__field-params-count-separator'>{ obj.type === 'object' ? '{' : '['}</span><span className='json-editor__field-params-count'>{obj.children.length}</span><span className='json-editor__field-params-count-separator'>{ obj.type === 'object' ? '}' : ']'}</span></td>
                                                            : <td><input data-id={obj.id} onChange={onChangeHandler.bind(this, 'value')} disabled={ obj.type === 'boolean' ? true : false} className={`json-editor__field-value ${getClassByType(obj.type)}`} value={obj.value} /></td>
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