const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { qid } = event

  if (!qid) {
    return {
      ok: false,
      msg: '缺少 qid'
    }
  }

  try {
    const res = await db.collection('questions').doc(qid).get()

    return {
      ok: true,
      question: res.data
    }
  } catch (err) {
    return {
      ok: false,
      msg: '题目不存在',
      error: err.message
    }
  }
}