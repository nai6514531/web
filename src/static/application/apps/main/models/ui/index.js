export default {
  namespace: 'ui',
  state: {
    visible: false,
    fold: true
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
