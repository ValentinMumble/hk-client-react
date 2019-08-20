import qs from 'query-string'

const LS_KEYS = {
  ACCESS_TOKEN: 'spotifyToken',
  REFRESH_TOKEN: 'spotifyRefreshToken',
  ACCESS_TOKEN_EXPIRES: 'spotifyTokenExpiration',
  USERNAME: 'spotifyUsername'
}
const REDIRECT_URI = window.location.origin + window.location.pathname + 'callback/'

export const LOGIN_URL = `https://accounts.spotify.com/authorize/?client_id=${process.env.REACT_APP_SPO_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=${encodeURIComponent(process.env.REACT_APP_SPO_SCOPE)}`

export const login = () => {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      LOGIN_URL,
      '_blank',
      'width=500,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=0,resizable=0,left=0,top=0'
    )

    const listener = setInterval(() => {
      if (popup) {
        popup.postMessage('login', window.location)
      } else {
        if (checkToken()) {
          resolve()
          window.onmessage = null
        } else {
          console.log('tokkkken expired')
        }
      }
    }, 1000)

    window.onmessage = event => {
      const { accessToken, refreshToken, expiration } = JSON.parse(event.data)
      storeToken(accessToken, refreshToken, expiration)
      clearInterval(listener)
      window.onmessage = null
      return resolve(accessToken)
    }
  })
}

export const logout = () => {
  localStorage.removeItem(LS_KEYS.USERNAME)
  localStorage.removeItem(LS_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(LS_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(LS_KEYS.ACCESS_TOKEN_EXPIRES)
}

export const refreshToken = (callback) => {
  console.log('Refreshing token...')
  const refreshToken = localStorage.getItem(LS_KEYS.REFRESH_TOKEN)
  post(process.env.REACT_APP_SPO_API, { refreshToken: refreshToken }, (data) => {
    storeToken(data.accessToken, data.refreshToken, data.expiration)
    callback(data.accessToken)
  })
}

export const storeToken = (accessToken, refreshToken, expiration = 3600) => {
  localStorage.setItem(LS_KEYS.ACCESS_TOKEN, accessToken)
  localStorage.setItem(LS_KEYS.REFRESH_TOKEN, refreshToken)
  localStorage.setItem(
    LS_KEYS.ACCESS_TOKEN_EXPIRES,
    new Date().getTime() + expiration * 1000
  )
}

export const getToken = () => {
  const token = localStorage.getItem(LS_KEYS.ACCESS_TOKEN)
  return token
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
    console.log('expiiiiired')
    return false
  }

  return true
}

export const post = async (uri, options = {}, handler = function (data) { console.log(data) }) => {
  try {
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded' //Fucking CORS
      },
      body: qs.stringify(options)
    });
    const wait = await response.json();
    return handler(wait);
  }
  catch (error) {
    return console.log(error);
  }
}