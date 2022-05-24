import React, { useState, useEffect, useRef } from 'react';
import './contextMenu.css';

export default function ContextMenu({ elRef, options}) {
    const [visible, setVisible] = useState(false);
    const ref = useRef();
    const [el] = useState(elRef);

    const handleContextMenu = (e) => {
        e.preventDefault();
        if(!ref.current) return;
        setVisible(true);
        
        console.log(e.target)
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
    const handleClick = (e) => {
        const wasOutside = !ref.current.contains(e.target);
        setVisible(visible => (visible && wasOutside) && false);
    }

    
    const handleScroll = (e) =>  setVisible(visible => visible && false);
    useEffect(() => {
        const elCurrent = el.current;
        const viewport = elCurrent.querySelector('.json-editor__json-editor-tree');
        elCurrent.addEventListener('contextmenu', handleContextMenu);
        elCurrent.addEventListener('click', handleClick);
        viewport.addEventListener('scroll', handleScroll);
        return () => {
            elCurrent.removeEventListener('contextmenu', handleContextMenu);
            elCurrent.removeEventListener('click', handleClick);
            viewport.removeEventListener('scroll', handleScroll);
        }
    }, [el]);

    return (
        <div ref={ref} className="contextMenu" style={{display: visible ? 'block' : 'none'}}>
            {options &&
                options.map((option, i) => <div key={i} className="contextMenu__option">{option.text}</div>)
            }
        </div>
    )
}