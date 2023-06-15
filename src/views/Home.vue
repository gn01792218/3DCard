<template>
  <section
    class="relative z-[-1] flex justify-center items-center min-h-screen"
    :style="`background:url(${bodyBackgroundImg}) no-repeat;
    background-size: 100% 100%;
    `"
  >
    <section class="card-box" v-if="lotteryList.length">
      <div
        v-for="(card, index) in lotteryList"
        :key="card.name"
        :style="`--i: ${index}; 
        background-color:${lotteryItemBackgroundColor};
        transform:rotateX( calc(var(--i)*${rotateDeg}deg) ) translateZ(${rainWidth}px); 
        border-radius:${lotteryItemsRadius};
        border:${lotteryItemsBorder}`"
      >
        <img :src="card.img" :alt="card.name"/>
      </div>
    </section>
    <p v-else class="text-white">目前沒有任何獎項</p>
  </section>
  <section class="relative w-full flex justify-center">
   <p class="absolute bottom-2 text-gray-200 font-extrabold">使用者Id : {{ userId }}</p>
    <button 
    class="lottery-btn bg-red-50" 
    :class="{'animate-bounce':lotteryBtnAnimation}"
    :style="`
    background-color:${lotteryBtnStyleConfig.backgroundColor};
    border-radius:${lotteryBtnStyleConfig.borderRadius};
    border:${lotteryBtnStyleConfig.border};
    `"
    @click="lottery" 
    v-show="showLotteryBtn">
      {{ lotteryBtnStyleConfig.text }}
    </button>
  </section>
  <LotteryModal
    v-show="showLottery"
    :show="showLottery"
    :lottery="lotteryList[winlotteryIndex]"
    :winLotteryInfo="winLotteryInfo"
    :getLotteryBtnStyleConfig="getLotteryBtnStyleConfig"
    :cancelBtnStyleConfig="cancelBtnStyleConfig"
    @close="showLottery = false"
  />
  <img v-if="showLottery" class="absolute top-0 z-[11]" :src="winMovie" alt="得獎動畫">
</template>
<script setup lang="ts">
import LotteryModal from "@/commonComponents/LotteryModal.vue";
import { Lottery, WinLotteryInfo } from "@/types/lottery";
import { BottonStyleConfig } from '@/types/gloable'
import { getGameInit, getLotteryItems, getLotteryWinner, getStyleConfig, setFinish } from "@/api";
import { useRoute } from "vue-router";

gameInit()
setStyleConfig()
setLotteryList()

onMounted(() => {
  initCardBoxRainSize()
  addCardBoxResponsive()
})

/**
 * 獲取使用者相關訊息
 */
const route = useRoute()
const userId = ref(route.params.id)

/**
 * lottery控制
 */
let lotteryList = ref<Lottery[]>([])
const winLotteryInfo = ref<WinLotteryInfo | null>(null)
const winlotteryIndex = ref(0) //抽中的獎項index,根據資料來源index可能不同
const getCardBoxElement = (): HTMLElement => {
  return document.querySelector(".card-box") as HTMLElement;
}
const getCardBoxAnimation = (element: HTMLElement): Animation => {
  return element.getAnimations()[0]
}
const setRandomWinLotteryIndex = () => {
  //前端自己random用
  winlotteryIndex.value = Math.floor(Math.random() * lotteryList.value.length);
}
const getLotteryAngle = (winLotteryIndex: number) => {
  let deg = (winLotteryIndex + 1) * rotateDeg.value
  if (rotateDeg.value < 360) deg = baseRotateAngle.value + deg
  return deg
}

const lottery = async () => {
  if(!lotteryList.value.length) return 
  await setwinLottery()
  // setRandomWinLotteryIndex()
  showLottery.value = false
  showLotteryBtn.value = false
  const cardBoxElement = getCardBoxElement()
  const cardBoxAnimation = getCardBoxAnimation(cardBoxElement)
  if (cardBoxAnimation) {
    cardBoxAnimation.cancel()
  }
  cardBoxElement.animate(
    [
      { transform: "perspective(1000px) rotateX(0deg);", easing: "ease-in" },
      {
        transform: `perspective(1000px) rotateX(${getLotteryAngle(
          winlotteryIndex.value
        )}deg)`,
      },
    ],
    {
      duration: 5000,
      fill: "both",
      easing: "ease-out",
    }
  )

  await getCardBoxAnimation(cardBoxElement).finished
  showLottery.value = true
  showLotteryBtn.value = true
}

/**
 * 基本變數調整
 */
const rotateDeg = computed(() => 360 / lotteryList.value.length)
const mobileRainWidth = ref(250)
const desktopRainWidth = ref(400)
const rainWidth = ref(mobileRainWidth.value)
//below property will fetch StyleConfig to modify
const baseRotateAngle = ref(720)
const lotteryItemsRadius = ref("10px")
const lotteryItemBackgroundColor = ref("#ffffff")
const lotteryItemsBorder = ref("4px solid #ffffff")
const bodyBackgroundImg = ref("")
const lotteryBtnAnimation = ref(false)
const lotteryBtnStyleConfig = ref<BottonStyleConfig>({
  text:"",
  backgroundColor:"",
  border:"none",
  borderRadius:"6px"
})
const getLotteryBtnStyleConfig = ref<BottonStyleConfig>({
  text:"",
  backgroundColor:"",
  border:"none",
  borderRadius:"6px"
})
const cancelBtnStyleConfig = ref<BottonStyleConfig>({
  text:"",
  backgroundColor:"",
  border:"none",
  borderRadius:"6px"
})
const winMovie =ref('')
/**
 * 畫面顯示控制
 */
const showLottery = ref(false)
const showLotteryBtn = ref(true)

/**
 * RWD控制
 */
const mqlMin768 = window.matchMedia("(min-width :768px)")
const initCardBoxRainSize = () => {
  if (mqlMin768.matches) rainWidth.value = desktopRainWidth.value
}
const addCardBoxResponsive = () => {
  mqlMin768.addEventListener("change", () => {
    if (mqlMin768.matches && rainWidth.value !== desktopRainWidth.value) rainWidth.value = desktopRainWidth.value
    else rainWidth.value = mobileRainWidth.value
  })
};

/**
 * API
 */
async function gameInit(){
  getGameInit()?.then(res=>{
    document.title = res.data.title
  })
}
async function setLotteryList() {
  const res = await getLotteryItems()
  lotteryList.value = res?.data
}
async function setwinLottery() {
  return new Promise(async (resolve, reject) => {
    const res = await getLotteryWinner()
    setFinish({
      SN:res?.data[0].SN
    })
    winLotteryInfo.value = res?.data[0] 
    winlotteryIndex.value = res?.data[0].winid - 1
    resolve("")
  });
}
async function setStyleConfig(){
  const res = await getStyleConfig() 
  const { 
    lotteryBtn,
    getLotteryBtn,
    cancelBtn,
    rolling,
    lotteryBackgroundColor,
    lotteryBorder, 
    lotteryRadius, 
    backgroundImg,
    buttonjumping,
    winmovie
   } = res?.data
  lotteryBtnStyleConfig.value = lotteryBtn
  getLotteryBtnStyleConfig.value = getLotteryBtn,
  cancelBtnStyleConfig.value = cancelBtn,
  baseRotateAngle.value = rolling * 360
  lotteryItemBackgroundColor.value = lotteryBackgroundColor
  lotteryItemsBorder.value = lotteryBorder
  lotteryItemsRadius.value = lotteryRadius
  bodyBackgroundImg.value = backgroundImg
  lotteryBtnAnimation.value = Boolean(buttonjumping)
  winMovie.value = winmovie
}
</script>
