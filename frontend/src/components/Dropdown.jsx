import { useState } from "react";

const Dropdown = ({children, options, onSelection, ...props}) => {

    const DropdownIcon = 
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
        />
    </svg>;


    return(
        <div className="flex flex-col gap-1">
        <label htmlFor={props.id}>{children}</label>
        
        <select onChange={(e) => onSelection(e)} {...props}>
            <option selected="selected">-</option>
            {options.map((option) => {
                return <option value={option}>{option}</option>
            })}
        </select>
        </div>
    )
};

export default Dropdown;