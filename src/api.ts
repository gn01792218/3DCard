import req from './http'
import { FinishData, GetWinnerRequest } from '@/types/lottery'
export const getGameInit = () => {
  return req('get','GetGameInit.php')
}
export const getLotteryItems = () => {
  return req('get','GetItem.php')
}
export const getLotteryWinner = (getLotteryWinnerRequest:GetWinnerRequest) => {
  return req('post','GetWinner.php', getLotteryWinnerRequest)
}
export const getStyleConfig = () => {
  return req('get', 'GetStyleConfig.php')
}
export const setFinish = (finishData:FinishData) => {
  return req('post','SetFinish.php',finishData)
}