import React from 'react'
export default ({height='1em', width='1em', className='logo-primary'})=>(
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={width} height={height}
        viewBox="0 0 500 500"
    >
        <defs>
            <clipPath id="a">
                <path d="M0 0h500v500H0z"/>
            </clipPath>
        </defs>
        <g 
            clip-path="url(#a)" 
            className={className}
        >
            <path 
                d="M132.197 163.794l58.967-15.29 78.648 303.313-58.966 15.29z"
            />
            <path 
                d="M132.232 151.306c0-59.33 48.169-107.5 107.5-107.5s107.5 48.17 107.5 107.5c0 59.331-48.169 107.5-107.5 107.5s-107.5-48.169-107.5-107.5zm61.906-3.797c0-24.56 19.94-44.5 44.5-44.5s44.5 19.94 44.5 44.5-19.94 44.5-44.5 44.5-44.5-19.94-44.5-44.5z" fillRule="evenodd"
            />
            <path 
                d="M147.44 317h184.707v40.447H147.44z"
            />
        </g>
    </svg>

)