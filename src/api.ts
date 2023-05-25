import req from './http'
export const getLotteryItems = () => {
  return req('get','GetItem.php')
}
export const getLotteryWinner = () => {
  return req('get','GetWinner.php')
}
export const getStyleConfig = () => {
  return req('get', 'GetStyleConfig.php')
}