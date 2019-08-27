import qs from 'query-string'

const LS_KEYS = {
  ACCESS_TOKEN: 'spotifyToken',
  REFRESH_TOKEN: 'spotifyRefreshToken',
  ACCESS_TOKEN_EXPIRES: 'spotifyTokenExpiration'
}

export const login = (url) => {
  return new Promise((resolve, reject) => {
    const popup = window.open(url, '_blank', 'width=500,height=500,location=0,resizable=0')
    const listener = setInterval(() => {
      if (popup) {
        popup.postMessage('login', window.location)
      } else {
        if (checkToken()) {
          resolve()
          window.onmessage = null
        }
      }
    }, 1000)

    window.onmessage = event => {
      const { accessToken, refreshToken, expiration } = qs.parse(event.data)
      storeToken(accessToken, refreshToken, expiration)
      clearInterval(listener)
      window.onmessage = null
      return resolve(accessToken)
    }
  })
}

export const logout = () => {
  console.info('Logging out...')
  localStorage.removeItem(LS_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(LS_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(LS_KEYS.ACCESS_TOKEN_EXPIRES)
  window.location.reload()
}

export const refreshToken = (callback) => {
  console.info('Refreshing token...')
  api(process.env.REACT_APP_SERVER_URL + '/refresh-token', { data: { accessToken: getAccessToken(), refreshToken: getRefreshToken() }, method: 'POST' })
    .then(data => {
      if (data.error === 'NoRefreshToken') {
        logout()
      } else {
        storeToken(data.accessToken)
        callback(data.accessToken)
      }
    })
}

export const storeToken = (accessToken, refreshToken = getRefreshToken(), expiration = 3600) => {
  console.info('Storing tokens...')
  localStorage.setItem(LS_KEYS.ACCESS_TOKEN, accessToken)
  localStorage.setItem(LS_KEYS.REFRESH_TOKEN, refreshToken)
  localStorage.setItem(LS_KEYS.ACCESS_TOKEN_EXPIRES, new Date().getTime() + expiration * 1000)
}

export const getAccessToken = () => {
  return localStorage.getItem(LS_KEYS.ACCESS_TOKEN)
}

export const getRefreshToken = () => {
  return localStorage.getItem(LS_KEYS.REFRESH_TOKEN)
}

export const checkToken = () => {//TODO
  const token = localStorage.getItem(LS_KEYS.ACCESS_TOKEN)
  const expiration = localStorage.getItem(LS_KEYS.ACCESS_TOKEN_EXPIRES)

  if (!token || !expiration) {
    return false
  }

  const timeNow = new Date().getTime()
  const expired = expiration - timeNow < 1000 * 60 * 5
  if (expired) {
    return false
  }

  return true
}

export const api = async (uri, { data = {}, method = 'GET' } = {}) => {
  const response = await fetch(uri, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded' //Fucking CORS
    },
    body: Object.entries(data).length === 0 ? null : qs.stringify(data)
  })
  const json = await response.json()
  console.log('api', json)
  return json
}
