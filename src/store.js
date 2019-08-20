import Vue from 'vue'
import Vuex from 'vuex'
import Cookies from 'js-cookie'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
      token: null,
      tokenExpire: null,
      tagsStoreList: [],
      language: Cookies.get('language') || 'en',
      whid :null,
  },
  mutations: {
      saveToken(state, data) {
          state.token = data;
          window.localStorage.setItem("Token", data);
      },
      saveTokenExpire(state, data) {
          state.tokenExpire = data;
          window.localStorage.setItem("TokenExpire", data);
      },
      saveTagsData(state, data) {
          state.tagsStoreList = data;
          sessionStorage.setItem("Tags",data)
      },
      SET_LANGUAGE: (state, language) => {
          state.language = language
          Cookies.set('language', language)
      },
      saveWhid(state, data) {
        state.whid = data;
        window.localStorage.setItem("Whid", data);
    },
  },
  actions: {
      setLanguage({ commit }, language) {
          commit('SET_LANGUAGE', language)
      },

  }
})
