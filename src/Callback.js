import React from 'react'
import './index.css'
import qs from 'query-string'
import { storeToken, post } from './auth'

export default () => {
  const parsed = qs.parse(window.location.search)

  post(process.env.REACT_APP_SPO_API, { code: parsed.code, redirectUri: window.location.origin + window.location.pathname }, (data) => {
    const { accessToken, refreshToken, expiration } = data
    window.addEventListener('message', event => {
      var message = event.data
      if (message === 'login') {
        event.source.postMessage(
          JSON.stringify({
            accessToken,
            refreshToken,
            expiration
          }),
          event.origin
        )
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
