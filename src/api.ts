import req from './http'
import { FinishData } from '@/types/lottery'
export const getLotteryItems = () => {
  return req('get','GetItem.php')
}
export const getLotteryWinner = () => {
  return req('get','GetWinner.php')
}
export const getStyleConfig = () => {
  return req('get', 'GetStyleConfig.php')
}
export const setFinish = (finishData:FinishData) => {
  return req('post','SetFinish.php',finishData)
}