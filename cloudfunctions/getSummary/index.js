const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    const res = await db.collection('records').where({
      openid: OPENID
    }).get()

    const list = res.data || []
    const totalScore = list.reduce((sum, item) => sum + Number(item.score || 0), 0)
    const correctCount = list.filter(item => item.isCorrect).length

    return {
      ok: true,
      list,
      count: list.length,
      totalScore,
      correctCount
    }
  } catch (err) {
    return {
      ok: false,
      msg: '获取汇总失败',
      error: err.message
    }
  }
}