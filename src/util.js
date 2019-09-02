import qs from 'query-string'

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

export const fetchImage = (url, callback) => {
  let downloadedImg = new Image()
  downloadedImg.crossOrigin = 'Anonymous'
  downloadedImg.src = url
  downloadedImg.addEventListener('load', () => {
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    canvas.width = downloadedImg.width
    canvas.height = downloadedImg.height
    context.drawImage(downloadedImg, 0, 0)
    callback(canvas.toDataURL('image/png'))
  })
}
