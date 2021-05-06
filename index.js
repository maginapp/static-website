
/*
https://github.com/lovell/sharp
https://blog.lcddjm.com/sharp-documents-cn/
https://sharp.pixelplumbing.com/
*/

const { formatImg } = require('./src/utils/img')

let envImgType = process.env.imgType || ''
envImgType = envImgType.trim()

const params = {
  dir: './src/images-wait-sharp',
  newDir: './dist/images/images-wait-sharp',
  dirType: '/**/*',
  formatType: 'webp',
  quality: 80,
  copyImg: true
}

formatImg(params)
