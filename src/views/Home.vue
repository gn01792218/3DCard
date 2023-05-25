<template>
  <section
    class="relative z-[-1] flex justify-center items-center min-h-screen"
    :style="`background:url(${bodyBackgroundImg}) no-repeat;
    background-size: 100% 100%;
    `"
  >
    <section class="card-box" v-if="lotteryList.length">
      <div
        class="card-item"
        v-for="(card, index) in lotteryList"
        :key="card.name"
        :style="`--i: ${index}; 
        transform:rotateX( calc(var(--i)*${rotateDeg}deg) ) translateZ(${rainWidth}px); 
        border-radius:${lotteryItemsRadius};
        border:${lotteryItemsBorder}`"
      >
        <img :src="card.img" :alt="card.name" />
      </div>
    </section>
    <p v-else class="text-white">目前沒有任何獎項</p>
  </section>
  <section class="w-full flex justify-center">
    <button class="lottery-btn" @click="lottery" v-show="showLotteryBtn">
      抽獎
    </button>
  </section>
  <LotteryModal
    v-show="showLottery"
    :show="showLottery"
    :lottery="lotteryList[winlotteryIndex]"
    @close="showLottery = false"
  />
</template>
<script setup lang="ts">
import LotteryModal from "@/commonComponents/LotteryModal.vue";
import { Lottery } from "@/types/lottery";
import { getLotteryItems, getLotteryWinner, getStyleConfig } from "@/api";

setStyle()
setLotteryList()

onMounted(() => {
  initCardBoxRainSize()
  addCardBoxResponsive()
})

/**
 * lottery控制
 */
let lotteryList = ref<Lottery[]>([])
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
  if (rotateDeg.value < 360) deg = baseRotateAngle + deg
  return deg
}

const lottery = async () => {
  await setwinLotteryIndex()
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
const baseRotateAngle = 720
const rotateDeg = computed(() => 360 / lotteryList.value.length)
const mobileRainWidth = ref(250)
const desktopRainWidth = ref(400)
const rainWidth = ref(mobileRainWidth.value)
const lotteryItemsRadius = ref("10px")
const lotteryItemsBorder = ref("4px solid #ffffff")
const bodyBackgroundImg = ref("")

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
async function setLotteryList() {
  const res = await getLotteryItems()
  lotteryList.value = res?.data
}
async function setwinLotteryIndex() {
  return new Promise(async (resolve, reject) => {
    const res = await getLotteryWinner()
    winlotteryIndex.value = res?.data[0].winid - 1
    resolve("")
  });
}
async function setStyle(){
  const res = await getStyleConfig() 
  const { lotteryBorder, lotteryRadius, backgroundImg } = res?.data
  lotteryItemsBorder.value = lotteryBorder
  lotteryItemsRadius.value = lotteryRadius
  bodyBackgroundImg.value = backgroundImg
}
</script>
