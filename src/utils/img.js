const fs = require('fs')
const sharp = require('sharp')
const glob = require('glob')
const path = require('path')

const getImagasMap = async (basePath, newBasePath, fileType, formType) => {
  const imagesOrigin = glob.sync(basePath + fileType)
  await new Promise((resolve) => {
    fs.stat(newBasePath, (err => {
      if (err) {
        fs.mkdir(newBasePath, (err) => {
          resolve()
        })
      } else {
        resolve()
      }
    }))
  })
  return new Promise((resolve) => {
    let list = [], count = 0
    imagesOrigin.map(imgPath => {
      let newPath = imgPath.replace(basePath, newBasePath)
      fs.stat(imgPath, (err, stat) => {
        if (stat.isDirectory()) {
          fs.stat(newPath, (err => {
            if (err) {
              fs.mkdir(newPath, (err) => {
                if (err) console.log(err)
                if (!err) count++
                judegEnd()
              })
            } else {
              count++
              judegEnd()
            }
          }))
        } else {
          count++
          if (formType) {
            const list =  newPath.split('.')
            const type = list[list.length - 1]
            newPath = newPath.replace(new RegExp('\\.' + type + '$'), '.' + formType)
          }
          list.push({
            o: imgPath,
            n: newPath
          })
          judegEnd()
        }
      })
    })
    const judegEnd = () => {
      if (count === imagesOrigin.length) {
        resolve(list)
      }
    }
  })
}

const solveImg = (images, quality = 70, copyImg) => {
  images.forEach(map => {
    const imgPath = map.o
    const newPath = map.n
    const list =  newPath.split('.')
    const type = list[list.length - 1]
    const listOld =  imgPath.split('.')
    const typeOld = listOld[listOld.length - 1]
    let promise = sharp(imgPath)
    if (['jpeg', 'jpg'].includes(type)) {
      promise = promise.jpeg({ quality, chromaSubsampling: '4:4:4' })
    }
    if (['png'].includes(type)) {
      promise = promise[type]({ quality, compressionLevel: 9, palette: true })
    }
    if (['webp', 'tiff'].includes(type)) {
      promise = promise[type]({ quality })
    }
    if (typeOld !== type) {
      promise = promise.toFile(newPath).then((data) => {})
    } else {
      promise = promise.toBuffer()
      .then( data => {
        fs.stat(imgPath, (err, stat) => {
          if (stat.size < data.length) {
            let readStream = fs.createReadStream(imgPath)
            let writeStream = fs.createWriteStream(newPath)
            readStream.pipe(writeStream)
          } else {
            fs.writeFile(newPath, data, () =>{})
          }
        })
        // console.log(data)
      })
    }
    promise
      .catch( err => { 
        console.log(err, map)
      })
      .finally(() => {
        deleteImg(map.o, '' , copyImg)
      })
  })
}

const copyBase = './copy'

const deleteImg = async (oldPath, newPath, copyImg) => {
  if (!newPath) newPath = path.join(copyBase, oldPath)
  if (copyImg) {
    const data = fs.readFileSync(oldPath)
    await checkoutPath(newPath)
    fs.writeFileSync(newPath, data)
  }
  fs.unlinkSync(oldPath)

  // return new Promise((resolve, reject) => {
  //   fs.readFile(oldPath, function(err, originBuffer){            //读取图片位置（路径）

  //     fs.writeFile(newPath,originBuffer, function(err){      //生成图片2(把buffer写入到图片文件)
  //       if (err) {
  //         console.log(err)
  //         reject(err)
  //       }
  //       if (deleteImg) {
  //         fs.unlinkSync(oldPath)
  //       } else {
  //         resolve(true)
  //       }
  //     })
  
  //     // var base64Img = originBuffer.toString("base64")                //base64 图片编码
  //     // var decodeImg = new Buffer(base64Img,"base64")                  //new Buffer(string, encoding)
  //     // fs.writeFile(newPath, decodeImg, function(err){        // 生成图片3(把base64位图片编码写入到图片文件)
  //     //   if (err) {
  //     //     console.log(err)
  //     //   }
  //     // })
  //   })
  // })
}

const checkoutPath = async (file) => {
  const filePath = path.normalize(file)
  return new Promise(resolve => {
    fs.stat(filePath, async (err) => {
      if (err) {
        const arr = filePath.split(path.sep)
        let i = 0
        while(i < arr.length - 1) {
          // arr.length - 1 对应具体文件不创建
          let index = i + 1
          await createDir((arr.slice(0, index)).join(path.sep))
          i++
        }
        await createFile(filePath)
        resolve(true)
      } else {
        resolve(true)
      }
    })
  })
}

const createDir = (filePath) => {
  return new Promise(resolve => {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        fs.mkdir(filePath, (err) => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  })
}

const createFile = (filePath) => {
  return new Promise(resolve => {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        fs.writeFile(filePath, '', (err) => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  })
}


/**
 * 
 * @param {Sting} params.dir
 * @param {Sting} params.newDir
 * @param {Sting} params.dirType
 * @param {Sting} params.formatType
 * @param {Number} params.quality
 * @param {Boolean} params.copyImg
 */
const formatImg = ( {dir, newDir, dirType, formatType, quality, copyImg} ) => {
  getImagasMap(dir, newDir, dirType, formatType).then((images) => {
    return solveImg(images, quality, copyImg)
  })
}

module.exports = {
  deleteImg,
  getImagasMap,
  solveImg,
  formatImg
}