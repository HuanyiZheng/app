const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const APPID = 'xx'
const APPSECRET = 'xx'
const QUESTION_PAGE = 'pages/question/question'

async function getAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
  const res = await axios.get(url)

  if (!res.data.access_token) {
    throw new Error(`获取access_token失败: ${JSON.stringify(res.data)}`)
  }

  return res.data.access_token
}

async function generateMiniCode(accessToken, qid) {
  const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`

  const payload = {
    scene: `qid=${qid}`,
    page: QUESTION_PAGE,
    env_version: 'trial',
    width: 430
  }

  const res = await axios.post(url, payload, {
    responseType: 'arraybuffer'
  })

  const contentType = res.headers['content-type'] || ''

  if (contentType.includes('application/json')) {
    const text = Buffer.from(res.data).toString('utf8')
    throw new Error(`生成 ${qid} 失败: ${text}`)
  }

  return Buffer.from(res.data)
}

exports.main = async (event) => {
  const start = Number(event.start || 0)
  const limit = Number(event.limit || 10)

  try {
    console.log('开始生成小程序码', { start, limit })

    const accessToken = await getAccessToken()
    console.log('access_token 获取成功')

    const questionRes = await db.collection('questions').get()
    const questions = questionRes.data || []

    if (!questions.length) {
      return {
        ok: false,
        msg: 'questions 集合为空，请先导入题库'
      }
    }

    const sliced = questions.slice(start, start + limit)
    const results = []

    for (const item of sliced) {
      const qid = item.qid || item._id
      console.log('正在生成', qid)

      const buffer = await generateMiniCode(accessToken, qid)

      const cloudPath = `mini-codes/${qid}.png`
      const uploadRes = await cloud.uploadFile({
        cloudPath,
        fileContent: buffer
      })

      results.push({
        qid,
        fileID: uploadRes.fileID
      })
    }

    return {
      ok: true,
      count: results.length,
      list: results
    }
  } catch (err) {
    console.error('batchGenerateMiniCodes 失败', err)
    return {
      ok: false,
      msg: '云函数执行失败',
      error: err.message
    }
  }
}