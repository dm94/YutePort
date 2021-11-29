import i18n from "i18next";

i18n.init({
  lng: localStorage.getItem("i18nextLng"),
  fallbackLng: "en",
  debug: false,
  preload: ["en"],
  keySeparator: false,

  defaultNS: "translation",

  interpolation: {
    escapeValue: false,
    formatSeparator: ",",
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
