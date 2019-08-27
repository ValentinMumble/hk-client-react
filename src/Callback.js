import React from 'react'
import './index.css'
import qs from 'query-string'
import { storeToken, api } from './auth'

export default () => {
  const parsed = qs.parse(window.location.search)

  api(`${process.env.REACT_APP_SERVER_URL}/access-token/${parsed.code}`).then(data => {
    const { accessToken, refreshToken, expiration } = data
    window.addEventListener('message', event => {
      if (event.data === 'login') {
        event.source.postMessage(qs.stringify({ accessToken, refreshToken, expiration }), event.origin)
        window.close()
      }
    })
    window.setTimeout(() => {
      storeToken(accessToken, refreshToken, expiration)
      window.close()
    }, 1500)
  })

  return <div>Logging in...</div>
}
