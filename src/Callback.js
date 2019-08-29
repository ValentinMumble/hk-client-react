import React from 'react'
import './index.css'
import qs from 'query-string'
import { api } from './App'

export default () => {
  const parsed = qs.parse(window.location.search)

  api(`${process.env.REACT_APP_SERVER_URL}/spotify/authorize/${parsed.code}`).then(data => {
    window.addEventListener('message', event => {
      if (event.data === 'login') {
        event.source.postMessage(JSON.stringify(data.accessToken), event.origin)
        window.close()
      }
    })
    window.setTimeout(() => {
      window.close()
    }, 1500)
  })

  return <div>Logging in...</div>
}
