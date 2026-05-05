export type Locale = 'en' | 'cn'

interface TranslationDict {
  nav: {
    brand: string
    en: string
    cn: string
    about: string
  }
  controls: {
    photo: string
    uploadPhoto: string
    replacePhoto: string
    title: string
    enterTitle: string
    date: string
    reset: string
    splitRatio: string
    fontSize: string
    backgroundColor: string
    random: string
    grain: string
    on: string
    off: string
    exportPng: string
  }
  preview: {
    placeholder: string
  }
}

export const translations: Record<Locale, TranslationDict> = {
  en: {
    nav: {
      brand: 'Color Diary',
      en: 'EN',
      cn: 'CN',
      about: 'ABOUT',
    },
    controls: {
      photo: 'PHOTO',
      uploadPhoto: 'UPLOAD PHOTO',
      replacePhoto: 'REPLACE PHOTO',
      title: 'TITLE',
      enterTitle: 'ENTER TITLE...',
      date: 'DATE',
      reset: 'RESET',
      splitRatio: 'SPLIT RATIO',
      fontSize: 'FONT SIZE',
      backgroundColor: 'BACKGROUND COLOR',
      random: 'RANDOM',
      grain: 'GRAIN',
      on: 'ON',
      off: 'OFF',
      exportPng: 'EXPORT AS PNG',
    },
    preview: {
      placeholder: 'Upload a photo to get started',
    },
  },
  cn: {
    nav: {
      brand: 'Color Diary',
      en: 'EN',
      cn: 'CN',
      about: '关于',
    },
    controls: {
      photo: '照片',
      uploadPhoto: '上传照片',
      replacePhoto: '替换照片',
      title: '标题',
      enterTitle: '输入标题...',
      date: '日期',
      reset: '重置',
      splitRatio: '上下比例',
      fontSize: '字体大小',
      backgroundColor: '背景颜色',
      random: '随机',
      grain: '颗粒感',
      on: '开',
      off: '关',
      exportPng: '导出 PNG',
    },
    preview: {
      placeholder: '上传照片开始创作',
    },
  },
}

export type Translations = TranslationDict
