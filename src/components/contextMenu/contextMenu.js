import React, { useState, useEffect, useRef } from 'react';
import './contextMenu.css';

export default function ContextMenu({ changeOptionHandler, elRef, options}) {
    const [visible, setVisible] = useState(false);
    const ref = useRef();
    const [el] = useState(elRef);
    const [opts, setOpts] = useState(null);
    let targetEl = null;

    const handleContextMenu = (e) => {
        e.preventDefault();
        if(!ref.current) return;
        setVisible(true);
        targetEl = e.target.parentNode.parentNode;
        const clickX = e.clientX;
        const clickY = e.clientY;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const rootW = ref.current.offsetWidth;
        const rootH = ref.current.offsetHeight;
        
        const right = (screenW - clickX) > rootW;
        const left = !right;
        const top = (screenH - clickY) > rootH;
        const bottom = !top;
        
        if (right) {
            ref.current.style.left = `${clickX + 5}px`;
        }
        if (left) {
            ref.current.style.left = `${clickX - rootW - 5}px`;
        }
        if (top) {
            ref.current.style.top = `${clickY + 5}px`;
        }
        if (bottom) {
            ref.current.style.top = `${clickY - rootH - 5}px`;
        }
    };
    const changeVisibility = (e) => {
        const wasOutside = !ref.current.contains(e.target);
        setOpts((op) => {
            if (!wasOutside) {
                const id = e.target.getAttribute('data-id');
                return op.map((obj, i) => {
                    if (i === Number(id)) obj.visible = !obj.visible;
                    return obj;
                })
            }
        })
    }
    const onMouseEnterHandler = (e) => {
        changeVisibility(e);
    }

    const onMouseLeaveHandler = (e) => {
        changeVisibility(e);
    }
    const handleClick = (e) => {
        // const parentAttr = targetEl.getAttribute('data-expandable-name');
        // const value = e.target.innerText;
        // changeOptionHandler(e, parentAttr, value);
        const wasOutside = !ref.current.contains(e.target);
        setVisible(visible => (visible && wasOutside) && false);
    }

    useEffect(() => {
        if (!options.length) return;
        const newOpts = options.map((obj) => {
            if (obj?.list?.length) {
                obj.visible = false;
            }
            return obj;
        })
        setOpts(newOpts);       
    }, [])

    
    const handleScroll = (e) =>  setVisible(visible => visible && false);
    useEffect(() => {
        const elCurrent = el.current;
        const viewport = elCurrent.querySelector('.json-editor__json-editor-tree');
        elCurrent.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);
        viewport.addEventListener('scroll', handleScroll);
        return () => {
            elCurrent.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
            viewport.removeEventListener('scroll', handleScroll);
        }
    }, [el]);

    return (
        <div ref={ref} className="contextMenu" style={{display: visible ? 'block' : 'none'}}>
            {opts &&
                opts.map((obj, i) => {
                    return <div key={i}>
                        <div onMouseEnter={onMouseEnterHandler} data-id={i} className='contextMenu__option'>{obj.text}</div>
                        {(obj?.list?.length && obj.visible) && <div onMouseLeave={onMouseLeaveHandler} className='contextMenu__list'>
                            {obj.list.map((obj,j) => <div key={j} className='contextMenu__option'>{obj.text}</div>)}
                        </div>}
                    </div>
                })
            }
        </div>
    )
}