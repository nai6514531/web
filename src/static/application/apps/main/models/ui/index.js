export default {
  namespace: 'ui',
  state: {
    visible: false,
    fold: false
  },
  reducers: {
    popMenu(state, { payload: { visible } }) {
      return { ...state, visible }
    },
    foldMenu(state, { payload: { fold } }) {
      return { ...state, fold }
    }
  },
}
