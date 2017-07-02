export async function getTimestamp (ctx) {
  ctx.body = {
    timestamp: Date.now()
  }
}
