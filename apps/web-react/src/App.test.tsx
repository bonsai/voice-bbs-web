import { render, screen } from 'react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('React PoC', () => {
  it('renders the lobby', () => {
    render(<App />)
    expect(screen.getByText('声の部屋')).toBeTruthy()
    expect(screen.getByText('テスト雑談部屋')).toBeTruthy()
  })
})
