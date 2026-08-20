'use client'

import { useState } from 'react'

interface RulesAccordionProps {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function RulesAccordion({ title, badge, defaultOpen = false, children }: RulesAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      style={{
        backgroundColor: '#16233F',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          width: '100%',
          padding: '16px 20px',
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: 700,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>
          {title}
          {badge && (
            <span
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(200,53,46,0.2)',
                color: '#ff8a7f',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 10,
                marginLeft: 8,
              }}
            >
              {badge}
            </span>
          )}
        </span>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)' }}>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, textAlign: 'left' }}>
          {children}
        </div>
      )}
    </div>
  )
}