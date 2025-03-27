"use client"
import React from 'react'
import { Provider } from 'react-redux'
import store from './stores'
const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
        <Provider store={store}>{children}</Provider>
    </div>
  )
}

export default ReduxProvider