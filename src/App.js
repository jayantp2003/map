import React from 'react'
import GoogleMap from './component/GM2.js'
import { APIProvider } from '@vis.gl/react-google-maps'

export default function App() {
  return (
    <>
      <APIProvider apiKey={'AIzaSyA-YR1-sS6nUptgWbWTWgEeuzwNdmY6NSg'} libraries={['places']} >
        <GoogleMap />
      </APIProvider>
    </>
  )
}
