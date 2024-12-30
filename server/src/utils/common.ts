const MONEY_PER_HOUR = 5000

export const getBill = (date: string) => {
  const isoTimestamp = new Date(date).getTime()
  console.log(isoTimestamp)

  const nowTimestamp = Date.now()
  const difference = nowTimestamp - isoTimestamp

  const money = Math.ceil(difference / 3600000) * MONEY_PER_HOUR

  return money
}
