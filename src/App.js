import React from 'react'
import GoogleMap from './component/GM2.js'
import { APIProvider } from '@vis.gl/react-google-maps'

export default function App() {
  return (
    <>
      <APIProvider apiKey={'api-key'} libraries={['places']} >
        <GoogleMap />
      </APIProvider>
    </>
  )
}
