'use client'
import React from 'react'

interface CustomBtnProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
}

export default function CustomBtn({ text, onClick, disabled }: CustomBtnProps) {
  return (
    <div>
      <button className="btn btn-primary" onClick={onClick} disabled={disabled}>{text}</button>
    </div>
  )
}