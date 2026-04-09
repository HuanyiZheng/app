const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { qid, selectedIndex } = event

  if (!qid || selectedIndex === undefined || selectedIndex === null) {
    return { ok: false, msg: '参数不完整' }
  }

  try {
    // 先检查是否已经答过
    const existRes = await db.collection('records').where({
      openid: OPENID,
      qid
    }).get()

    if (existRes.data.length > 0) {
      return {
        ok: false,
        msg: '这道题你已经答过了，不能重复作答'
      }
    }

    const questionRes = await db.collection('questions').doc(qid).get()
    const question = questionRes.data

    if (!question || !question.options || !question.options[selectedIndex]) {
      return { ok: false, msg: '选项不存在' }
    }

    const selectedOption = question.options[selectedIndex]
    const correctAnswerKey = question.answer
    const correctOption =
      (question.options || []).find(item => item.key === correctAnswerKey) || null

    const isCorrect = Number(selectedOption.score || 0) > 0

    const recordData = {
      openid: OPENID,
      qid,
      title: question.title,
      answerIndex: selectedIndex,
      answerKey: selectedOption.key,
      answerText: selectedOption.text,
      score: Number(selectedOption.score || 0),
      isCorrect,
      correctAnswerKey,
      correctAnswerText: correctOption ? correctOption.text : '',
      updatedAt: Date.now()
    }

    await db.collection('records').add({
      data: recordData
    })

    return {
      ok: true,
      record: recordData
    }
  } catch (err) {
    return {
      ok: false,
      msg: '提交失败',
      error: err.message
    }
  }
}